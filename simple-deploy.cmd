@echo off
echo Starting deployment...
pause
cd /d "C:\Users\hiyok\projects\rental-booking-app"
echo Current directory: %cd%
pause

echo Checking AWS...
aws --version
pause

echo Checking credentials...
aws sts get-caller-identity
pause

echo Done - press any key to exit
pause