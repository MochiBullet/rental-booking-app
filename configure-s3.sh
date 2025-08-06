#!/bin/bash

# S3バケット名
BUCKET_NAME="rental-booking-app-website"
REGION="ap-northeast-1"

echo "🔧 S3バケットの設定を開始します..."

# 1. パブリックアクセスブロックを解除
echo "📝 パブリックアクセスブロックを解除中..."
aws s3api put-public-access-block \
    --bucket $BUCKET_NAME \
    --public-access-block-configuration \
    "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# 2. バケットポリシーを設定
echo "📝 バケットポリシーを設定中..."
aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy '{
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "PublicReadGetObject",
                "Effect": "Allow",
                "Principal": "*",
                "Action": "s3:GetObject",
                "Resource": "arn:aws:s3:::rental-booking-app-website/*"
            }
        ]
    }'

# 3. 静的ウェブサイトホスティングを有効化
echo "🌐 静的ウェブサイトホスティングを有効化中..."
aws s3api put-bucket-website \
    --bucket $BUCKET_NAME \
    --website-configuration '{
        "IndexDocument": {
            "Suffix": "index.html"
        },
        "ErrorDocument": {
            "Key": "index.html"
        }
    }'

# 4. ファイルを再アップロード
echo "📤 ファイルを再アップロード中..."
aws s3 sync ~/projects/rental-booking-app/build/ s3://$BUCKET_NAME/ --delete

echo "✅ 設定完了！"
echo "📱 アクセスURL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"