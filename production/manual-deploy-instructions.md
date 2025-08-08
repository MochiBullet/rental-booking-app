# 📋 ms-base-rental.com 完全手動デプロイ手順

## 🚀 コピー＆ペーストで実行

### **Step 1: コマンドプロンプト起動**
1. Windows + R キーを押す
2. `cmd` と入力してEnter
3. 黒い画面が開く

### **Step 2: 以下をコピペして実行**

```cmd
cd C:\Users\hiyok\projects\rental-booking-app\production
```

### **Step 3: AWSデプロイ実行**

```cmd
aws cloudformation create-stack --stack-name msbase-rental-prod --template-body file://production-template.yaml --parameters ParameterKey=DomainName,ParameterValue=ms-base-rental.com ParameterKey=Environment,ParameterValue=prod --capabilities CAPABILITY_NAMED_IAM --region ap-southeast-2
```

### **Step 4: 完了確認（5分後に実行）**

```cmd
aws cloudformation describe-stacks --stack-name msbase-rental-prod --region ap-southeast-2 --query "Stacks[0].StackStatus" --output text
```

`CREATE_COMPLETE` と表示されれば成功！

### **Step 5: 結果取得**

```cmd
aws cloudformation describe-stacks --stack-name msbase-rental-prod --region ap-southeast-2 --query "Stacks[0].Outputs" --output table
```

## 📋 重要な情報をメモしてください

- **WebsiteURL**: https://ms-base-rental.com
- **NameServers**: 4つのネームサーバー
- **CloudFrontDistributionId**: 配信ID

## 🔧 お名前.com設定

1. お名前.com Naviにログイン
2. DNS設定 → ネームサーバー設定
3. 表示された4つのネームサーバーを入力
4. 設定保存

## ✅ 完了

30分後に https://ms-base-rental.com にアクセス！