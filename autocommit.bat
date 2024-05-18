@echo off
cd /d "C:\Users\mccon\OneDrive\Desktop\TickerWebsite"
git add "%1"
git commit -m "Auto-commit: %~nx1 saved at %DATE% %TIME%"
git push origin main
