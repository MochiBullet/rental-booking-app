# 🔧 手動AWS設定 - configure-aws.batが動かない場合

## 📋 代替設定方法（確実に動作）

### 方法1: コマンドプロンプト直接実行

#### 1. コマンドプロンプトを開く
- **Win + R** → **cmd** → **Enter**

#### 2. 以下のコマンドを1つずつ実行

```bash
aws configure set aws_access_key_id AKIA******************
aws configure set aws_secret_access_key ****************************************
aws configure set default.region ap-southeast-2
aws configure set default.output json
```

**重要**: 
- `AKIA******************` を実際のAccess Key IDに置き換え
- `****************************************` を実際のSecret Access Keyに置き換え

#### 3. 設定確認
```bash
aws sts get-caller-identity
```

成功すると以下のような出力：
```json
{
    "UserId": "AIDA******************",
    "Account": "123456789012",
    "Arn": "arn:aws:iam::123456789012:user/github-actions-s3"
}
```

### 方法2: PowerShell実行

#### 1. PowerShellを開く
- **Win + X** → **PowerShell**

#### 2. 以下を実行
```powershell
aws configure set aws_access_key_id "AKIA******************"
aws configure set aws_secret_access_key "****************************************"
aws configure set default.region "ap-southeast-2"  
aws configure set default.output "json"
```

### 方法3: インタラクティブ設定

#### 1. コマンドプロンプトで実行
```bash
aws configure
```

#### 2. 順番に入力
```
AWS Access Key ID [None]: AKIA******************
AWS Secret Access Key [None]: ****************************************
Default region name [None]: ap-southeast-2
Default output format [None]: json
```

## 🚀 設定完了後の実行

### 自動デプロイスクリプト実行
設定が完了したら、以下を実行：

#### エクスプローラーから
1. `C:\Users\hiyok\projects\rental-booking-app` を開く
2. `execute-aws-setup.bat` をダブルクリック

#### コマンドプロンプトから
```bash
cd /d C:\Users\hiyok\projects\rental-booking-app
execute-aws-setup.bat
```

## 🛠️ なぜ.batファイルが開かないのか

### 考えられる原因
1. **Windows Defender** - セキュリティでブロック
2. **UAC設定** - 管理者権限が必要
3. **ファイル関連付け** - .batファイルの実行設定
4. **ウイルス対策ソフト** - 実行をブロック

### 解決方法
1. **右クリック** → **管理者として実行**
2. **Windows Defender** → **除外設定**に追加
3. **直接コマンド実行**（上記の方法）

## ⚡ 最速解決手順

### 今すぐ実行（コマンドプロンプト）

1. **Win + R** → **cmd** → **Enter**

2. **以下をコピペ実行**（キーを実際の値に置き換え）:
```bash
aws configure set aws_access_key_id AKIA******************
aws configure set aws_secret_access_key ****************************************  
aws configure set default.region ap-southeast-2
aws configure set default.output json
```

3. **設定確認**:
```bash
aws sts get-caller-identity
```

4. **デプロイ実行**:
```bash
cd /d C:\Users\hiyok\projects\rental-booking-app
execute-aws-setup.bat
```

## 🔍 設定ファイル確認

設定が正しく保存されているか確認：
```bash
aws configure list
```

出力例：
```
      Name                    Value             Type    Location
      ----                    -----             ----    --------
   profile                <not set>             None    None
access_key     ****************XXXX shared-credentials-file
secret_key     ****************XXXX shared-credentials-file
    region           ap-southeast-2      config-file    ~/.aws/config
    output                     json      config-file    ~/.aws/config
```

---

**最も確実な方法: 上記のコマンドを直接コマンドプロンプトで実行してください！**