/**
 * Huff Flow Calculator - Exemption Form JavaScript
 *
 * Handles form interactions, calculations, and PDF generation
 * for the static exemption analysis page.
 */

// Global state
let currentResult = null;
let tcModalCondition = 'existing';

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initializeLandCoverSelects();
    initializeEventListeners();
    updatePrecipitation();
});

/**
 * Populate land cover select options
 */
function initializeLandCoverSelects() {
    const landCovers = listLandCovers();
    const selects = document.querySelectorAll('.land-cover-type');

    selects.forEach(select => {
        // Keep first option
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);

        landCovers.forEach(lc => {
            const option = document.createElement('option');
            option.value = lc;
            option.textContent = lc.replace(/_/g, ' ');
            select.appendChild(option);
        });
    });
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Storm parameters
    document.getElementById('returnPeriod').addEventListener('change', updatePrecipitation);
    document.getElementById('duration').addEventListener('change', updatePrecipitation);

    // Land cover changes
    document.getElementById('existingLandCovers').addEventListener('change', updateExistingCN);
    document.getElementById('existingLandCovers').addEventListener('input', updateExistingCN);
    document.getElementById('proposedLandCovers').addEventListener('change', updateProposedCN);
    document.getElementById('proposedLandCovers').addEventListener('input', updateProposedCN);

    // Add land cover buttons
    document.getElementById('addExistingLc').addEventListener('click', () => addLandCoverRow('existing'));
    document.getElementById('addProposedLc').addEventListener('click', () => addLandCoverRow('proposed'));

    // Form submission
    document.getElementById('exemptionForm').addEventListener('submit', handleFormSubmit);

    // Load example button
    document.getElementById('loadExample').addEventListener('click', loadExample);

    // New analysis button
    document.getElementById('newAnalysis').addEventListener('click', () => {
        document.getElementById('resultsSection').classList.add('d-none');
        document.getElementById('exemptionForm').classList.remove('d-none');
        window.scrollTo(0, 0);
    });

    // PDF download button
    document.getElementById('downloadPdf').addEventListener('click', generatePDF);

    // Tc calculator modal
    const tcModal = document.getElementById('tcCalculatorModal');
    tcModal.addEventListener('show.bs.modal', function(event) {
        tcModalCondition = event.relatedTarget.getAttribute('data-condition');
    });

    // Tc calculator inputs
    ['tcOverlandLength', 'tcOverlandSlope', 'tcOverlandRoughness', 'tcChannelLength', 'tcChannelSlope'].forEach(id => {
        document.getElementById(id).addEventListener('input', updateModalTc);
    });

    // Apply Tc button
    document.getElementById('applyTc').addEventListener('click', applyTcValue);

    updateModalTc();
}

/**
 * Update precipitation depth based on selected duration and return period
 */
function updatePrecipitation() {
    const duration = document.getElementById('duration').value;
    const returnPeriod = document.getElementById('returnPeriod').value;

    const depth = getPrecipitationDepth(duration, returnPeriod);
    if (depth !== null) {
        document.getElementById('precipitation').value = depth.toFixed(2);
    }
}

/**
 * Add a new land cover row
 */
function addLandCoverRow(condition) {
    const container = document.getElementById(condition + 'LandCovers');
    const landCovers = listLandCovers();

    const row = document.createElement('div');
    row.className = 'land-cover-row mb-3';
    row.innerHTML = `
        <div class="row g-2">
            <div class="col-7">
                <select class="form-select land-cover-type" name="${condition}_type[]">
                    <option value="">Select land cover...</option>
                    ${landCovers.map(lc => `<option value="${lc}">${lc.replace(/_/g, ' ')}</option>`).join('')}
                </select>
            </div>
            <div class="col-4">
                <div class="input-group">
                    <input type="number" class="form-control land-cover-area"
                           name="${condition}_area[]" placeholder="Area" step="0.01" min="0">
                    <span class="input-group-text">ac</span>
                </div>
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-outline-danger btn-remove-lc">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        </div>
    `;

    container.appendChild(row);

    // Add remove button handler
    row.querySelector('.btn-remove-lc').addEventListener('click', function() {
        row.remove();
        if (condition === 'existing') {
            updateExistingCN();
        } else {
            updateProposedCN();
        }
        updateRemoveButtons(condition);
    });

    updateRemoveButtons(condition);
}

