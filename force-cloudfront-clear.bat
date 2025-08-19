@echo off
echo ========================================
echo CloudFront強制キャッシュクリア
echo ========================================

echo すべてのCloudFrontディストリビューションをクリア中...

REM すべてのディストリビューションIDを取得してキャッシュクリア
aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,Comment,DomainName]" --output text > distributions.txt

echo.
echo 見つかったディストリビューション:
type distributions.txt

echo.
for /f "tokens=1" %%i in (distributions.txt) do (
    echo %%i のキャッシュを無効化中...
    aws cloudfront create-invalidation --distribution-id %%i --paths "/*"
    echo ✅ 完了: %%i
)

del distributions.txt

echo.
echo ========================================
echo キャッシュクリア完了！
echo.
echo 次の手順（重要）:
echo 1. ブラウザのキャッシュもクリア
echo    - Chrome: Ctrl+Shift+Delete → キャッシュされた画像とファイル
echo 2. ブラウザを完全に閉じる
echo 3. 5分待つ（CloudFront反映待ち）
echo 4. ブラウザを開いて https://ms-base-rental.com
echo 5. Ctrl+F5 でスーパーリロード
echo ========================================
pause