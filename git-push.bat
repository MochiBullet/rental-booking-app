@echo off
cd /d C:\Users\hiyok\projects\rental-booking-app

echo Adding all changes...
git add -A

echo Creating commit...
git commit -m "簡素化: 会員登録を免許証番号下4桁とメールのみに変更" -m "- 会員登録フォームを簡素化（メールと免許証番号下4桁のみ）" -m "- 会員番号生成ロジックを西暦+月+免許証番号に変更" -m "- マイページの個人情報表示を簡素化" -m "- 不要な個人情報項目を削除"

echo Pushing to GitHub...
git push

echo Push complete!
pause