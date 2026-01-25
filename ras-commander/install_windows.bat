@echo off
REM RAS Commander GUI - Windows Installer
REM This script installs all required dependencies

echo ================================================================================
echo                  RAS Commander GUI - Windows Installer
echo ================================================================================
echo.

REM Check Python installation
echo Checking Python installation...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo.
    echo Please install Python 3.9 or higher from:
    echo https://www.python.org/downloads/
    echo.
    echo Make sure to check "Add Python to PATH" during installation!
    echo.
    pause
    exit /b 1
)

echo [OK] Python found
python --version
echo.

REM Upgrade pip
echo Upgrading pip...
python -m pip install --upgrade pip --quiet
echo [OK] pip upgraded
echo.

REM Install dependencies
echo Installing dependencies (this may take 5-15 minutes)...
echo.

echo [1/3] Installing Flask (web server)...
python -m pip install flask flask-cors --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install Flask
    pause
    exit /b 1
)
echo [OK] Flask installed

echo [2/3] Installing scientific libraries...
python -m pip install numpy pandas --quiet
if errorlevel 1 (
    echo [ERROR] Failed to install numpy/pandas
    pause
    exit /b 1
)
echo [OK] numpy, pandas installed

echo [3/3] Installing HEC-RAS libraries (this takes longest)...
python -m pip install h5py geopandas matplotlib scipy xarray shapely rasterstats rtree requests tqdm psutil --quiet
if errorlevel 1 (
    echo [WARNING] Some packages may have failed, but installation will continue
)
echo [OK] HEC-RAS libraries installed

echo.
echo ================================================================================
echo                         Installation Complete!
echo ================================================================================
echo.
echo To start RAS Commander GUI:
echo   1. Double-click: launch_gui_windows.bat
echo   2. Open browser: http://localhost:5000
echo.
echo A desktop shortcut will be created for easy access.
echo.

REM Create desktop shortcut
echo Creating desktop shortcut...
set SCRIPT_DIR=%~dp0
set SHORTCUT_PATH=%USERPROFILE%\Desktop\RAS Commander GUI.lnk

powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%SHORTCUT_PATH%'); $Shortcut.TargetPath = '%SCRIPT_DIR%launch_gui_windows.bat'; $Shortcut.WorkingDirectory = '%SCRIPT_DIR%'; $Shortcut.Description = 'RAS Commander GUI'; $Shortcut.Save()"

if exist "%SHORTCUT_PATH%" (
    echo [OK] Desktop shortcut created: RAS Commander GUI
) else (
    echo [INFO] Could not create desktop shortcut automatically
    echo        You can manually create a shortcut to launch_gui_windows.bat
)

echo.
pause
