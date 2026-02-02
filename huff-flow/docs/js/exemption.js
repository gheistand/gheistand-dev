/**
 * Huff Flow Calculator - McHenry County Exemption Analysis Module
 *
 * Implements the quick exemption check for stormwater detention requirements
 * based on McHenry County thresholds and methodology.
 *
 * Key Thresholds:
 * - Pipes: < 1.0 CFS increase = exempt from detention
 * - Swales: < 2.5 CFS increase = exempt from detention
 *
 * McHenry County Methodology:
 * - Existing conditions: Use Hydrologic Soil Group B (actual conditions)
 * - Proposed conditions: Use Hydrologic Soil Group D (conservative)
 */

// Exemption thresholds for McHenry County
const EXEMPTION_THRESHOLDS = {
    pipe: 1.0,
    swale: 2.5
};

// Flow reduction factors for McHenry County
const FLOW_REDUCTION_FACTORS = {
    impervious_cfs_per_acre: 0.85,
    cleared_cfs_per_acre: 0.30
};

/**
 * Convert land covers to use McHenry County soil group convention.
 *
 * @param {Array} landCovers - Original land covers with any soil group
 * @param {string} condition - 'existing' (uses Soil B) or 'proposed' (uses Soil D)
 * @returns {Array} Land covers with McHenry County soil groups applied
 */
function convertToMcHenryCondition(landCovers, condition = 'existing') {
    const soil = condition === 'existing' ? 'B' : 'D';
    return landCovers.map(lc => ({
        type: lc.type,
        area: lc.area,
        soil: soil
    }));
}

/**
 * Perform McHenry County exemption analysis.
 *
 * @param {Object} existing - Existing site conditions {landCovers, tcMinutes, totalAreaAcres}
 * @param {Object} proposed - Proposed site conditions {landCovers, tcMinutes, totalAreaAcres}
 * @param {string} receivingSystem - 'pipe' or 'swale'
 * @param {string} returnPeriod - Design storm return period (default '10yr')
 * @param {number} durationHours - Storm duration (default 24 hours)
 * @param {boolean} useMcHenryCN - Apply McHenry County CN convention (default true)
 * @returns {Object} Complete exemption analysis results
 */
