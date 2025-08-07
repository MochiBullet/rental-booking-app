@echo off
git add -A
git commit -m "Update site"
git push origin master
echo Deploy completed!
pause