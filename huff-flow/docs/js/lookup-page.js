/**
 * Huff Flow Calculator - Lookup Page JavaScript
 *
 * Handles data lookup interactions for precipitation, CN, and Tc calculations.
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeLandCoverSelect();
    initializeEventListeners();
    updatePrecipLookup();
    calculateTc();
});

/**
 * Populate land cover select options
 */
function initializeLandCoverSelect() {
    const select = document.getElementById('cnLandCover');
    const landCovers = listLandCovers();

    landCovers.forEach(lc => {
        const option = document.createElement('option');
        option.value = lc;
        option.textContent = lc.replace(/_/g, ' ');
        select.appendChild(option);
    });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Precipitation lookup
    document.getElementById('precipDuration').addEventListener('change', updatePrecipLookup);
    document.getElementById('precipReturnPeriod').addEventListener('change', updatePrecipLookup);

    // Curve number lookup
    document.getElementById('cnLandCover').addEventListener('change', updateCNLookup);

    // Time of concentration calculator
    document.querySelectorAll('.tc-input').forEach(input => {
        input.addEventListener('input', calculateTc);
        input.addEventListener('change', calculateTc);
    });
}

/**
 * Update precipitation lookup
 */
function updatePrecipLookup() {
    const duration = document.getElementById('precipDuration').value;
    const returnPeriod = document.getElementById('precipReturnPeriod').value;

    const depth = getPrecipitationDepth(duration, returnPeriod);

    if (depth !== null) {
        document.getElementById('precipResult').textContent = depth.toFixed(2);

        // Get Huff quartile recommendation
        let durationHours = 24;
        if (duration.endsWith('min')) {
            durationHours = parseInt(duration) / 60;
        } else if (duration.endsWith('hr')) {
            durationHours = parseInt(duration);
        }
        const quartile = getHuffQuartileRecommendation(durationHours);
        document.getElementById('huffQuartile').textContent = quartile;
    } else {
        document.getElementById('precipResult').textContent = '--';
        document.getElementById('huffQuartile').textContent = '--';
    }
}

/**
 * Update CN lookup
 */
function updateCNLookup() {
    const landCover = document.getElementById('cnLandCover').value;

    if (landCover && CN_TABLE[landCover]) {
        const cn = CN_TABLE[landCover];
        document.getElementById('cnA').textContent = cn.A;
        document.getElementById('cnB').textContent = cn.B;
        document.getElementById('cnC').textContent = cn.C;
        document.getElementById('cnD').textContent = cn.D;
    } else {
        document.getElementById('cnA').textContent = '--';
        document.getElementById('cnB').textContent = '--';
        document.getElementById('cnC').textContent = '--';
        document.getElementById('cnD').textContent = '--';
    }
}

/**
 * Calculate time of concentration
 */
function calculateTc() {
    const overlandLength = parseFloat(document.getElementById('tcOverlandLengthLookup').value) || 0;
    const overlandSlope = parseFloat(document.getElementById('tcOverlandSlopeLookup').value) || 0.01;
    const overlandRoughness = parseFloat(document.getElementById('tcOverlandRoughnessLookup').value) || 0.4;
    const channelLength = parseFloat(document.getElementById('tcChannelLengthLookup').value) || 0;
    const channelSlope = parseFloat(document.getElementById('tcChannelSlopeLookup').value) || 0.01;

    try {
        const result = calculateTimeOfConcentration(
            overlandLength,
            overlandSlope,
            overlandRoughness,
            channelLength,
            channelSlope
        );

        document.getElementById('tcOverlandResult').textContent = result.overlandTime.toFixed(1);
        document.getElementById('tcChannelResult').textContent = result.channelTime.toFixed(1);
        document.getElementById('tcTotalResult').textContent = result.totalTc.toFixed(1);

        // Display warnings
        const warningsDiv = document.getElementById('tcWarnings');
        warningsDiv.innerHTML = '';

        if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
                const alertDiv = document.createElement('div');
                alertDiv.className = 'alert alert-warning py-2 mb-1';
                alertDiv.innerHTML = `<i class="bi bi-exclamation-triangle me-2"></i>${warning}`;
                warningsDiv.appendChild(alertDiv);
            });
        }
    } catch (error) {
        document.getElementById('tcOverlandResult').textContent = '--';
        document.getElementById('tcChannelResult').textContent = '--';
        document.getElementById('tcTotalResult').textContent = '--';
        console.error('Error calculating Tc:', error);
    }
}
