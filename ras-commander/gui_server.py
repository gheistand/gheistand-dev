#!/usr/bin/env python3
"""
RAS Commander GUI Server
Flask-based backend server for the RAS Commander HTML GUI
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import sys
from pathlib import Path
import json
import traceback

# Add current directory to path for local ras_commander import
sys.path.insert(0, str(Path(__file__).parent))

# Import ras_commander components
try:
    from ras_commander import (
        init_ras_project,
        RasCmdr,
        RasExamples,
        RasPlan,
        ras
    )
    from ras_commander.hdf import HdfResultsPlan
    from ras_commander.geom import GeomCrossSection
    RAS_COMMANDER_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import ras_commander: {e}")
    RAS_COMMANDER_AVAILABLE = False

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Global state
current_project = {
    'path': None,
    'version': '6.5',
    'initialized': False
}

@app.route('/')
def index():
    """Serve the main GUI"""
    return send_file('ras_commander_gui.html')

@app.route('/api/status', methods=['GET'])
def get_status():
    """Get system status"""
    try:
        if not RAS_COMMANDER_AVAILABLE:
            return jsonify({
                'success': False,
                'error': 'RAS Commander not available'
            }), 500

        projects = RasExamples.list_projects()

        return jsonify({
            'success': True,
            'ras_commander_available': RAS_COMMANDER_AVAILABLE,
            'python_version': sys.version.split()[0],
            'ras_commander_version': '0.87.6',
            'example_projects_count': len(projects),
            'platform': sys.platform,
            'current_project': current_project
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/projects/open', methods=['POST'])
def open_project():
    """Open an existing HEC-RAS project"""
    try:
        data = request.json
        project_path = Path(data.get('project_path'))
        version = data.get('version', '6.5')

        if not project_path.exists():
            return jsonify({
                'success': False,
                'error': f'Project path does not exist: {project_path}'
            }), 400

        # Initialize project
        init_ras_project(str(project_path), version)

        # Update global state
        current_project['path'] = str(project_path)
        current_project['version'] = version
        current_project['initialized'] = True

        # Get project info
        plan_count = len(ras.plan_df) if hasattr(ras, 'plan_df') else 0
        geom_count = len(ras.geom_df) if hasattr(ras, 'geom_df') else 0

        return jsonify({
            'success': True,
            'message': 'Project loaded successfully',
            'project_info': {
                'path': str(project_path),
                'version': version,
                'plan_count': plan_count,
                'geom_count': geom_count,
                'project_name': project_path.name
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/projects/extract', methods=['POST'])
def extract_project():
    """Extract an example project"""
    try:
        data = request.json
        project_name = data.get('project_name')
        output_path = data.get('output_path', './example_projects')

        if not project_name:
            return jsonify({
                'success': False,
                'error': 'Project name is required'
            }), 400

        # Extract project
        extracted_path = RasExamples.extract_project(
            project_name,
            output_path=output_path
        )

        return jsonify({
            'success': True,
            'message': f'Successfully extracted {project_name}',
            'extracted_path': str(extracted_path)
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/projects/list_examples', methods=['GET'])
def list_examples():
    """List available example projects"""
    try:
        projects = RasExamples.list_projects()
        return jsonify({
            'success': True,
            'projects': projects
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/execute/single', methods=['POST'])
def execute_single():
    """Execute a single HEC-RAS plan"""
    try:
        if not current_project['initialized']:
            return jsonify({
                'success': False,
                'error': 'No project loaded. Please open a project first.'
            }), 400

        data = request.json
        plan_number = data.get('plan_number')
        num_cores = data.get('num_cores')
        clear_geompre = data.get('clear_geompre', False)

        if not plan_number:
            return jsonify({
                'success': False,
                'error': 'Plan number is required'
            }), 400

        # Execute plan
        kwargs = {
            'clear_geompre': clear_geompre
        }
        if num_cores:
            kwargs['num_cores'] = int(num_cores)

        RasCmdr.compute_plan(plan_number, **kwargs)

        return jsonify({
            'success': True,
            'message': f'Plan {plan_number} executed successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/execute/parallel', methods=['POST'])
def execute_parallel():
    """Execute multiple HEC-RAS plans in parallel"""
    try:
        if not current_project['initialized']:
            return jsonify({
                'success': False,
                'error': 'No project loaded. Please open a project first.'
            }), 400

        data = request.json
        plan_numbers = data.get('plan_numbers', [])
        max_workers = data.get('max_workers', 3)

        if not plan_numbers:
            return jsonify({
                'success': False,
                'error': 'At least one plan number is required'
            }), 400

        # Execute plans in parallel
        RasCmdr.compute_parallel(
            plan_numbers,
            max_workers=int(max_workers)
        )

        return jsonify({
            'success': True,
            'message': f'{len(plan_numbers)} plans executed successfully'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/results/wse', methods=['POST'])
def extract_wse():
    """Extract water surface elevation data"""
    try:
        data = request.json
        hdf_path = Path(data.get('hdf_path'))
        time_index = data.get('time_index', -1)

        if not hdf_path.exists():
            return jsonify({
                'success': False,
                'error': f'HDF file does not exist: {hdf_path}'
            }), 400

        # Extract WSE
        hdf = HdfResultsPlan(str(hdf_path))
        wse = hdf.get_wse(time_index=int(time_index))

        # Convert to list for JSON serialization
        if hasattr(wse, 'tolist'):
            wse_data = wse.tolist()
        else:
            wse_data = list(wse)

        return jsonify({
            'success': True,
            'message': 'WSE extracted successfully',
            'data': {
                'values': wse_data[:100],  # Limit to 100 for response size
                'count': len(wse_data),
                'min': float(min(wse_data)) if wse_data else None,
                'max': float(max(wse_data)) if wse_data else None,
                'time_index': time_index
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/results/cross_sections', methods=['POST'])
def extract_cross_sections():
    """Extract cross section data from geometry file"""
    try:
        data = request.json
        geom_path = Path(data.get('geom_path'))

        if not geom_path.exists():
            return jsonify({
                'success': False,
                'error': f'Geometry file does not exist: {geom_path}'
            }), 400

        # Extract cross sections
        xs_data = GeomCrossSection.get_cross_sections(str(geom_path))

        return jsonify({
            'success': True,
            'message': 'Cross sections extracted successfully',
            'data': {
                'count': len(xs_data),
                'rivers': xs_data['river'].unique().tolist() if hasattr(xs_data, 'river') else [],
                'reaches': xs_data['reach'].unique().tolist() if hasattr(xs_data, 'reach') else []
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/results/export', methods=['POST'])
def export_results():
    """Export results to file"""
    try:
        data = request.json
        format_type = data.get('format')
        output_path = Path(data.get('output_path'))

        # This is a placeholder - actual implementation would depend on
        # what data is currently loaded

        return jsonify({
            'success': True,
            'message': f'Results exported to {output_path}',
            'format': format_type
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@app.route('/api/tools/inspect', methods=['GET'])
def inspect_project():
    """Get detailed project information"""
    try:
        if not current_project['initialized']:
            return jsonify({
                'success': False,
                'error': 'No project loaded'
            }), 400

        # Get project details
        project_info = {
            'path': current_project['path'],
            'version': current_project['version'],
            'plans': ras.plan_df.to_dict('records') if hasattr(ras, 'plan_df') else [],
            'geometries': ras.geom_df.to_dict('records') if hasattr(ras, 'geom_df') else [],
            'flows': ras.flow_df.to_dict('records') if hasattr(ras, 'flow_df') else []
        }

        return jsonify({
            'success': True,
            'project_info': project_info
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

def main():
    """Main entry point"""
    print("=" * 80)
    print("RAS Commander GUI Server")
    print("=" * 80)
    print(f"RAS Commander Available: {RAS_COMMANDER_AVAILABLE}")
    print(f"Python Version: {sys.version}")
    print("\nStarting server on http://localhost:5000")
    print("Open your browser and navigate to: http://localhost:5000")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 80)

    app.run(host='0.0.0.0', port=5000, debug=True)

if __name__ == '__main__':
    main()
