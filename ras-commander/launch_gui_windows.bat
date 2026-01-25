@echo off
REM RAS Commander GUI - Windows Launcher

echo ================================================================================
echo                      RAS Commander GUI Launcher
echo ================================================================================
echo.
echo Starting server on http://localhost:5000
echo.
echo Instructions:
echo   1. Wait for server to start (you'll see "Running on..." message)
echo   2. Open your web browser
echo   3. Navigate to: http://localhost:5000
echo.
echo To stop the server: Press Ctrl+C
echo.
echo ================================================================================
echo.

REM Start the server
python gui_server.py

pause
