#!/bin/bash
# RAS Commander GUI - Unix (macOS/Linux) Installer
# This script installs all required dependencies

echo "================================================================================"
echo "                  RAS Commander GUI - Unix Installer"
echo "================================================================================"
echo ""

# Check Python installation
echo "Checking Python installation..."
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] python3 is not installed"
    echo ""
    echo "Please install Python 3.9 or higher:"
    echo "  macOS: brew install python3"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "  Fedora/CentOS: sudo yum install python3 python3-pip"
    echo ""
    exit 1
fi

echo "[OK] Python found"
python3 --version
echo ""

# Upgrade pip
echo "Upgrading pip..."
python3 -m pip install --upgrade pip --user --quiet
echo "[OK] pip upgraded"
echo ""

# Install dependencies
echo "Installing dependencies (this may take 5-15 minutes)..."
echo ""

echo "[1/3] Installing Flask (web server)..."
python3 -m pip install flask flask-cors --user --quiet
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install Flask"
    exit 1
fi
echo "[OK] Flask installed"

echo "[2/3] Installing scientific libraries..."
python3 -m pip install numpy pandas --user --quiet
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install numpy/pandas"
    exit 1
fi
echo "[OK] numpy, pandas installed"

echo "[3/3] Installing HEC-RAS libraries (this takes longest)..."
python3 -m pip install h5py geopandas matplotlib scipy xarray shapely rasterstats rtree requests tqdm psutil --user --quiet
if [ $? -ne 0 ]; then
    echo "[WARNING] Some packages may have failed, but installation will continue"
fi
echo "[OK] HEC-RAS libraries installed"

echo ""
echo "================================================================================"
echo "                         Installation Complete!"
echo "================================================================================"
echo ""
echo "To start RAS Commander GUI:"
echo "  ./launch_gui.sh"
echo ""
echo "Then open browser: http://localhost:5000"
echo ""

# Make launcher executable
chmod +x launch_gui.sh
echo "[OK] Made launcher executable"
echo ""
