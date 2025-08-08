@echo off
echo ===============================================
echo  Test Build - Verify React App
echo ===============================================
echo.

cd /d C:\Users\hiyok\projects\rental-booking-app

echo Testing npm build...
call npm run build

if exist build\index.html (
    echo ✅ Build successful!
    echo.
    echo Files created:
    dir build /b
    echo.
    echo Ready for deployment!
) else (
    echo ❌ Build failed
    echo Check for errors above
)

pause