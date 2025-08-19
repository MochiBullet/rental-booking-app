# AWS認証情報設定ガイド

## 1. AWS IAMユーザーの作成

### 1.1 AWS Management Consoleにログイン
1. https://console.aws.amazon.com/ にアクセス
2. ルートユーザーまたは管理者権限のあるIAMユーザーでログイン

### 1.2 IAMユーザーの作成
1. **IAMサービス**を開く
2. 左メニューの「**ユーザー**」をクリック
3. 「**ユーザーを追加**」ボタンをクリック
4. ユーザー詳細を設定:
   - ユーザー名: `cdk-deploy-user`
   - アクセスの種類: 「**プログラムによるアクセス**」にチェック

### 1.3 権限の設定
1. 「**既存のポリシーを直接アタッチ**」を選択
2. 以下のポリシーを検索して選択:
   - `AdministratorAccess` (初期設定用、後で制限可能)
   
   または、より安全な最小権限として:
   - `AmazonS3FullAccess`
   - `CloudFrontFullAccess`
   - `IAMFullAccess`
   - `CloudFormationFullAccess`

### 1.4 アクセスキーの保存
1. ユーザー作成完了画面で表示される:
   - **アクセスキーID** (例: AKIAIOSFODNN7EXAMPLE)
   - **シークレットアクセスキー** (例: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY)
2. **CSVダウンロード**ボタンで保存（重要：この画面を離れると二度と表示されません）

## 2. Windows環境での設定

### 方法1: 環境変数で設定（推奨）

```cmd
# コマンドプロンプトを管理者として実行
setx AWS_ACCESS_KEY_ID "あなたのアクセスキーID"
setx AWS_SECRET_ACCESS_KEY "あなたのシークレットアクセスキー"
setx AWS_DEFAULT_REGION "ap-northeast-1"
```

### 方法2: AWS CLIで設定

1. **AWS CLIのインストール**（未インストールの場合）
   - https://aws.amazon.com/cli/ から最新版をダウンロード
   - インストーラーを実行

2. **認証情報の設定**
```cmd
aws configure
```

プロンプトに従って入力:
```
AWS Access Key ID [None]: あなたのアクセスキーID
AWS Secret Access Key [None]: あなたのシークレットアクセスキー
Default region name [None]: ap-northeast-1
Default output format [None]: json
```

### 方法3: 認証ファイルの直接作成

1. ユーザーホームディレクトリに`.aws`フォルダを作成
   ```cmd
   mkdir %USERPROFILE%\.aws
   ```

2. `credentials`ファイルを作成
   ```cmd
   notepad %USERPROFILE%\.aws\credentials
   ```

3. 以下の内容を記入して保存:
   ```ini
   [default]
   aws_access_key_id = あなたのアクセスキーID
   aws_secret_access_key = あなたのシークレットアクセスキー
   ```

4. `config`ファイルを作成
   ```cmd
   notepad %USERPROFILE%\.aws\config
   ```

5. 以下の内容を記入して保存:
   ```ini
   [default]
   region = ap-northeast-1
   output = json
   ```

## 3. 認証情報の確認

設定が正しく完了したか確認:

```cmd
aws sts get-caller-identity
```

成功すると以下のような出力が表示されます:
```json
{
    "UserId": "AIDAI23HXD2O5EXAMPLE",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/cdk-deploy-user"
}
```

## 4. CDKデプロイの実行

認証情報設定後、以下のコマンドでデプロイ:

```cmd
cd rental-booking-app\cdk
deploy.bat
```

## 5. セキュリティのベストプラクティス

### 重要な注意事項
- **アクセスキーを絶対に公開しない**（GitHub、メール、チャットなど）
- **定期的にアクセスキーをローテーション**（3ヶ月ごと推奨）
- **不要になったアクセスキーは即座に削除**
- **最小権限の原則**を適用（必要最小限の権限のみ付与）

### MFA（多要素認証）の有効化
1. IAMコンソールでユーザーを選択
2. 「セキュリティ認証情報」タブ
3. 「MFAデバイスの割り当て」をクリック
4. 仮想MFAデバイス（Google Authenticatorなど）を設定

## 6. トラブルシューティング

### エラー: "The security token included in the request is invalid"
- アクセスキーIDまたはシークレットアクセスキーが正しくない
- 解決策: `aws configure`で再設定

### エラー: "Unable to locate credentials"
- 認証情報が設定されていない
- 解決策: 上記の設定方法のいずれかを実行

### エラー: "Access Denied"
- IAMユーザーに必要な権限がない
- 解決策: IAMコンソールで権限を追加

## 7. GitHub Secretsへの設定（CI/CD用）

CDKデプロイ完了後、GitHub Actionsで使用するために:

1. GitHubリポジトリの**Settings**を開く
2. **Secrets and variables** → **Actions**
3. **New repository secret**で以下を追加:
   - `AWS_REGION`: ap-northeast-1
   - `S3_BUCKET_NAME`: (CDKデプロイ後に取得)
   - `AWS_ROLE_ARN`: (CDKデプロイ後に取得)
   - `CLOUDFRONT_DISTRIBUTION_ID`: (CDKデプロイ後に取得)

4. **Variables**タブで追加:
   - `USE_OIDC`: true

---

**注意**: このガイドの実行にはAWSアカウントが必要です。AWSアカウントをお持ちでない場合は、https://aws.amazon.com/ から無料で作成できます（12ヶ月間の無料利用枠あり）。