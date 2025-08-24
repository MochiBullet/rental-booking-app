#!/usr/bin/env python3
"""
プッシュ前に実行される進捗レポート自動生成スクリプト
Git情報と作業内容を記録してdocs/progress/に保存
"""

import os
import json
import subprocess
from datetime import datetime, timezone
import sys

def run_command(cmd):
    """コマンド実行して結果を取得"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        return result.stdout.strip()
    except Exception as e:
        return f"Error: {e}"

def get_git_info():
    """Git情報を取得"""
    return {
        "commit_hash": run_command("git rev-parse HEAD"),
        "commit_message": run_command("git log -1 --pretty=%B"),
        "branch": run_command("git rev-parse --abbrev-ref HEAD"),
        "author": run_command("git log -1 --pretty=%an"),
        "date": run_command("git log -1 --pretty=%ci"),
        "files_changed": run_command("git diff --name-only HEAD~1 HEAD").split('\n') if run_command("git diff --name-only HEAD~1 HEAD") else [],
        "insertions": run_command("git diff --shortstat HEAD~1 HEAD"),
        "repo_status": run_command("git status --porcelain")
    }

def get_project_stats():
    """プロジェクト統計を取得"""
    stats = {}
    
    # ファイル数カウント
    try:
        stats["total_files"] = len([f for f in run_command("find . -type f -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' -o -name '*.css' -o -name '*.md'").split('\n') if f])
        stats["src_files"] = len([f for f in run_command("find src -type f 2>/dev/null || echo ''").split('\n') if f])
        stats["component_files"] = len([f for f in run_command("find src/components -type f 2>/dev/null || echo ''").split('\n') if f])
    except:
        stats["total_files"] = "Unknown"
        stats["src_files"] = "Unknown" 
        stats["component_files"] = "Unknown"
    
    # 行数カウント (概算)
    try:
        stats["total_lines"] = run_command("find src -name '*.js' -o -name '*.jsx' -o -name '*.ts' -o -name '*.tsx' | xargs wc -l | tail -1")
    except:
        stats["total_lines"] = "Unknown"
        
    return stats

def analyze_commit_patterns():
    """最近のコミットパターンを分析"""
    recent_commits = run_command("git log --oneline -10").split('\n')
    
    patterns = {
        "feature_commits": len([c for c in recent_commits if any(word in c.lower() for word in ['機能追加', 'feature', '実装', '新機能'])]),
        "bug_fixes": len([c for c in recent_commits if any(word in c.lower() for word in ['修正', 'fix', 'bug', 'エラー'])]),
        "docs_updates": len([c for c in recent_commits if any(word in c.lower() for word in ['ドキュメント', 'docs', 'readme', 'md'])]),
        "refactor": len([c for c in recent_commits if any(word in c.lower() for word in ['リファクタ', 'refactor', '改善', 'cleanup'])])
    }
    
    return patterns

def get_todo_status():
    """TODOとFIXMEの状況を確認"""
    try:
        todos = run_command("grep -r 'TODO\\|FIXME\\|XXX' src/ --include='*.js' --include='*.jsx' --include='*.ts' --include='*.tsx' | wc -l")
        return {"pending_todos": todos if todos.isdigit() else 0}
    except:
        return {"pending_todos": 0}

def generate_progress_report():
    """進捗レポートを生成"""
    timestamp = datetime.now(timezone.utc)
    
    report = {
        "timestamp": timestamp.isoformat(),
        "timestamp_jst": timestamp.astimezone().strftime("%Y年%m月%d日 %H:%M:%S"),
        "git_info": get_git_info(),
        "project_stats": get_project_stats(),
        "commit_patterns": analyze_commit_patterns(),
        "todo_status": get_todo_status(),
        "work_summary": {
            "last_session_focus": extract_work_focus(),
            "completion_indicators": get_completion_indicators()
        }
    }
    
    return report

def extract_work_focus():
    """最新のコミットから作業焦点を抽出"""
    commit_msg = run_command("git log -1 --pretty=%B")
    
    focus_keywords = {
        "authentication": ["ログイン", "認証", "パスワード", "login", "auth"],
        "user_management": ["ユーザー", "会員", "user", "member"],
        "api_integration": ["API", "エンドポイント", "backend", "連携"],
        "ui_improvements": ["UI", "デザイン", "画面", "コンポーネント"],
        "bug_fixes": ["修正", "エラー", "fix", "bug"],
        "infrastructure": ["デプロイ", "CDK", "AWS", "infra"]
    }
    
    detected_focus = []
    for category, keywords in focus_keywords.items():
        if any(keyword in commit_msg for keyword in keywords):
            detected_focus.append(category)
    
    return detected_focus if detected_focus else ["general_development"]

def get_completion_indicators():
    """完了指標を取得"""
    return {
        "build_success": "npm run build" in run_command("git log -1 --pretty=%B") or run_command("ls build/ 2>/dev/null") != "",
        "tests_passing": "test" in run_command("git log -1 --pretty=%B").lower(),
        "docs_updated": any(f.endswith('.md') for f in run_command("git diff --name-only HEAD~1 HEAD").split('\n')),
        "deployment_ready": "プッシュ" in run_command("git log -1 --pretty=%B") or "push" in run_command("git log -1 --pretty=%B")
    }

def save_progress_report(report):
    """進捗レポートをファイルに保存"""
    # ディレクトリ作成
    os.makedirs("docs/progress", exist_ok=True)
    
    # ファイル名生成（タイムスタンプ付き）
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    commit_hash = report["git_info"]["commit_hash"][:8]
    
    # JSON形式で詳細レポート保存
    json_filename = f"docs/progress/progress_{timestamp}_{commit_hash}.json"
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    # 人間が読みやすいMarkdown形式でも保存
    md_filename = f"docs/progress/progress_{timestamp}_{commit_hash}.md"
    with open(md_filename, 'w', encoding='utf-8') as f:
        f.write(generate_markdown_report(report))
    
    # 最新の進捗を常に更新
    with open("docs/progress/latest_progress.json", 'w', encoding='utf-8') as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    with open("docs/progress/latest_progress.md", 'w', encoding='utf-8') as f:
        f.write(generate_markdown_report(report))
    
    return json_filename, md_filename

def generate_markdown_report(report):
    """Markdown形式のレポートを生成"""
    md = f"""# 作業進捗レポート