function analyzeExemption(
    existing,
    proposed,
    receivingSystem,
    returnPeriod = '10yr',
    durationHours = 24.0,
    useMcHenryCN = true
) {
    // Calculate total areas if not provided
    if (!existing.totalAreaAcres) {
        existing.totalAreaAcres = existing.landCovers.reduce((sum, lc) => sum + lc.area, 0);
    }
    if (!proposed.totalAreaAcres) {
        proposed.totalAreaAcres = proposed.landCovers.reduce((sum, lc) => sum + lc.area, 0);
    }

    // Get precipitation depth
    const durationKey = `${Math.floor(durationHours)}hr`;
    const precipInches = getPrecipitationDepth(durationKey, returnPeriod);

    // Apply McHenry County CN convention if requested
    let existingLC, proposedLC;
    if (useMcHenryCN) {
        existingLC = convertToMcHenryCondition(existing.landCovers, 'existing');
        proposedLC = convertToMcHenryCondition(proposed.landCovers, 'proposed');
    } else {
        existingLC = existing.landCovers;
        proposedLC = proposed.landCovers;
    }

    // Run analysis for existing conditions
    const existingResults = runAnalysis(
        existing.totalAreaAcres,
        existingLC,
        existing.tcMinutes,
        precipInches,
        durationHours
    );

    // Run analysis for proposed conditions
    const proposedResults = runAnalysis(
        proposed.totalAreaAcres,
        proposedLC,
        proposed.tcMinutes,
        precipInches,
        durationHours
    );

    // Calculate flow increase
    const existingPeak = existingResults.peakDischargeCfs;
    const proposedPeak = proposedResults.peakDischargeCfs;
    const flowIncrease = proposedPeak - existingPeak;
    const flowIncreasePct = existingPeak > 0 ? (flowIncrease / existingPeak * 100) : 0;

    // Determine threshold
    const threshold = EXEMPTION_THRESHOLDS[receivingSystem.toLowerCase()];

    // Check exemption status
    const isExempt = flowIncrease < threshold;

    // Calculate required reduction if not exempt
    let requiredReduction = null;
    let allowableRelease = null;

    if (!isExempt) {
        // Calculate impervious added
        const existingImpervious = existing.landCovers
            .filter(lc => lc.type === 'Impervious')
            .reduce((sum, lc) => sum + lc.area, 0);
        const proposedImpervious = proposed.landCovers
            .filter(lc => lc.type === 'Impervious')
            .reduce((sum, lc) => sum + lc.area, 0);
        const imperviousAdded = Math.max(0, proposedImpervious - existingImpervious);

        // Estimate cleared area (natural areas removed)
        const naturalTypes = ['Woods_Good', 'Woods_Fair', 'Woods_Poor', 'Wetland', 'Native_Vegetation'];
        const existingNatural = existing.landCovers
            .filter(lc => naturalTypes.includes(lc.type))
            .reduce((sum, lc) => sum + lc.area, 0);
        const proposedNatural = proposed.landCovers
            .filter(lc => naturalTypes.includes(lc.type))
            .reduce((sum, lc) => sum + lc.area, 0);
        const clearedArea = Math.max(0, existingNatural - proposedNatural);

        // Required reduction
        requiredReduction = (
            imperviousAdded * FLOW_REDUCTION_FACTORS.impervious_cfs_per_acre +
            clearedArea * FLOW_REDUCTION_FACTORS.cleared_cfs_per_acre
        );

        // Allowable release
        allowableRelease = existingPeak - requiredReduction;
    }

    // Build determination message
    let determination;
    if (isExempt) {
        determination = `EXEMPT - Flow increase (${flowIncrease.toFixed(2)} cfs) is BELOW ` +
            `threshold (${threshold.toFixed(1)} cfs for ${receivingSystem})`;
    } else {
        determination = `DETENTION REQUIRED - Flow increase (${flowIncrease.toFixed(2)} cfs) EXCEEDS ` +
            `threshold (${threshold.toFixed(1)} cfs for ${receivingSystem})`;
    }

    return {
        existingPeakCfs: existingPeak,
        proposedPeakCfs: proposedPeak,
        flowIncreaseCfs: flowIncrease,
        flowIncreasePct: flowIncreasePct,
        receivingSystem: receivingSystem,
        thresholdCfs: threshold,
        isExempt: isExempt,
        determination: determination,
        existingCN: existingResults.compositeCN,
        proposedCN: proposedResults.compositeCN,
        existingRunoffInches: existingResults.runoffDepthInches,
        proposedRunoffInches: proposedResults.runoffDepthInches,
        requiredReductionCfs: requiredReduction,
        allowableReleaseCfs: allowableRelease,
        precipInches: precipInches,
        returnPeriod: returnPeriod,
        durationHours: durationHours
    };
}

/**
 * Simplified exemption check for common scenarios.
 *
 * @param {number} existingImperviousAcres - Existing impervious area
 * @param {number} existingPerviousAcres - Existing pervious area
 * @param {string} existingPerviousType - Type of existing pervious cover
 * @param {number} proposedImperviousAcres - Proposed impervious area
 * @param {number} proposedPerviousAcres - Proposed pervious area
 * @param {string} proposedPerviousType - Type of proposed pervious cover
 * @param {number} tcExistingMinutes - Existing time of concentration
 * @param {number} tcProposedMinutes - Proposed time of concentration
 * @param {string} receivingSystem - 'pipe' or 'swale'
 * @param {string} returnPeriod - Design return period
 * @returns {Object} Exemption analysis results
 */
function quickExemptionCheck(
    existingImperviousAcres,
    existingPerviousAcres,
    existingPerviousType,
    proposedImperviousAcres,
    proposedPerviousAcres,
    proposedPerviousType,
    tcExistingMinutes,
    tcProposedMinutes,
    receivingSystem = 'pipe',
    returnPeriod = '10yr'
) {
    const existingLC = [];
    if (existingImperviousAcres > 0) {
        existingLC.push({ type: 'Impervious', area: existingImperviousAcres, soil: 'B' });
    }
    if (existingPerviousAcres > 0) {
        existingLC.push({ type: existingPerviousType, area: existingPerviousAcres, soil: 'B' });
    }

    const proposedLC = [];
    if (proposedImperviousAcres > 0) {
        proposedLC.push({ type: 'Impervious', area: proposedImperviousAcres, soil: 'D' });
    }
    if (proposedPerviousAcres > 0) {
        proposedLC.push({ type: proposedPerviousType, area: proposedPerviousAcres, soil: 'D' });
    }

    const existing = {
        landCovers: existingLC,
        tcMinutes: tcExistingMinutes
    };

    const proposed = {
        landCovers: proposedLC,
        tcMinutes: tcProposedMinutes
    };

    return analyzeExemption(
        existing,
        proposed,
        receivingSystem,
        returnPeriod,
        24.0,
        false  // Already applied McHenry convention
    );
}

