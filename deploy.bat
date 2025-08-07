@echo off
chcp 65001 > nul
echo ===============================================
echo  M's BASE Rental Deploy Script
echo ===============================================
echo.

echo [1/5] Check current changes...
git status

echo.
set /p commit_message="Enter commit message: "

echo.
echo [2/5] Staging changes...
git add -A

echo.
echo [3/5] Creating commit...
git commit -m "%commit_message%"

echo.
echo [4/5] Pushing to GitHub...
git push origin master

echo.
echo [5/5] Deploy completed!
echo.
echo Check deploy status: https://github.com/MochiBullet/rental-booking-app/actions
echo Check website: https://rental-booking-app-bucket.s3-website-ap-southeast-2.amazonaws.com
echo.
pause