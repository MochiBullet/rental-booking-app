# 🔑 作成したAWSアクセスキーの使用先

## 📋 取得したキーの使用箇所

作成したアクセスキーは以下の2箇所で使用します：

### 1. 🖥️ **ローカル環境（今すぐ必要）**

#### 使用方法
```bash
configure-aws.bat
```

#### 設定内容
このコマンドを実行すると、以下が聞かれます：
```
AWS Access Key ID [None]: ← ここに入力
AWS Secret Access Key [None]: ← ここに入力
Default region name [None]: ap-southeast-2
Default output format [None]: json
```

#### 入力する値
- **AWS Access Key ID**: `AKIA******************`
- **AWS Secret Access Key**: `****************************************`
- **Default region name**: `ap-southeast-2`
- **Default output format**: `json`

### 2. 🔄 **GitHub Actions（自動デプロイ用）**

#### 設定場所
GitHubリポジトリの設定画面：
https://github.com/MochiBullet/rental-booking-app/settings/secrets/actions

#### 設定する値
以下の3つのSecretsを追加：

```
Name: AWS_ACCESS_KEY_ID
Value: AKIA****************** ← 作成したAccess Key ID

Name: AWS_SECRET_ACCESS_KEY  
Value: **************************************** ← 作成したSecret Access Key

Name: S3_BUCKET_NAME
Value: msbase-rental-[ACCOUNT-ID] ← デプロイ後に表示される
```

## 🎯 **使用の流れ**

### ステップ1: ローカル設定（今すぐ）
```bash
configure-aws.bat  # アクセスキーを入力
execute-aws-setup.bat  # サイトをデプロイ
```

### ステップ2: GitHub設定（後で）
デプロイ成功後、自動デプロイのためにGitHub Secretsに設定

## 📱 **具体的な入力例**

### configure-aws.bat実行時の画面
```
AWS Access Key ID [None]: AKIAIOSFODNN7EXAMPLE
AWS Secret Access Key [None]: wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
Default region name [None]: ap-southeast-2
Default output format [None]: json
```

## 🔒 **セキュリティ注意事項**

### ✅ 安全な使用
- ローカルのconfigure-aws.batで入力
- GitHub Secretsに保存
- .csvファイルを安全な場所に保管

### ❌ 危険な行為
- コードに直接記載
- パブリックリポジトリにコミット
- チャットやメールで共有

## 🚀 **次のアクション**

1. **今すぐ実行**:
   ```bash
   configure-aws.bat
   ```
   ↑ここで作成したキーを入力

2. **デプロイ実行**:
   ```bash
   execute-aws-setup.bat
   ```

3. **GitHub設定**（後で）:
   サイト動作確認後にGitHub Secretsを設定

## 📝 **キーの確認方法**

もしキーを忘れた場合：
1. AWSコンソール → IAM → Users → 作成したユーザー
2. Security credentialsタブ
3. Access keysセクションで確認（Secret keyは再表示不可）

---

**まずは `configure-aws.bat` を実行して、作成したキーを入力してください！**