# Claude Code進捗保存フック設定ガイド

## 設定方法

### 1. Claude Code設定を開く
- Claude Codeで `Ctrl + ,` (設定を開く)
- 左メニューから **"Hooks"** セクションを選択

### 2. 推奨フック設定

#### 🚀 プッシュ前自動進捗保存（推奨）
```bash
<pre-push-hook>: python scripts/generate-progress-report.py
```

#### 📝 コミット後進捗ログ
```bash
<post-commit-hook>: python scripts/generate-progress-report.py
```

#### 🔍 プロンプト送信時プロジェクト状況確認
```bash
<user-prompt-submit-hook>: git status --short && echo "📊 最新進捗: $(cat docs/progress/latest_progress.md | head -5)"
```

### 3. より高度な設定

#### 自動ビルド・プッシュ・進捗保存の組み合わせ
```bash
<pre-push-hook>: npm run build && python scripts/generate-progress-report.py && git add docs/progress/ && git commit --amend --no-edit
```

#### ファイル編集後の自動進捗更新
```bash
<post-edit-hook>: python scripts/generate-progress-report.py --quick-update
```

## 生成されるファイル

### 📁 docs/progress/
```
docs/progress/
├── progress_20250124_143022_a1b2c3d4.json    # 詳細データ（JSON）
├── progress_20250124_143022_a1b2c3d4.md      # 人間用レポート（Markdown）
├── latest_progress.json                       # 最新進捗（JSON）
└── latest_progress.md                         # 最新進捗（Markdown）
```

### 📄 レポート内容
- **作業内容**: コミットメッセージ・変更ファイル
- **プロジェクト統計**: ファイル数・行数・コンポーネント数
- **作業傾向**: 機能追加・バグ修正・ドキュメント更新の傾向
- **完了指標**: ビルド成功・テスト・デプロイ準備状況
- **残作業**: TODO・FIXMEの数

## 使用例

### プッシュ前の自動実行
```bash
$ git push origin master

🔄 進捗レポートを生成中...
✅ 進捗レポートを保存しました:
   📄 docs/progress/progress_20250124_143022_a1b2c3d4.json
   📄 docs/progress/progress_20250124_143022_a1b2c3d4.md
   📄 docs/progress/latest_progress.md

📊 作業サマリー:
   🔹 変更ファイル: 3件
   🔹 作業焦点: authentication, api_integration  
   🔹 コミット: a1b2c3d4

Enumerating objects: 15, done...
```

### 手動実行
```bash
$ python scripts/generate-progress-report.py
```

## カスタマイズ

### フック無効化（一時的）
```bash
$ git push --no-verify origin master  # フックをスキップ
```

### スクリプトオプション追加
`scripts/generate-progress-report.py`を編集して：
- `--quick-update`: 軽量版レポート
- `--detailed`: より詳細な分析
- `--summary-only`: サマリーのみ

## トラブルシューティング

### Python実行エラー
```bash
# Pythonパスを確認
$ which python3
$ python3 scripts/generate-progress-report.py
```

### 権限エラー
```bash
$ chmod +x scripts/generate-progress-report.py
```

### フック実行確認
```bash
# フックが設定されているか確認
$ cat .git/hooks/pre-push  # または該当するフック
```

## 利点

✅ **自動記録**: 手動で進捗を記録し忘れることがない  
✅ **履歴保持**: 全ての作業履歴が自動で蓄積される  
✅ **分析可能**: JSON形式でデータ分析・可視化が可能  
✅ **チーム共有**: Markdownで見やすいレポート  
✅ **振り返り支援**: コミットパターンや作業傾向を把握  

---

**設定後は**、プッシュするたびに自動で進捗が `docs/progress/` に保存されます！