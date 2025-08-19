# GitHub Secrets設定確認手順

## 1. GitHubでSecretsを確認する方法

1. **GitHubリポジトリにアクセス**:
   ```
   https://github.com/MochiBullet/rental-booking-app
   ```

2. **Settingsタブをクリック**

3. **左サイドバーの「Secrets and variables」→「Actions」をクリック**

4. **Repository secretsで以下3つが設定されているか確認**:
   - `AWS_ACCESS_KEY_ID` ✅/❌
   - `AWS_SECRET_ACCESS_KEY` ✅/❌
   - `S3_BUCKET_NAME` ✅/❌

## 2. 必要なS3バケット名

以下のいずれかが正しいバケット名:
- `rental-booking-app-bucket`
- `rental-booking-app-production-276291855506`

## 3. GitHub Actions実行ログの確認

1. **Actionsタブをクリック**:
   ```
   https://github.com/MochiBullet/rental-booking-app/actions
   ```

2. **最新のワークフロー実行をクリック**

3. **「Deploy to AWS S3」ジョブをクリック**

4. **エラーログを確認**:
   - `Error: The specified key does not exist.` → AWS認証情報問題
   - `AccessDenied` → S3権限問題
   - `The specified bucket does not exist` → バケット名問題

## 4. よくあるエラーと解決策

### エラー1: Secretsが未設定
```
Error: AWS credentials not found
```
**解決策**: 上記手順でSecretsを設定

### エラー2: バケット名が間違っている
```
The specified bucket does not exist
```
**解決策**: 正しいバケット名を`S3_BUCKET_NAME`に設定

### エラー3: AWS権限不足
```
AccessDenied: User is not authorized to perform: s3:PutObject
```
**解決策**: AWS IAMユーザーにS3フルアクセス権限を付与

## 5. 緊急時の代替デプロイ方法

### Vercel（推奨）:
1. https://vercel.com でGitHubログイン
2. リポジトリインポート
3. 自動デプロイ

### Netlify:
1. https://netlify.com でGitHubログイン  
2. リポジトリインポート
3. 自動デプロイ

## 6. 確認すべきポイント

- [ ] GitHub Secrets が3つとも設定済み
- [ ] AWS認証情報が有効
- [ ] S3バケット名が正確
- [ ] GitHub Actionsが実行されている
- [ ] ワークフローでエラーが発生していない