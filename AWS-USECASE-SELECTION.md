# 🔑 AWS アクセスキー作成 - ユースケース選択

## 📋 アクセスキー作成時のユースケース選択

IAMユーザーの「Security credentials」→「Create access key」をクリックした際に表示される画面：

### 🎯 **選択すべきユースケース**

#### ✅ **Command Line Interface (CLI)**
```
○ Command Line Interface (CLI)
  Access keys for AWS CLI, SDK, and other development tools
```

**選択理由:**
- AWS CLIでの使用に最適
- 開発ツール（今回のケース）に適している
- GitHub Actionsからも使用可能

### ❌ **選択しないユースケース**

#### **Application running on an Amazon EC2 instance**
```
○ Application running on an Amazon EC2 instance
  Use IAM roles instead of access keys for better security
```
**理由**: EC2インスタンスではないため不適切

#### **Application running outside AWS**
```
○ Application running outside AWS
  Access keys for applications, scripts, or services running outside AWS
```
**理由**: 今回はCLI使用が主目的のため

#### **Local code**
```
○ Local code
  Access keys for local development and testing
```
**理由**: ローカル開発のみでなく、本番デプロイも含むため

#### **Third-party service**
```
○ Third-party service
  Access keys for third-party applications and services
```
**理由**: サードパーティサービスではないため

#### **Other**
```
○ Other
  Describe your use case
```
**理由**: 明確な分類があるため不要

## 🎯 **完全な選択手順**

### 1. Security credentials画面
ユーザー詳細 → **Security credentials**タブ

### 2. Create access key
**「Create access key」**ボタンをクリック

### 3. Use case selection
```
Select your use case:

○ Command Line Interface (CLI)  ← これを選択
  Access keys for AWS CLI, SDK, and other development tools

○ Application running on an Amazon EC2 instance
○ Application running outside AWS  
○ Local code
○ Third-party service
○ Other
```

### 4. Description（オプション）
```
Description tag value (optional):
[GitHub Actions and local development]  ← 任意で入力
```

### 5. 確認とダウンロード
- **「Create access key」**をクリック
- **Access key ID**と**Secret access key**をコピー保存
- **「Download .csv file」**（推奨）

## 🔒 **セキュリティのベストプラクティス**

### ✅ **実行すべき**
- Access keyを安全な場所に保存
- .csvファイルをダウンロード
- 不要になったら削除

### ❌ **避けるべき**
- アクセスキーをコードに直接記載
- パブリックリポジトリにコミット
- 複数人での共有

## 📱 **設定画面の表示例**

```
Create access key

Step 1 of 2: Access key best practices & alternatives

Select your use case to see recommendations and alternatives.

○ Command Line Interface (CLI)  ← 選択
  Access keys for AWS CLI, SDK, and other development tools
  
  Alternatives considered:
  ✓ You've considered alternatives to access keys
  
Description tag value (optional):
[GitHub Actions S3 deployment]

[Cancel] [Next]
```

## 🚀 **選択後の流れ**

1. **「Next」**をクリック
2. **確認画面**で「Create access key」
3. **Access keys**が表示される
4. **Copy**ボタンでコピーまたは**Download .csv**
5. **「Done」**をクリック

## 🎯 **取得後の実行**

```bash
configure-aws.bat
# 上記で取得したAccess Key IDとSecret Access Keyを入力

execute-aws-setup.bat  
# 完全自動実行
```

---

**「Command Line Interface (CLI)」を選択すれば確実に正しい設定になります！**