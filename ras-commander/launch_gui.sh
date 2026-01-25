#!/bin/bash
# RAS Commander GUI Launcher
# Quick script to start the GUI

echo "════════════════════════════════════════════════════════════════════════════════"
echo "                        🌊 RAS Commander GUI Launcher 🌊"
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the ras-commander directory
cd "$SCRIPT_DIR"

echo "📁 Working directory: $SCRIPT_DIR"
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 not found"
    echo "   Please install Python 3.9 or higher"
    exit 1
fi

echo "✓ Python version: $(python3 --version)"
echo ""

# Check if Flask is installed
if ! python3 -c "import flask" 2>/dev/null; then
    echo "❌ Flask not installed"
    echo "   Installing Flask..."
    pip3 install flask flask-cors --user
    echo ""
fi

echo "✓ Flask is installed"
echo ""

# Check if ras-commander can be imported
if ! python3 -c "import sys; sys.path.insert(0, '.'); from ras_commander import RasExamples" 2>/dev/null; then
    echo "❌ Error: Cannot import ras_commander"
    echo "   Please check the installation"
    exit 1
fi

echo "✓ RAS Commander is available"
echo ""

echo "════════════════════════════════════════════════════════════════════════════════"
echo "🚀 Starting RAS Commander GUI Server..."
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""
echo "The server will start on: http://localhost:5000"
echo ""
echo "📝 Instructions:"
echo "   1. Wait for the server to start (you'll see startup messages below)"
echo "   2. Open your web browser"
echo "   3. Navigate to: http://localhost:5000"
echo "   4. Use the GUI interface!"
echo ""
echo "⏹️  To stop the server: Press Ctrl+C"
echo ""
echo "════════════════════════════════════════════════════════════════════════════════"
echo ""

# Start the server
python3 gui_server.py