/**
 * Update remove button states
 */
function updateRemoveButtons(condition) {
    const container = document.getElementById(condition + 'LandCovers');
    const rows = container.querySelectorAll('.land-cover-row');
    const buttons = container.querySelectorAll('.btn-remove-lc');

    buttons.forEach(btn => {
        btn.disabled = rows.length <= 1;
    });
}

/**
 * Update existing conditions CN
 */
function updateExistingCN() {
    const landCovers = getLandCoversFromContainer('existingLandCovers', 'B');

    if (landCovers.length === 0 || landCovers.every(lc => !lc.type || lc.area <= 0)) {
        document.getElementById('existingCN').value = '';
        document.getElementById('existingArea').value = '';
        return;
    }

    const validCovers = landCovers.filter(lc => lc.type && lc.area > 0);
    if (validCovers.length === 0) {
        document.getElementById('existingCN').value = '';
        document.getElementById('existingArea').value = '';
        return;
    }

    try {
        const cn = calculateCompositeCN(validCovers);
        const totalArea = validCovers.reduce((sum, lc) => sum + lc.area, 0);
        document.getElementById('existingCN').value = cn.toFixed(1);
        document.getElementById('existingArea').value = totalArea.toFixed(2);
    } catch (e) {
        document.getElementById('existingCN').value = 'Error';
        document.getElementById('existingArea').value = '';
    }
}

/**
 * Update proposed conditions CN
 */
function updateProposedCN() {
    const landCovers = getLandCoversFromContainer('proposedLandCovers', 'D');

    if (landCovers.length === 0 || landCovers.every(lc => !lc.type || lc.area <= 0)) {
        document.getElementById('proposedCN').value = '';
        document.getElementById('proposedArea').value = '';
        return;
    }

    const validCovers = landCovers.filter(lc => lc.type && lc.area > 0);
    if (validCovers.length === 0) {
        document.getElementById('proposedCN').value = '';
        document.getElementById('proposedArea').value = '';
        return;
    }

    try {
        const cn = calculateCompositeCN(validCovers);
        const totalArea = validCovers.reduce((sum, lc) => sum + lc.area, 0);
        document.getElementById('proposedCN').value = cn.toFixed(1);
        document.getElementById('proposedArea').value = totalArea.toFixed(2);
    } catch (e) {
        document.getElementById('proposedCN').value = 'Error';
        document.getElementById('proposedArea').value = '';
    }
}

/**
 * Get land covers from a container
 */
function getLandCoversFromContainer(containerId, soilGroup) {
    const container = document.getElementById(containerId);
    const rows = container.querySelectorAll('.land-cover-row');
    const landCovers = [];

    rows.forEach(row => {
        const type = row.querySelector('.land-cover-type').value;
        const area = parseFloat(row.querySelector('.land-cover-area').value) || 0;

        landCovers.push({
            type: type,
            area: area,
            soil: soilGroup
        });
    });

    return landCovers;
}

/**
 * Update Tc in modal
 */
function updateModalTc() {
    const overlandLength = parseFloat(document.getElementById('tcOverlandLength').value) || 0;
    const overlandSlope = parseFloat(document.getElementById('tcOverlandSlope').value) || 0.01;
    const overlandRoughness = parseFloat(document.getElementById('tcOverlandRoughness').value) || 0.4;
    const channelLength = parseFloat(document.getElementById('tcChannelLength').value) || 0;
    const channelSlope = parseFloat(document.getElementById('tcChannelSlope').value) || 0.01;

    try {
        const result = calculateTimeOfConcentration(
            overlandLength, overlandSlope, overlandRoughness,
            channelLength, channelSlope
        );
        document.getElementById('calculatedTc').textContent = result.totalTc.toFixed(1);
    } catch (e) {
        document.getElementById('calculatedTc').textContent = '--';
    }
}

