@echo off
echo =====================================
echo AWS認証情報設定スクリプト
echo =====================================
echo.

echo このスクリプトはAWS認証情報を設定します。
echo 事前にAWS IAMユーザーのアクセスキーが必要です。
echo.

:menu
echo 設定方法を選択してください:
echo 1. 環境変数で設定（推奨）
echo 2. AWS CLIで設定
echo 3. 終了
echo.
set /p choice="選択 (1-3): "

if "%choice%"=="1" goto env_setup
if "%choice%"=="2" goto cli_setup
if "%choice%"=="3" goto end
goto menu

:env_setup
echo.
echo === 環境変数での設定 ===
echo.
set /p access_key="AWS Access Key ID を入力: "
set /p secret_key="AWS Secret Access Key を入力: "
set /p region="AWS Region を入力 [ap-northeast-1]: "
if "%region%"=="" set region=ap-northeast-1

echo.
echo 以下の設定を適用します:
echo Access Key ID: %access_key:~0,4%...（セキュリティのため一部表示）
echo Region: %region%
echo.
set /p confirm="続行しますか？ (y/n): "
if /i not "%confirm%"=="y" goto menu

setx AWS_ACCESS_KEY_ID "%access_key%"
setx AWS_SECRET_ACCESS_KEY "%secret_key%"
setx AWS_DEFAULT_REGION "%region%"

echo.
echo 環境変数を設定しました。
echo 新しいコマンドプロンプトを開いて有効になります。
echo.
pause
goto test_connection

:cli_setup
echo.
echo === AWS CLIでの設定 ===
echo.
where aws >nul 2>&1
if %errorlevel% neq 0 (
    echo AWS CLIがインストールされていません。
    echo https://aws.amazon.com/cli/ からダウンロードしてください。
    echo.
    pause
    goto menu
)

echo AWS CLIで設定を開始します...
aws configure
echo.
goto test_connection

:test_connection
echo.
echo === 接続テスト ===
echo.
echo AWS接続をテストしています...
aws sts get-caller-identity >nul 2>&1
if %errorlevel% equ 0 (
    echo 成功！AWS認証情報が正しく設定されました。
    echo.
    aws sts get-caller-identity
    echo.
    echo 次のステップ:
    echo 1. cd cdk
    echo 2. deploy.bat を実行してCDKをデプロイ
) else (
    echo エラー: AWS接続に失敗しました。
    echo 認証情報を確認してください。
)
echo.
pause
goto menu

:end
echo 終了します。
pause
exit /b