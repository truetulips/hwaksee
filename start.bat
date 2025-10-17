@echo off
start cmd /k "cd /d D:\creative\react\hwaksee\server && call pm2 start ecosystem.config.js --env development"
start cmd /k "cd /d D:\creative\react\hwaksee\client && call npm start"