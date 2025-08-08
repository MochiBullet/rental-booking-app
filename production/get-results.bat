@echo off
echo ========================================
echo デプロイ結果取得中...
echo ========================================
echo.

echo 📊 デプロイされたリソース一覧:
aws cloudformation describe-stacks --stack-name msbase-rental-prod --region ap-southeast-2 --query "Stacks[0].Outputs" --output table

echo.
echo.
echo 🌐 重要: お名前.com でのネームサーバー設定
echo.
echo 以下のネームサーバーをお名前.com に設定してください:
aws cloudformation describe-stacks --stack-name msbase-rental-prod --region ap-southeast-2 --query "Stacks[0].Outputs[?OutputKey=='NameServers'].OutputValue" --output text

echo.
echo.
echo 🎉 完成予定サイト: https://ms-base-rental.com
echo.
echo 📋 設定方法:
echo 1. お名前.com Navi にログイン
echo 2. DNS設定 → ネームサーバー設定
echo 3. 上記の4つのネームサーバーを入力
echo 4. 保存後、30分でサイト稼働開始！
echo.

pause