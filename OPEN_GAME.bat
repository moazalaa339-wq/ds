@echo off
setlocal EnableExtensions
cd /d "%~dp0"
chcp 65001 >nul
title Hawa - Open Game

set "PORT="
if exist "%~dp0.hawa_port" set /p PORT=<"%~dp0.hawa_port"
if not defined PORT set "PORT=8765"

echo Opening: http://127.0.0.1:%PORT%/game
echo لو مفحتتش: شغّل START_SERVER.bat الأول وسيبه مفتوح.
start "" "http://127.0.0.1:%PORT%/games"
endlocal
