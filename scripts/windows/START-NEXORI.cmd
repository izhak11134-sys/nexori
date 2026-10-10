@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 goto missing_node
if not exist "start-local.mjs" goto extract_package
if not exist "site\index.html" goto extract_package
node start-local.mjs
if errorlevel 1 goto failed
exit /b 0

:extract_package
echo Preparing the complete NEXORI package from your Downloads folder...
powershell.exe -NoProfile -Command ^
 "$ErrorActionPreference='Stop';" ^
 "$downloads=(New-Object -ComObject Shell.Application).NameSpace('shell:Downloads').Self.Path;" ^
 "$archive=Get-ChildItem -LiteralPath $downloads -Filter 'NEXORI-Windows*.zip' -File | Sort-Object LastWriteTime -Descending | Select-Object -First 1;" ^
 "if(-not $archive){throw 'Keep NEXORI-Windows.zip in your Downloads folder and try again.'};" ^
 "$destination=Join-Path $env:LOCALAPPDATA 'NEXORI\Windows';" ^
 "Expand-Archive -LiteralPath $archive.FullName -DestinationPath $destination -Force;" ^
 "$folder=Join-Path $destination 'NEXORI-Windows';" ^
 "$info=Get-Content -LiteralPath (Join-Path $folder 'package-info.json') -Raw | ConvertFrom-Json;" ^
 "if($info.app -ne 'NEXORI' -or $info.projectId -ne 'nexori-development'){throw 'This is not the expected NEXORI package.'};" ^
 "$server=Join-Path $folder 'start-local.mjs';" ^
 "if(-not (Test-Path -LiteralPath $server)){throw 'The ZIP is incomplete. Download NEXORI-Windows.zip again.'};" ^
 "Write-Host ('Files extracted to: '+$folder);" ^
 "& node $server; exit $LASTEXITCODE;"
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
