@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto missing_node
node start-local.mjs
if errorlevel 1 goto failed
exit /b 0

:missing_node
echo Install the free Node.js LTS Windows Installer from https://nodejs.org
echo Then reopen this file. No npm commands or Firebase CLI are needed.
goto failed

:failed
echo.
echo If you need help, copy the message above into the chat.
pause
exit /b 1
