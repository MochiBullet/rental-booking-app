@echo off
echo ========================================
echo M's BASE Rental 本番デプロイ開始
echo ========================================
echo.

echo Step 1: ディレクトリ移動
cd /d C:\Users\hiyok\projects\rental-booking-app\production

echo Step 2: AWS CloudFormation デプロイ実行
echo デプロイ中... (5-10分かかります)
aws cloudformation create-stack --stack-name msbase-rental-prod --template-body file://production-template.yaml --parameters ParameterKey=DomainName,ParameterValue=ms-base-rental.com ParameterKey=Environment,ParameterValue=prod --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-2

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ デプロイ開始成功！
    echo.
    echo 📋 次のステップ:
    echo 1. 5-10分待つ
    echo 2. check-status.bat を実行して完了確認
    echo 3. 完了後、get-results.bat で結果取得
    echo.
) else (
    echo ❌ デプロイ開始失敗
    echo AWS CLIの設定を確認してください
)

pause