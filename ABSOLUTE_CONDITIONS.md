# 🚨 絶対条件 - CLAUDE必須確認事項

## ⚠️ 作業前に必ずこのファイルを確認してください

### 1. S3デプロイの絶対条件
```bash
# ✅ 唯一正しいバケット
rental-booking-app-website

# ❌ 絶対に使用禁止
rental-booking-app-production-276291855506
```

### 2. CloudFrontの絶対条件
```bash
# ✅ 唯一正しいDistribution ID
E2ANNXZ9LL61PY
```

### 3. 唯一の正しいデプロイコマンド
```bash
# この通りに実行すること
aws s3 sync build/ s3://rental-booking-app-website --delete --region ap-southeast-2
aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*"
```

### 4. 本番URL（確認用）
```
✅ http://rental-booking-app-website.s3-website-ap-southeast-2.amazonaws.com
✅ https://ms-base-rental.com
✅ https://d1y20ady8hnkgx.cloudfront.net
```

### 5. 絶対禁止事項
- ❌ Vercelの使用・提案・言及
- ❌ 間違ったバケット名での作業
- ❌ 他のCloudFront IDの使用
- ❌ コミット時のClaude署名忘れ

### 6. Gitコミットの絶対条件
```
🤖 Generated with [Claude Code](https://claude.ai/code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

## 🔴 これらの条件に違反した場合は即座に作業を中止し、正しい設定に修正してください。