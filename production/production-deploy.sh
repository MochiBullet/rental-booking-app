#!/bin/bash

# M's BASE Rental 本番環境 ワンクリックデプロイ
# 独自ドメイン + AWS本格構成

set -e

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

# 設定
DOMAIN_NAME="${1:-ms-base-rental.tk}"
ENVIRONMENT="prod"
STACK_NAME="msbase-rental-${ENVIRONMENT}"
REGION="ap-southeast-2"

echo -e "${PURPLE}===============================================${NC}"
echo -e "${PURPLE}🚀 M's BASE Rental 本番環境デプロイ${NC}"
echo -e "${PURPLE}===============================================${NC}"
echo -e "${BLUE}ドメイン: ${DOMAIN_NAME}${NC}"
echo -e "${BLUE}環境: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}リージョン: ${REGION}${NC}"
echo ""

# ドメイン名の検証
validate_domain() {
    echo -e "${BLUE}🔍 ドメイン名検証...${NC}"
    
    if [[ ! $DOMAIN_NAME =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        echo -e "${RED}❌ 無効なドメイン名: $DOMAIN_NAME${NC}"
        echo "例: ms-base-rental.tk, msbase-rental.com"
        exit 1
    fi
    
    echo -e "${GREEN}✅ ドメイン名OK: $DOMAIN_NAME${NC}"
}

# AWS認証確認
check_aws_auth() {
    echo -e "${BLUE}🔐 AWS認証確認...${NC}"
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS認証エラー${NC}"
        echo "設定: aws configure"
        exit 1
    fi
    
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${GREEN}✅ AWSアカウント: $ACCOUNT_ID${NC}"
}

# 既存スタック確認
check_existing_stack() {
    echo -e "${BLUE}📋 既存インフラ確認...${NC}"
    
    if aws cloudformation describe-stacks --stack-name "$STACK_NAME" --region "$REGION" &> /dev/null; then
        echo -e "${YELLOW}⚠️ 既存スタックが存在します: $STACK_NAME${NC}"
        read -p "削除して再作成しますか？ (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}🗑️ 既存スタック削除中...${NC}"
            aws cloudformation delete-stack \
                --stack-name "$STACK_NAME" \
                --region "$REGION"
                
            aws cloudformation wait stack-delete-complete \
                --stack-name "$STACK_NAME" \
                --region "$REGION"
                
            echo -e "${GREEN}✅ 既存スタック削除完了${NC}"
        else
            echo -e "${RED}❌ デプロイ中止${NC}"
            exit 1
        fi
    fi
}

# インフラストラクチャデプロイ
deploy_infrastructure() {
    echo -e "${BLUE}🏗️ インフラストラクチャデプロイ開始...${NC}"
    
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://production-template.yaml \
        --parameters ParameterKey=DomainName,ParameterValue="$DOMAIN_NAME" \
                     ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$REGION" \
        --tags Key=Service,Value="M's BASE Rental" \
               Key=Environment,Value="$ENVIRONMENT" \
               Key=ManagedBy,Value="CloudFormation"

    echo -e "${YELLOW}⏳ インフラ構築中... (通常5-10分)${NC}"
    echo -e "${YELLOW}   SSL証明書の検証が必要な場合があります${NC}"
    
    # スタック作成完了を待機
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ インフラデプロイ完了${NC}"
    else
        echo -e "${RED}❌ インフラデプロイ失敗${NC}"
        
        # エラー詳細を表示
        aws cloudformation describe-stack-events \
            --stack-name "$STACK_NAME" \
            --region "$REGION" \
            --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`].[ResourceType,ResourceStatusReason]' \
            --output table
        exit 1
    fi
}

# 出力値取得
get_stack_outputs() {
    echo -e "${BLUE}📊 デプロイ結果取得...${NC}"
    
    # CloudFormation出力値を取得
    WEBSITE_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`WebsiteURL`].OutputValue' \
        --output text)
    
    CLOUDFRONT_ID=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
        --output text)
    
    S3_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
        --output text)
    
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`APIGatewayURL`].OutputValue' \
        --output text)
    
    NAME_SERVERS=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`NameServers`].OutputValue' \
        --output text)

    echo -e "${GREEN}🎉 インフラ構築完了！${NC}"
    echo ""
    echo -e "${PURPLE}📋 デプロイ情報:${NC}"
    echo -e "  🌐 ウェブサイト: $WEBSITE_URL"
    echo -e "  ☁️ CloudFront ID: $CLOUDFRONT_ID"
    echo -e "  🪣 S3 バケット: $S3_BUCKET"
    echo -e "  🔗 API URL: $API_URL"
    echo ""
    echo -e "${YELLOW}🔧 ドメイン設定 (重要):${NC}"
    echo -e "  ネームサーバー: $NAME_SERVERS"
    echo ""
}

# React本番ビルド & デプロイ
deploy_react_app() {
    echo -e "${BLUE}⚛️ React アプリケーションデプロイ...${NC}"
    
    # 本番環境変数設定
    cat > ../.env.production << EOF
# 本番環境設定 (自動生成)
REACT_APP_USE_DYNAMODB=true
REACT_APP_API_BASE_URL=$API_URL
REACT_APP_AWS_REGION=$REGION
REACT_APP_USE_LOCAL_STORAGE=false
REACT_APP_ENVIRONMENT=production
GENERATE_SOURCEMAP=false
EOF

    # 本番ビルド実行
    cd ..
    echo -e "${YELLOW}📦 React アプリビルド中...${NC}"
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ React ビルド失敗${NC}"
        exit 1
    fi
    
    # S3にデプロイ
    echo -e "${YELLOW}🚀 S3にアップロード中...${NC}"
    aws s3 sync build/ s3://$S3_BUCKET/ --delete --region $REGION
    
    # CloudFront キャッシュクリア
    echo -e "${YELLOW}🔄 CloudFront キャッシュクリア中...${NC}"
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_ID \
        --paths "/*" \
        --region $REGION
    
    cd production
    echo -e "${GREEN}✅ React アプリデプロイ完了${NC}"
}

# セキュリティ設定
setup_security() {
    echo -e "${BLUE}🔐 セキュリティ設定...${NC}"
    
    # CloudWatch ダッシュボード作成
    aws cloudwatch put-dashboard \
        --dashboard-name "MSBaseRental-Production" \
        --dashboard-body '{
            "widgets": [
                {
                    "type": "metric",
                    "properties": {
                        "metrics": [
                            ["AWS/CloudFront", "Requests", "DistributionId", "'$CLOUDFRONT_ID'"],
                            [".", "BytesDownloaded", ".", "."],
                            ["AWS/Billing", "EstimatedCharges", "Currency", "USD"]
                        ],
                        "period": 300,
                        "stat": "Sum",
                        "region": "'$REGION'",
                        "title": "M'\''s BASE Rental - Production Metrics"
                    }
                }
            ]
        }' \
        --region $REGION
    
    echo -e "${GREEN}✅ セキュリティ & 監視設定完了${NC}"
}

# メイン実行
main() {
    validate_domain
    check_aws_auth
    check_existing_stack
    deploy_infrastructure
    get_stack_outputs
    deploy_react_app
    setup_security
    
    echo ""
    echo -e "${PURPLE}🎉🎉🎉 デプロイ完了！🎉🎉🎉${NC}"
    echo ""
    echo -e "${GREEN}✅ M's BASE Rental が本番環境で稼働中${NC}"
    echo -e "${GREEN}🌐 URL: $WEBSITE_URL${NC}"
    echo ""
    echo -e "${YELLOW}📋 次のステップ:${NC}"
    echo -e "1. ドメインプロバイダーでネームサーバーを設定"
    echo -e "   ネームサーバー: $NAME_SERVERS"
    echo -e "2. SSL証明書の自動検証完了を待機 (通常5-10分)"
    echo -e "3. サイトアクセステスト: $WEBSITE_URL"
    echo ""
    echo -e "${BLUE}🔗 管理リンク:${NC}"
    echo -e "• CloudFront: https://$REGION.console.aws.amazon.com/cloudfront/home"
    echo -e "• Route53: https://console.aws.amazon.com/route53/v2/hostedzones"
    echo -e "• 監視: https://$REGION.console.aws.amazon.com/cloudwatch"
    echo -e "• コスト: https://console.aws.amazon.com/billing"
    echo ""
    echo -e "${GREEN}🚀 M's BASE Rental へようこそ！${NC}"
}

# 引数チェック
if [ "$1" = "--help" ] || [ "$1" = "-h" ]; then
    echo "使用方法: $0 [ドメイン名]"
    echo "例: $0 ms-base-rental.tk"
    echo "例: $0 msbase-rental.com"
    exit 0
fi

# 実行確認
echo -e "${YELLOW}⚠️ 本番環境デプロイを開始しますか？${NC}"
echo -e "ドメイン: $DOMAIN_NAME"
echo -e "推定料金: $5-15/月"
read -p "続行しますか？ (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    main
else
    echo -e "${YELLOW}❌ デプロイを中止しました${NC}"
    exit 0
fi