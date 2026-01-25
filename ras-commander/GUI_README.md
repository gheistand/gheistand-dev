# RAS Commander GUI - User Guide

## 🎉 Welcome to RAS Commander GUI!

This is a user-friendly graphical interface for **RAS Commander**, designed for non-coders to automate HEC-RAS operations without writing Python code.

---

## ✅ Installation Status

Your RAS Commander installation is complete and ready to use! Here's what was installed:

- ✓ **Python 3.9.6** - Base Python installation
- ✓ **ras-commander 0.87.6** - Main library (local source)
- ✓ **All dependencies** - h5py, numpy, pandas, geopandas, matplotlib, etc.
- ✓ **Flask** - Web server for the GUI
- ✓ **GUI files** - HTML interface and Python backend

---

## 🚀 Quick Start

### Step 1: Start the GUI Server

Open a terminal in the `ras-commander` directory and run:

```bash
python3 gui_server.py
```

You should see:

```
================================================================================
RAS Commander GUI Server
================================================================================
RAS Commander Available: True
Python Version: 3.9.6

Starting server on http://localhost:5000
Open your browser and navigate to: http://localhost:5000

Press Ctrl+C to stop the server
================================================================================
```

### Step 2: Open the GUI in Your Browser

Open your web browser and navigate to:

```
http://localhost:5000
```

You'll see the RAS Commander GUI with six main tabs:

1. **🚀 Setup** - Configuration and system information
2. **📁 Projects** - Load and manage HEC-RAS projects
3. **⚡ Execute Plans** - Run HEC-RAS simulations
4. **📊 Extract Results** - Extract and analyze results
5. **🔧 Tools** - Additional utilities
6. **❓ Help** - Documentation and resources

---

## 📖 Using the GUI

### Setup Tab

The Setup tab shows your system information and allows you to configure HEC-RAS:

- **System Information**: View your Python version, RAS Commander version, and platform
- **HEC-RAS Configuration**: Set the path to your HEC-RAS installation
- **Quick Start Guide**: Step-by-step instructions

**Important Note**: Since you're on macOS and HEC-RAS only runs on Windows, you have two options:

1. **Run this on a Windows machine** with HEC-RAS installed
2. **Use remote execution** to connect to a Windows machine with HEC-RAS

### Projects Tab

Load and manage HEC-RAS projects:

#### Open Existing Project
1. Enter the path to your HEC-RAS project folder
2. Click **"Open Project"**
3. The GUI will load the project and display information about plans and geometries

#### Extract Example Project
1. Select an example project from the dropdown (e.g., "Muncie")
2. Choose where to extract it (default: `./example_projects`)
3. Click **"Extract Example Project"**
4. Once extracted, you can open it using the "Open Existing Project" section

### Execute Plans Tab

Run HEC-RAS simulations:

#### Single Plan Execution
1. Enter the plan number (e.g., "01")
2. Optionally set the number of CPU cores
3. Check "Clear geometry preprocessor files" if geometry changed
4. Click **"Execute Plan"**

#### Parallel Plan Execution
1. Enter multiple plan numbers separated by commas (e.g., "01, 02, 03")
2. Set the maximum number of workers
3. Click **"Execute Plans in Parallel"**

The progress bar will show execution progress, and the output box will display status messages.

### Extract Results Tab

Extract and analyze HEC-RAS results:

#### Extract Water Surface Elevation (WSE)
1. Enter the path to the HDF file (e.g., `/path/to/plan.p01.hdf`)
2. Set the time index (-1 for last timestep)
3. Click **"Extract WSE Data"**

#### Extract Cross Section Data
1. Enter the path to the geometry file (e.g., `/path/to/geometry.g01`)
2. Click **"Extract Cross Sections"**

#### Export Results
1. Choose export format (CSV, Excel, GeoJSON, Shapefile)
2. Enter output file path
3. Click **"Export Results"**

### Tools Tab

Access specialized tools:

- **🔍 Project Inspector** - View detailed project structure
- **🗺️ RASMapper Tools** - Work with RASMapper layers and terrain
- **📐 Geometry Tools** - Parse and modify geometry files
- **🌊 USGS Gauge Integration** - Integrate USGS gauge data
- **☁️ Precipitation Data** - Work with AORC and Atlas 14 data
- **🔧 Validation Tools** - Validate DSS files and data quality

### Help Tab

Access documentation and resources:

- **About RAS Commander** - Overview of features
- **Key Features** - List of capabilities
- **Python Example** - Code example if you want to use Python
- **Documentation & Resources** - Links to official docs and GitHub
- **About This GUI** - Information about the interface

---

## 💡 Tips and Tricks

