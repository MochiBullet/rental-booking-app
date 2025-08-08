@echo off
echo ========================================
echo デプロイ状況確認中...
echo ========================================
echo.

aws cloudformation describe-stacks --stack-name msbase-rental-prod --region ap-southeast-2 --query "Stacks[0].StackStatus" --output text

echo.
echo 📋 結果の見方:
echo - CREATE_IN_PROGRESS: まだ作成中 (もう少し待って再実行)
echo - CREATE_COMPLETE: 完了！ (get-results.bat を実行)
echo - CREATE_FAILED: 失敗 (エラー確認が必要)
echo.

pause