**生成日時**: {report['timestamp_jst']}  
**コミット**: {report['git_info']['commit_hash'][:8]}  
**ブランチ**: {report['git_info']['branch']}

## 📝 今回の作業内容

**コミットメッセージ**:
```
{report['git_info']['commit_message']}
```

**変更ファイル** ({len(report['git_info']['files_changed'])}件):
{chr(10).join([f"- {f}" for f in report['git_info']['files_changed'][:10]])}
{f"... and {len(report['git_info']['files_changed']) - 10} more files" if len(report['git_info']['files_changed']) > 10 else ""}

**変更統計**: {report['git_info']['insertions']}

## 🎯 作業焦点領域

{chr(10).join([f"- {focus}" for focus in report['work_summary']['last_session_focus']])}

## 📊 プロジェクト統計

- **総ファイル数**: {report['project_stats']['total_files']}
- **ソースファイル数**: {report['project_stats']['src_files']}
- **コンポーネント数**: {report['project_stats']['component_files']}
- **総行数**: {report['project_stats']['total_lines']}

## 📈 最近のコミット傾向 (直近10コミット)

- **機能追加**: {report['commit_patterns']['feature_commits']}件
- **バグ修正**: {report['commit_patterns']['bug_fixes']}件
- **ドキュメント更新**: {report['commit_patterns']['docs_updates']}件
- **リファクタリング**: {report['commit_patterns']['refactor']}件

## ✅ 完了指標

- **ビルド成功**: {'✅' if report['work_summary']['completion_indicators']['build_success'] else '❌'}
- **テスト通過**: {'✅' if report['work_summary']['completion_indicators']['tests_passing'] else '❓'}
- **ドキュメント更新**: {'✅' if report['work_summary']['completion_indicators']['docs_updated'] else '❌'}
- **デプロイ準備完了**: {'✅' if report['work_summary']['completion_indicators']['deployment_ready'] else '❌'}

## 🔧 残作業

- **未解決TODO**: {report['todo_status']['pending_todos']}件

---
*このレポートは自動生成されました - {report['timestamp_jst']}*
"""
    return md

def main():
    """メイン処理"""
    try:
        print("[INFO] 進捗レポートを生成中...")
        
        # 進捗レポート生成
        report = generate_progress_report()
        
        # ファイルに保存
        json_file, md_file = save_progress_report(report)
        
        print(f"[OK] 進捗レポートを保存しました:")
        print(f"   - {json_file}")
        print(f"   - {md_file}")
        print(f"   - docs/progress/latest_progress.md")
        
        # 簡単なサマリーを表示
        print(f"\n[SUMMARY] 作業サマリー:")
        print(f"   - 変更ファイル: {len(report['git_info']['files_changed'])}件")
        print(f"   - 作業焦点: {', '.join(report['work_summary']['last_session_focus'])}")
        print(f"   - コミット: {report['git_info']['commit_hash'][:8]}")
        
        return 0
        
    except Exception as e:
        print(f"[ERROR] エラーが発生しました: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())