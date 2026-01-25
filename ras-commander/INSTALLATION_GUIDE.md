# RAS Commander GUI - Installation Guide

**Version**: 0.87.6
**Created**: 2026-01-19

## 🎯 Quick Start

### Windows Users (Recommended)

1. **Extract the ZIP file** to a location like:
   - `C:\RAS-Commander-GUI\`
   - Or any folder you prefer

2. **Run the installer** (double-click):
   - `install_windows.bat`

3. **Launch the GUI** (double-click):
   - `launch_gui_windows.bat`

4. **Open your browser** to:
   - http://localhost:5000

### Mac/Linux Users

1. **Extract the ZIP file** to a location like:
   - `~/RAS-Commander-GUI/`

2. **Open Terminal** in the extracted folder

3. **Run the installer**:
   ```bash
   chmod +x install_unix.sh
   ./install_unix.sh
   ```

4. **Launch the GUI**:
   ```bash
   ./launch_gui.sh
   ```

5. **Open your browser** to:
   - http://localhost:5000

---

## 📋 System Requirements

### Required
- **Python 3.9 or higher** ([Download Python](https://www.python.org/downloads/))
- **Internet connection** (for initial setup to download dependencies)
- **Web browser** (Chrome, Firefox, Safari, Edge)

### Optional (for HEC-RAS execution)
- **Windows OS** (HEC-RAS is Windows-only)
- **HEC-RAS 6.x** installed ([Download HEC-RAS](https://www.hec.usace.army.mil/software/hec-ras/))

### Disk Space
- **Minimum**: 500 MB
- **Recommended**: 1 GB (for projects and results)

---

## 🔧 Installation Details

### What the Installer Does

1. **Checks Python version** (3.9+ required)
2. **Installs dependencies**:
   - Flask (web server)
   - h5py (HDF file support)
   - numpy, pandas (data processing)
   - geopandas (GIS support)
   - matplotlib (plotting)
   - And 20+ other required packages
3. **Verifies installation**
4. **Creates desktop shortcuts** (Windows only)

### Installation Time
- First time: **5-15 minutes** (downloads ~100 MB of dependencies)
- Subsequent runs: **Instant** (already installed)

---

## 🚀 Using the GUI

Once the GUI launches, you'll see 6 main tabs:

### 1. 🚀 Setup
- View system information
- Configure HEC-RAS path
- Check installation status

### 2. 📁 Projects
- Open existing HEC-RAS projects
- Extract example projects
- View project details

### 3. ⚡ Execute Plans
- Run single HEC-RAS plans
- Execute multiple plans in parallel
- Monitor execution progress

### 4. 📊 Extract Results
- Extract water surface elevations
- Get cross section data
- Export to CSV, Excel, GeoJSON, Shapefile

### 5. 🔧 Tools
- USGS gauge integration
- Precipitation data (AORC, Atlas 14)
- Geometry parsing
- Data validation

### 6. ❓ Help
- Documentation
- Examples
- Troubleshooting

---

## 💡 First Steps After Installation

### Try the Example Projects

1. Go to **Projects** tab
2. Click **"Extract Example Project"**
3. Select **"Muncie"** from dropdown
4. Click **"Extract Example Project"**
5. Open the extracted project
6. Go to **Execute** tab to run simulations
7. Go to **Extract Results** tab to analyze output

### Load Your Own Project

1. Go to **Projects** tab
2. Enter your HEC-RAS project folder path
3. Click **"Open Project"**
4. Use Execute and Results tabs

---

## ❓ Troubleshooting

### "Python not found"
**Solution**: Install Python 3.9+ from https://www.python.org/downloads/

During installation, **check "Add Python to PATH"**

### "Cannot install dependencies"
**Solution**:
1. Open Command Prompt/Terminal as Administrator
2. Run: `python -m pip install --upgrade pip`
3. Run the installer again

### "Port 5000 already in use"
**Solution**:
1. Close any programs using port 5000
2. Or edit `gui_server.py` and change port to 5001:
   ```python
   app.run(host='0.0.0.0', port=5001, debug=True)
   ```

### "HEC-RAS won't execute" (macOS/Linux)
**Note**: HEC-RAS is Windows-only. On macOS/Linux you can:
- Analyze results (if HDF files are available)
- Use remote execution to connect to Windows machine
- Transfer files to Windows machine for execution

### Browser shows "Can't connect"
**Solution**:
1. Check the Terminal/Command Prompt - is the server running?
2. Look for "Running on http://localhost:5000"
3. Try http://127.0.0.1:5000 instead

---

## 📚 Additional Resources

### Documentation
- **In-Package Docs**: See `GUI_README.md` in the installation folder
- **Official Docs**: https://ras-commander.readthedocs.io/
- **GitHub**: https://github.com/gpt-cmdr/ras-commander

### Example Notebooks
- Located in `examples/` folder (if included)
- Jupyter notebooks with step-by-step tutorials
- Requires Jupyter: `pip install jupyter`

### Getting Help
1. Check `GUI_README.md` for detailed instructions
2. Review troubleshooting section above
3. Visit GitHub issues: https://github.com/gpt-cmdr/ras-commander/issues

---

## 🔐 Security & Privacy

- **No data collection**: This software does not send any data externally
- **Local only**: The web server only runs on your computer (localhost)
- **Open source**: All code is open and auditable
- **No telemetry**: No usage tracking or analytics

---

## 📜 License

RAS Commander is open source software. See the `LICENSE` file for details.

---

## ✅ Verification

After installation, verify everything works:

1. **Start the GUI** (use launcher script)
2. **Check browser loads** (http://localhost:5000)
3. **Go to Setup tab** - see green checkmarks
4. **Try extracting** an example project
5. **View project info** - see plan counts

If all steps succeed: **✓ Installation Complete!**

---

## 🎉 You're Ready!

Start the GUI and begin automating HEC-RAS operations!

**Questions?** See `GUI_README.md` or visit the documentation links above.

**Enjoy using RAS Commander! 🌊**