/**
 * Apply Tc value from modal
 */
function applyTcValue() {
    const tc = document.getElementById('calculatedTc').textContent;
    if (tc !== '--') {
        const targetId = tcModalCondition === 'existing' ? 'existingTc' : 'proposedTc';
        document.getElementById(targetId).value = tc;
    }

    bootstrap.Modal.getInstance(document.getElementById('tcCalculatorModal')).hide();
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
    event.preventDefault();

    // Get form data
    const existingLC = getLandCoversFromContainer('existingLandCovers', 'B')
        .filter(lc => lc.type && lc.area > 0);
    const proposedLC = getLandCoversFromContainer('proposedLandCovers', 'D')
        .filter(lc => lc.type && lc.area > 0);

    if (existingLC.length === 0 || proposedLC.length === 0) {
        alert('Please enter at least one land cover for both existing and proposed conditions.');
        return;
    }

    const existingTc = parseFloat(document.getElementById('existingTc').value) || 15;
    const proposedTc = parseFloat(document.getElementById('proposedTc').value) || 12;
    const receivingSystem = document.querySelector('input[name="receiving_system"]:checked').value;
    const returnPeriod = document.getElementById('returnPeriod').value;
    const duration = document.getElementById('duration').value;
    const durationHours = parseInt(duration.replace('hr', ''));

    // Build conditions
    const existing = {
        landCovers: existingLC,
        tcMinutes: existingTc
    };

    const proposed = {
        landCovers: proposedLC,
        tcMinutes: proposedTc
    };

    // Run analysis
    try {
        currentResult = analyzeExemption(
            existing, proposed, receivingSystem, returnPeriod, durationHours, false
        );

        // Add project info to result
        currentResult.projectName = document.getElementById('projectName').value;
        currentResult.engineerName = document.getElementById('engineerName').value;

        // Display results
        displayResults(currentResult);
    } catch (e) {
        alert('Error running analysis: ' + e.message);
        console.error(e);
    }
}

/**
 * Display analysis results
 */
function displayResults(result) {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = formatExemptionResultsHTML(result, result.projectName);

    document.getElementById('exemptionForm').classList.add('d-none');
    document.getElementById('resultsSection').classList.remove('d-none');
    document.getElementById('resultsSection').classList.add('fade-in');

    window.scrollTo(0, 0);
}

/**
 * Load example data
 */
function loadExample() {
    // Set project info
    document.getElementById('projectName').value = 'Sample Subdivision';
    document.getElementById('engineerName').value = 'John Engineer';

    // Set storm parameters
    document.getElementById('returnPeriod').value = '10yr';
    document.getElementById('duration').value = '24hr';
    updatePrecipitation();

    // Clear and set existing land covers
    const existingContainer = document.getElementById('existingLandCovers');
    existingContainer.innerHTML = '';

    // Add existing land covers
    addLandCoverRowWithData('existing', 'Open_Space_Good', 4.5);
    addLandCoverRowWithData('existing', 'Impervious', 0.5);

    // Clear and set proposed land covers
    const proposedContainer = document.getElementById('proposedLandCovers');
    proposedContainer.innerHTML = '';

    // Add proposed land covers
    addLandCoverRowWithData('proposed', 'Open_Space_Good', 2.0);
    addLandCoverRowWithData('proposed', 'Impervious', 3.0);

    // Set Tc values
    document.getElementById('existingTc').value = '15';
    document.getElementById('proposedTc').value = '10';

    // Set receiving system
    document.getElementById('receivingPipe').checked = true;

    // Update CNs
    updateExistingCN();
    updateProposedCN();
}

/**
 * Add a land cover row with data
 */
function addLandCoverRowWithData(condition, type, area) {
    addLandCoverRow(condition);

    const container = document.getElementById(condition + 'LandCovers');
    const rows = container.querySelectorAll('.land-cover-row');
    const lastRow = rows[rows.length - 1];

    lastRow.querySelector('.land-cover-type').value = type;
    lastRow.querySelector('.land-cover-area').value = area;
}