/**
 * Format exemption analysis results as HTML.
 *
 * @param {Object} result - Results from analyzeExemption()
 * @param {string} projectName - Name of the project
 * @returns {string} Formatted HTML
 */
function formatExemptionResultsHTML(result, projectName = "Unnamed Project") {
    const exemptClass = result.isExempt ? 'success' : 'danger';
    const exemptIcon = result.isExempt ? 'check-circle-fill' : 'x-circle-fill';
    const exemptText = result.isExempt ? 'EXEMPT' : 'DETENTION REQUIRED';

    let html = `
        <div class="card mb-3">
            <div class="card-header bg-${exemptClass} text-white">
                <h5 class="mb-0">
                    <i class="bi bi-${exemptIcon} me-2"></i>${exemptText}
                </h5>
            </div>
            <div class="card-body">
                <p class="lead">${result.determination}</p>
            </div>
        </div>

        <div class="row">
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header">
                        <i class="bi bi-tree me-2"></i>Existing Conditions
                    </div>
                    <div class="card-body">
                        <table class="table table-sm mb-0">
                            <tr><td>Composite CN:</td><td class="text-end"><strong>${result.existingCN.toFixed(1)}</strong></td></tr>
                            <tr><td>Runoff Depth:</td><td class="text-end"><strong>${result.existingRunoffInches.toFixed(2)} inches</strong></td></tr>
                            <tr><td>Peak Discharge:</td><td class="text-end"><strong>${result.existingPeakCfs.toFixed(2)} cfs</strong></td></tr>
                        </table>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card mb-3">
                    <div class="card-header">
                        <i class="bi bi-building me-2"></i>Proposed Conditions
                    </div>
                    <div class="card-body">
                        <table class="table table-sm mb-0">
                            <tr><td>Composite CN:</td><td class="text-end"><strong>${result.proposedCN.toFixed(1)}</strong></td></tr>
                            <tr><td>Runoff Depth:</td><td class="text-end"><strong>${result.proposedRunoffInches.toFixed(2)} inches</strong></td></tr>
                            <tr><td>Peak Discharge:</td><td class="text-end"><strong>${result.proposedPeakCfs.toFixed(2)} cfs</strong></td></tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        <div class="card mb-3">
            <div class="card-header">
                <i class="bi bi-bar-chart me-2"></i>Comparison
            </div>
            <div class="card-body">
                <table class="table table-sm mb-0">
                    <tr><td>Flow Increase:</td><td class="text-end"><strong>${result.flowIncreaseCfs.toFixed(2)} cfs</strong></td></tr>
                    <tr><td>Percentage Increase:</td><td class="text-end"><strong>${result.flowIncreasePct.toFixed(1)}%</strong></td></tr>
                    <tr><td>Receiving System:</td><td class="text-end"><strong>${result.receivingSystem.charAt(0).toUpperCase() + result.receivingSystem.slice(1)}</strong></td></tr>
                    <tr><td>Threshold:</td><td class="text-end"><strong>${result.thresholdCfs.toFixed(1)} cfs</strong></td></tr>
                </table>
            </div>
        </div>
    `;

    if (!result.isExempt && result.requiredReductionCfs !== null) {
        html += `
            <div class="card mb-3 border-warning">
                <div class="card-header bg-warning">
                    <i class="bi bi-exclamation-triangle me-2"></i>Detention Requirements
                </div>
                <div class="card-body">
                    <table class="table table-sm mb-0">
                        <tr><td>Required Flow Reduction:</td><td class="text-end"><strong>${result.requiredReductionCfs.toFixed(2)} cfs</strong></td></tr>
                        <tr><td>Allowable Release Rate:</td><td class="text-end"><strong>${result.allowableReleaseCfs.toFixed(2)} cfs</strong></td></tr>
                    </table>
                </div>
            </div>
        `;
    }

    html += `
        <div class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            <small>
                Design Storm: ${result.returnPeriod}, ${result.durationHours}-hour duration,
                ${result.precipInches.toFixed(2)} inches precipitation.
                Analysis uses McHenry County methodology (Soil B existing, D proposed).
                Based on ISWS Bulletin 75 (2020).
            </small>
        </div>
    `;

    return html;
}
