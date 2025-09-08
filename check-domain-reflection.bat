@echo off
echo ============================================
echo 🌐 独自ドメイン反映確認スクリプト
echo ============================================
echo.

echo 📊 現在のCloudFront無効化状況を確認中...
aws cloudfront list-invalidations --distribution-id E2ANNXZ9LL61PY --max-items 3

echo.
echo 🚀 GitHub Actions最新デプロイ状況:
echo https://github.com/MochiBullet/rental-booking-app/actions
echo.

echo 📱 確認すべきURL:
echo [1] 独自ドメイン: https://ms-base-rental.com/
echo [2] S3直接URL:   http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com/
echo.

echo ⏰ 反映待機時間の目安:
echo - 通常: 1-5分
echo - 最大: 15分
echo.

echo 🔄 手動でキャッシュクリアする場合:
echo aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*"
echo.

pause