/**
 * Generate PDF report
 */
function generatePDF() {
    if (!currentResult) {
        alert('No results to export.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('McHenry County Exemption Analysis', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Project info
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Project: ${currentResult.projectName || 'Unnamed Project'}`, 20, y);
    y += 7;
    if (currentResult.engineerName) {
        doc.text(`Prepared By: ${currentResult.engineerName}`, 20, y);
        y += 7;
    }
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, y);
    y += 15;

    // Design Storm
    doc.setFont('helvetica', 'bold');
    doc.text('Design Storm', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Return Period: ${currentResult.returnPeriod}`, 25, y);
    y += 5;
    doc.text(`Duration: ${currentResult.durationHours} hours`, 25, y);
    y += 5;
    doc.text(`Rainfall Depth: ${currentResult.precipInches.toFixed(2)} inches`, 25, y);
    y += 12;

    // Existing Conditions
    doc.setFont('helvetica', 'bold');
    doc.text('Existing Conditions (Soil Group B)', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Composite CN: ${currentResult.existingCN.toFixed(1)}`, 25, y);
    y += 5;
    doc.text(`Runoff Depth: ${currentResult.existingRunoffInches.toFixed(2)} inches`, 25, y);
    y += 5;
    doc.text(`Peak Discharge: ${currentResult.existingPeakCfs.toFixed(2)} cfs`, 25, y);
    y += 12;

    // Proposed Conditions
    doc.setFont('helvetica', 'bold');
    doc.text('Proposed Conditions (Soil Group D)', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Composite CN: ${currentResult.proposedCN.toFixed(1)}`, 25, y);
    y += 5;
    doc.text(`Runoff Depth: ${currentResult.proposedRunoffInches.toFixed(2)} inches`, 25, y);
    y += 5;
    doc.text(`Peak Discharge: ${currentResult.proposedPeakCfs.toFixed(2)} cfs`, 25, y);
    y += 12;

    // Comparison
    doc.setFont('helvetica', 'bold');
    doc.text('Comparison', 20, y);
    y += 7;
    doc.setFont('helvetica', 'normal');
    doc.text(`Flow Increase: ${currentResult.flowIncreaseCfs.toFixed(2)} cfs`, 25, y);
    y += 5;
    doc.text(`Percentage Increase: ${currentResult.flowIncreasePct.toFixed(1)}%`, 25, y);
    y += 5;
    doc.text(`Receiving System: ${currentResult.receivingSystem.charAt(0).toUpperCase() + currentResult.receivingSystem.slice(1)}`, 25, y);
    y += 5;
    doc.text(`Threshold: ${currentResult.thresholdCfs.toFixed(1)} cfs`, 25, y);
    y += 12;

    // Determination
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const statusText = currentResult.isExempt ? 'EXEMPT' : 'DETENTION REQUIRED';
    doc.text(`Determination: ${statusText}`, 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Word wrap the determination text
    const splitText = doc.splitTextToSize(currentResult.determination, pageWidth - 40);
    doc.text(splitText, 20, y);
    y += splitText.length * 5 + 5;

    // Detention requirements if applicable
    if (!currentResult.isExempt && currentResult.requiredReductionCfs !== null) {
        y += 5;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text('Detention Requirements', 20, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.text(`Required Flow Reduction: ${currentResult.requiredReductionCfs.toFixed(2)} cfs`, 25, y);
        y += 5;
        doc.text(`Allowable Release Rate: ${currentResult.allowableReleaseCfs.toFixed(2)} cfs`, 25, y);
        y += 10;
    }

    // Footer note
    y = doc.internal.pageSize.getHeight() - 30;
    doc.setFontSize(8);
    doc.text('Data Source: ISWS Bulletin 75 (March 2020)', 20, y);
    y += 4;
    doc.text('This analysis uses McHenry County methodology (Soil B existing, D proposed).', 20, y);
    y += 4;
    doc.text('Generated by Huff Flow Calculator - gheistand.dev/huff-flow', 20, y);

    // Save the PDF
    const filename = `${(currentResult.projectName || 'exemption_analysis').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
}
