# 📂 スクリプトの実行場所とディレクトリ

## 📍 ファイルの場所

すべてのスクリプトは以下のディレクトリにあります：
```
C:\Users\hiyok\projects\rental-booking-app\
```

## 📋 実行可能なスクリプト一覧

### 🔑 AWS設定用
- `configure-aws.bat` - AWS認証設定
- `execute-aws-setup.bat` - 完全自動デプロイ
- `test-build.bat` - ビルドテスト

### 📖 説明書
- `AWS-SETUP-FINAL.md` - 完全手順書
- `AWS-CREDENTIALS-LINKS.md` - 直接リンク集
- `WHERE-TO-USE-KEYS.md` - キー使用先説明

## 🚀 実行方法

### 方法1: エクスプローラーから
1. **エクスプローラーを開く**
2. **アドレスバーに貼り付け**: 
   ```
   C:\Users\hiyok\projects\rental-booking-app
   ```
3. **Enter キー**
4. **configure-aws.bat をダブルクリック**

### 方法2: コマンドプロンプトから
1. **Win + R** → **cmd** → **Enter**
2. **以下を入力**:
   ```
   cd /d C:\Users\hiyok\projects\rental-booking-app
   configure-aws.bat
   ```

### 方法3: PowerShellから
1. **Win + X** → **PowerShell**
2. **以下を入力**:
   ```
   Set-Location "C:\Users\hiyok\projects\rental-booking-app"
   .\configure-aws.bat
   ```

## 📱 簡単アクセス用ショートカット

### クイックアクセス用バッチファイル
以下の内容で `quick-access.bat` を作成できます：

```batch
@echo off
cd /d C:\Users\hiyok\projects\rental-booking-app
echo ===============================================
echo  M's BASE Rental - Script Directory
echo ===============================================
echo.
echo Available scripts:
echo 1. configure-aws.bat     - AWS setup
echo 2. execute-aws-setup.bat - Full deploy
echo 3. test-build.bat        - Test build
echo.
explorer .
pause
```

## 🔍 現在のディレクトリ確認方法

コマンドプロンプトで以下を実行：
```
cd /d C:\Users\hiyok\projects\rental-booking-app
dir *.bat
```

表示されるはず：
```
configure-aws.bat
execute-aws-setup.bat
test-build.bat
```

## 🎯 推奨実行手順

1. **エクスプローラーでフォルダを開く**:
   ```
   C:\Users\hiyok\projects\rental-booking-app
   ```

2. **configure-aws.bat をダブルクリック**

3. **AWSキーを入力**

4. **execute-aws-setup.bat をダブルクリック**

## 🆘 もし見つからない場合

### ファイルが見つからない場合の対処法
1. **Git pullで最新版を取得**:
   ```
   cd /d C:\Users\hiyok\projects\rental-booking-app
   git pull
   ```

2. **ファイル一覧を確認**:
   ```
   dir *.bat
   ```

---

**最も簡単な方法: エクスプローラーで `C:\Users\hiyok\projects\rental-booking-app` を開いて、`configure-aws.bat` をダブルクリックしてください！**