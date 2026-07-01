@echo off
REM start-editor.bat — launch the partner-decks editor (save-server + browser)
REM
REM Double-click to run, or from a terminal:  start-editor.bat  [port]
REM Default port is 8080. Pass a number to override, e.g.  start-editor.bat 8090

setlocal
cd /d "%~dp0"

set "PORT=%~1"
if "%PORT%"=="" set "PORT=8080"

echo.
echo   partner-decks editor
echo   Launching save-server on port %PORT% ...
echo   Deck: http://localhost:%PORT%/natgeo/
echo.

REM Server runs in its own window so it keeps its logs and stays alive.
start "partner-decks save-server" python tools\save-server.py %PORT%

REM Give it a moment to bind, then open the deck in the default browser.
timeout /t 2 /nobreak >nul
start "" "http://localhost:%PORT%/natgeo/"

endlocal
