#!/bin/bash

# S3バケットのエラードキュメント設定スクリプト
# React RouterのSPAリロード問題を解決

BUCKET_NAME="rental-booking-app-website"
REGION="ap-southeast-2"

echo "Setting up S3 error document for SPA routing..."

# S3バケットのウェブサイト設定を更新
aws s3api put-bucket-website \
  --bucket $BUCKET_NAME \
  --website-configuration '{
    "IndexDocument": {"Suffix": "index.html"},
    "ErrorDocument": {"Key": "404.html"}
  }' \
  --region $REGION

if [ $? -eq 0 ]; then
  echo "✅ S3 error document configured successfully!"
  echo "404 errors will now redirect to 404.html, which redirects to React Router"
else
  echo "❌ Failed to configure S3 error document"
  exit 1
fi

# CloudFrontのカスタムエラーレスポンス設定も推奨
echo ""
echo "📝 Note: Also configure CloudFront custom error pages:"
echo "   - 404 → /404.html (200 response code)"
echo "   - 403 → /404.html (200 response code)"
echo ""
echo "This ensures proper SPA routing for all paths"