#!/bin/bash

# RentalEasy 最小コスト AWS データベース - ワンクリックデプロイ
# 推定コスト: $0-3/月 (AWS無料利用枠内)

set -e  # エラー時に停止

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 設定
ENVIRONMENT="dev"
STACK_NAME="rentaleasy-minimal-${ENVIRONMENT}"
REGION="ap-southeast-2"  # シドニー（レイテンシ最適）

echo -e "${BLUE}🚀 RentalEasy 最小コスト AWS デプロイ開始${NC}"
echo -e "${YELLOW}推定月額料金: $0-3 (AWS無料利用枠内)${NC}"
echo ""

# 前提条件チェック
check_prerequisites() {
    echo -e "${BLUE}📋 前提条件チェック...${NC}"
    
    # AWS CLI チェック
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}❌ AWS CLI がインストールされていません${NC}"
        echo "インストール: https://aws.amazon.com/cli/"
        exit 1
    fi
    
    # AWS 認証情報チェック
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}❌ AWS 認証情報が設定されていません${NC}"
        echo "設定: aws configure"
        exit 1
    fi
    
    # Node.js チェック
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js がインストールされていません${NC}"
        echo "インストール: https://nodejs.org/"
        exit 1
    fi
    
    echo -e "${GREEN}✅ 前提条件OK${NC}"
}

# CloudFormation デプロイ
deploy_infrastructure() {
    echo -e "${BLUE}🏗️ インフラストラクチャデプロイ...${NC}"
    
    aws cloudformation create-stack \
        --stack-name "$STACK_NAME" \
        --template-body file://minimal-template.yaml \
        --parameters ParameterKey=Environment,ParameterValue="$ENVIRONMENT" \
        --capabilities CAPABILITY_NAMED_IAM \
        --region "$REGION" \
        --tags Key=Project,Value=RentalEasy Key=CostCenter,Value=Development

    echo -e "${YELLOW}⏳ スタック作成中... (通常2-3分)${NC}"
    
    # デプロイ完了まで待機
    aws cloudformation wait stack-create-complete \
        --stack-name "$STACK_NAME" \
        --region "$REGION"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ インフラストラクチャデプロイ完了${NC}"
    else
        echo -e "${RED}❌ インフラストラクチャデプロイ失敗${NC}"
        exit 1
    fi
}

# 出力値取得
get_outputs() {
    echo -e "${BLUE}📊 デプロイ結果取得...${NC}"
    
    # CloudFormation出力値を取得
    TABLE_NAME=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`MainTableName`].OutputValue' \
        --output text)
    
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayUrl`].OutputValue' \
        --output text)
    
    ROLE_ARN=$(aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --region "$REGION" \
        --query 'Stacks[0].Outputs[?OutputKey==`LambdaExecutionRoleArn`].OutputValue' \
        --output text)

    echo -e "${GREEN}📋 デプロイ完了情報:${NC}"
    echo "  🗄️  DynamoDB Table: $TABLE_NAME"
    echo "  🌐 API Gateway URL: $API_URL"
    echo "  🔑 Lambda Role: $ROLE_ARN"
}

# 環境設定ファイル作成
create_env_file() {
    echo -e "${BLUE}⚙️ 環境設定ファイル作成...${NC}"
    
    # React用の環境変数ファイル作成
    cat > ../.env.aws << EOF
# AWS データベース設定 (自動生成)
REACT_APP_USE_DYNAMODB=true
REACT_APP_API_BASE_URL=$API_URL
REACT_APP_AWS_REGION=$REGION
REACT_APP_DYNAMODB_TABLE=$TABLE_NAME
REACT_APP_USE_LOCAL_STORAGE=false

# 生成日時: $(date)
EOF

    # Lambda デプロイ用設定
    cat > lambda-config.json << EOF
{
  "environment": "$ENVIRONMENT",
  "region": "$REGION",
  "tableName": "$TABLE_NAME",
  "roleArn": "$ROLE_ARN",
  "apiGatewayUrl": "$API_URL"
}
EOF

    echo -e "${GREEN}✅ 設定ファイル作成完了${NC}"
    echo "  📝 ../.env.aws - React環境変数"
    echo "  📝 lambda-config.json - Lambda設定"
}

# コスト監視設定
setup_cost_monitoring() {
    echo -e "${BLUE}💰 コスト監視設定...${NC}"
    
    # CloudWatch ダッシュボード作成
    aws cloudwatch put-dashboard \
        --dashboard-name "RentalEasy-${ENVIRONMENT}-Costs" \
        --dashboard-body '{
            "widgets": [
                {
                    "type": "metric",
                    "properties": {
                        "metrics": [
                            ["AWS/Billing", "EstimatedCharges", "Currency", "USD"]
                        ],
                        "period": 86400,
                        "stat": "Maximum",
                        "region": "us-east-1",
                        "title": "Estimated Monthly Charges"
                    }
                }
            ]
        }' \
        --region "$REGION"
    
    echo -e "${GREEN}✅ コスト監視ダッシュボード作成完了${NC}"
}

# メイン実行
main() {
    echo -e "${BLUE}===========================================${NC}"
    echo -e "${BLUE}🏆 RentalEasy 最小コストデプロイスクリプト${NC}"
    echo -e "${BLUE}===========================================${NC}"
    echo ""
    
    check_prerequisites
    echo ""
    
    deploy_infrastructure
    echo ""
    
    get_outputs
    echo ""
    
    create_env_file
    echo ""
    
    setup_cost_monitoring
    echo ""
    
    echo -e "${GREEN}🎉 デプロイ完了！${NC}"
    echo ""
    echo -e "${YELLOW}📋 次のステップ:${NC}"
    echo "1. Lambda関数デプロイ: cd lambda && ./deploy-functions.sh"
    echo "2. React環境変数適用: cp .env.aws .env"
    echo "3. React アプリ再ビルド: npm run build"
    echo ""
    echo -e "${YELLOW}💰 コスト情報:${NC}"
    echo "• 現在のリソース: AWS無料利用枠内"
    echo "• 予想月額: $0-3"
    echo "• 監視ダッシュボード: AWS Console > CloudWatch"
    echo ""
    echo -e "${BLUE}🔗 有用なリンク:${NC}"
    echo "• API Gateway: https://$REGION.console.aws.amazon.com/apigateway"
    echo "• DynamoDB: https://$REGION.console.aws.amazon.com/dynamodbv2"
    echo "• Lambda: https://$REGION.console.aws.amazon.com/lambda"
    echo "• コスト監視: https://console.aws.amazon.com/billing"
}

# スクリプト実行
main "$@"