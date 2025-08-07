@echo off
echo Starting debug deploy...
echo Current directory: %CD%
echo.
echo Checking if we are in correct folder...
if exist package.json (
    echo ✓ Found package.json - correct folder
) else (
    echo ✗ package.json not found - wrong folder?
    echo Please run this from the project folder
    pause
    exit /b 1
)
echo.
echo Checking Git...
git --version
if %ERRORLEVEL% NEQ 0 (
    echo ✗ Git not found - please install Git
    pause
    exit /b 1
) else (
    echo ✓ Git is installed
)
echo.
echo Checking Git status...
git status
echo.
echo Adding files...
git add -A
echo.
echo Committing...
git commit -m "Update from debug deploy"
echo.
echo Pushing...
git push origin master
echo.
echo Done!
echo.
echo Press any key to close...
pause > nul