### File Paths
- **Windows paths**: Use forward slashes: `C:/Projects/MyModel`
- **macOS/Linux paths**: Standard Unix paths: `/Users/name/Projects/MyModel`
- The GUI accepts both formats

### Plan Numbers
- Always use 2-digit format: `"01"`, `"02"`, not `"1"`, `"2"`
- HEC-RAS uses zero-padded plan numbers

### Parallel Execution
- Number of workers should match available CPU cores
- Don't exceed the number of plans you're running
- Leave some cores for the system (e.g., 4 cores = use 3 workers)

### Output Messages
- The output boxes show real-time status and results
- Green `✓` means success
- Red `❌` means error
- Yellow `⚠️` means warning

---

## 🔧 Troubleshooting

### GUI Won't Start
**Problem**: `python3 gui_server.py` shows an error

**Solutions**:
1. Make sure you're in the `ras-commander` directory
2. Check Flask is installed: `pip3 show flask`
3. Check ras-commander imports work: `python3 -c "import sys; sys.path.insert(0, '.'); from ras_commander import RasExamples; print('OK')"`

### Can't Connect to http://localhost:5000
**Problem**: Browser shows "Can't connect"

**Solutions**:
1. Check the server is running (look for the startup message)
2. Try `http://127.0.0.1:5000` instead
3. Check if another program is using port 5000: `lsof -i :5000`

### "Python backend required" Messages
**Problem**: Actions show "Note: Python backend required"

**Solutions**:
1. Make sure the Flask server is running (`python3 gui_server.py`)
2. Check the browser console for connection errors (F12 → Console tab)
3. Verify the API endpoints are responding: http://localhost:5000/api/status

### HEC-RAS Won't Execute (macOS)
**Problem**: Can't run HEC-RAS plans on macOS

**Solutions**:
- HEC-RAS is Windows-only. You have two options:
  1. **Transfer to Windows**: Copy this folder to a Windows machine with HEC-RAS
  2. **Remote Execution**: Configure remote execution to a Windows machine (see Advanced Features)

---

## 🎯 What You Can Do Now

Here are some things you can try:

### 1. Test with Example Project
```
1. Go to Projects tab
2. Select "Muncie" from example projects
3. Click "Extract Example Project"
4. Open the extracted project
5. Go to Execute tab
6. Run plan "01"
7. Extract results in Results tab
```

### 2. Load Your Own Project
```
1. Go to Projects tab
2. Enter your project path
3. Click "Open Project"
4. Execute your plans
5. Extract and analyze results
```

### 3. Explore the Tools
```
1. Go to Tools tab
2. Click on different tools to see what they offer
3. Each tool provides specialized functionality
```

---

## 📚 Next Steps

### For Non-Coders
- **Use the GUI**: Everything you need is in the browser interface
- **No coding required**: Click buttons, fill forms, view results
- **Documentation**: Check the Help tab for links to guides

### For Coders
- **Python API**: Use ras-commander directly in Python scripts
- **Example notebooks**: Check `examples/` folder for Jupyter notebooks
- **Full documentation**: https://ras-commander.readthedocs.io/

---

## 🌟 Key Features Available in GUI

✅ **Project Management**
- Open existing HEC-RAS projects
- Extract and manage example projects
- View project structure and details

✅ **Plan Execution**
- Execute single plans
- Run multiple plans in parallel
- Monitor execution progress
- Configure cores and preprocessing

✅ **Results Extraction**
- Extract water surface elevations
- Get cross section data
- Export to multiple formats (CSV, Excel, GeoJSON, Shapefile)

✅ **Advanced Tools**
- USGS gauge integration
- Precipitation data (AORC, Atlas 14)
- RASMapper layer management
- Geometry parsing and modification
- Data validation

---

## 🔗 Resources

- **Official Docs**: https://ras-commander.readthedocs.io/
- **GitHub**: https://github.com/gpt-cmdr/ras-commander
- **Examples**: https://github.com/gpt-cmdr/ras-commander/tree/main/examples
- **Report Issues**: https://github.com/gpt-cmdr/ras-commander/issues

---

## 📞 Support

If you encounter issues:

1. **Check this guide** - Most common issues are covered above
2. **Server logs** - Look at the terminal where you ran `gui_server.py`
3. **Browser console** - Press F12 in your browser to see errors
4. **GitHub Issues** - Report bugs at https://github.com/gpt-cmdr/ras-commander/issues

---

## 🎊 You're All Set!

Your RAS Commander GUI is ready to use. Just run:

```bash
python3 gui_server.py
```

Then open http://localhost:5000 in your browser and start automating HEC-RAS!

**Enjoy using RAS Commander! 🌊**
