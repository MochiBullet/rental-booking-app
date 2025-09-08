@echo off
echo CloudFront Cache Invalidation
echo ==============================

aws cloudfront create-invalidation --distribution-id E2ANNXZ9LL61PY --paths "/*" --region ap-southeast-2

echo.
echo CloudFront cache invalidation started!
echo Please wait 5-10 minutes for the cache to clear.
pause