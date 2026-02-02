/**
 * Huff Flow Calculator - Hydrology Calculations Module
 *
 * Core hydrologic calculations:
 * - SCS Curve Number runoff calculation
 * - Time of Concentration (Kerby-Kirpich method)
 * - Peak discharge estimation (SCS method)
 *
 * References:
 * - ISWS Bulletin 75 (2020)
 * - USDA NRCS TR-55 (1986)
 */

// =============================================================================
// CURVE NUMBER CALCULATIONS
// =============================================================================

/**
 * Calculate composite (weighted) Curve Number for multiple land covers.
 *
 * @param {Array} landCovers - Array of {type, area, soil} objects
 * @returns {number} Composite Curve Number (area-weighted average)
 */
function calculateCompositeCN(landCovers) {
    if (!landCovers || landCovers.length === 0) {
        throw new Error("At least one land cover must be provided");
    }

    let totalArea = 0;
    let weightedCN = 0;

    for (const lc of landCovers) {
        if (!CN_TABLE[lc.type]) {
            throw new Error(`Unknown land cover type: ${lc.type}`);
        }
        if (!CN_TABLE[lc.type][lc.soil]) {
            throw new Error(`Unknown soil group: ${lc.soil}`);
        }

        totalArea += lc.area;
        weightedCN += CN_TABLE[lc.type][lc.soil] * lc.area;
    }

    if (totalArea <= 0) {
        throw new Error("Total area must be greater than zero");
    }

    return weightedCN / totalArea;
}

/**
 * Get Curve Number using McHenry County methodology.
 *
 * @param {string} landCover - Land cover type
 * @param {string} condition - 'existing' (uses Soil B) or 'proposed' (uses Soil D)
 * @returns {number} Curve Number value
 */
function getCNForMcHenry(landCover, condition = 'existing') {
    const soil = condition === 'existing' ? 'B' : 'D';
    return CN_TABLE[landCover][soil];
}

// =============================================================================
// RUNOFF DEPTH CALCULATION
// =============================================================================

/**
 * Calculate direct runoff depth using SCS Curve Number method.
 *
 * Formula: Q = (P - Ia)^2 / (P - Ia + S)
 * where S = (1000/CN) - 10, Ia = 0.2S
 *
 * @param {number} precipInches - Total precipitation depth (inches)
 * @param {number} curveNumber - SCS Curve Number (30-98)
 * @returns {number} Direct runoff depth (inches)
 */
function calculateRunoffDepth(precipInches, curveNumber) {
    if (curveNumber < 30 || curveNumber > 98) {
        throw new Error(`Curve Number must be between 30 and 98, got ${curveNumber}`);
    }

    if (precipInches < 0) {
        throw new Error(`Precipitation cannot be negative, got ${precipInches}`);
    }

    // Calculate potential maximum retention (S) in inches
    const S = (1000 / curveNumber) - 10;

    // Calculate initial abstraction
    const Ia = 0.2 * S;

    // If precipitation is less than initial abstraction, no runoff
    if (precipInches <= Ia) {
        return 0.0;
    }

    // Calculate runoff using SCS equation
    const Q = Math.pow(precipInches - Ia, 2) / (precipInches - Ia + S);

    return Q;
}

// =============================================================================
// TIME OF CONCENTRATION
// =============================================================================

/**
 * Calculate overland flow time using Kerby equation.
 *
 * Formula: t_o = 0.828 * ((L * n) / S^0.5)^0.467
 *
 * @param {number} lengthFt - Overland flow length (feet), max 1000 ft recommended
 * @param {number} slope - Average slope (ft/ft)
 * @param {number} roughness - Kerby roughness coefficient (n)
 * @returns {number} Overland flow time (minutes)
 */
function calculateTcKerby(lengthFt, slope, roughness) {
    if (lengthFt <= 0) {
        throw new Error("Flow length must be positive");
    }
    if (slope <= 0) {
        throw new Error("Slope must be positive");
    }
    if (roughness <= 0) {
        throw new Error("Roughness must be positive");
    }

    // Kerby equation
    const tOverland = 0.828 * Math.pow((lengthFt * roughness) / Math.sqrt(slope), 0.467);

    return tOverland;
}

/**
 * Calculate channel flow time using Kirpich equation.
 *
 * Formula: t_c = 0.0078 * L^0.77 * S^-0.385
 *
 * @param {number} lengthFt - Channel flow length (feet)
 * @param {number} slope - Average channel slope (ft/ft)
 * @returns {number} Channel flow time (minutes)
 */
function calculateTcKirpich(lengthFt, slope) {
    if (lengthFt <= 0) {
        throw new Error("Flow length must be positive");
    }
    if (slope <= 0) {
        throw new Error("Slope must be positive");
    }

    // Kirpich equation
    const tChannel = 0.0078 * Math.pow(lengthFt, 0.77) * Math.pow(slope, -0.385);

    return tChannel;
}

/**
 * Calculate total time of concentration using Kerby-Kirpich method.
 *
 * @param {number} overlandLengthFt - Overland flow length (feet)
 * @param {number} overlandSlope - Overland slope (ft/ft)
 * @param {number} overlandRoughness - Kerby roughness coefficient
 * @param {number} channelLengthFt - Channel flow length (feet), default 0
 * @param {number} channelSlope - Channel slope (ft/ft), default 0.01
 * @param {number} minimumTc - Minimum time of concentration (minutes), default 5
 * @returns {Object} {totalTc, overlandTime, channelTime, warnings}
 */
function calculateTimeOfConcentration(
    overlandLengthFt,
    overlandSlope,
    overlandRoughness,
    channelLengthFt = 0,
    channelSlope = 0.01,
    minimumTc = 5.0
) {
    const result = {
        overlandTime: 0.0,
        channelTime: 0.0,
        totalTc: 0.0,
        warnings: []
    };

    // Calculate overland flow time
    if (overlandLengthFt > 0) {
        result.overlandTime = calculateTcKerby(overlandLengthFt, overlandSlope, overlandRoughness);
    }

    // Calculate channel flow time
    if (channelLengthFt > 0) {
        result.channelTime = calculateTcKirpich(channelLengthFt, channelSlope);
    }

    // Total time of concentration
    let totalTc = result.overlandTime + result.channelTime;

    // Apply minimum
    if (totalTc < minimumTc) {
        result.warnings.push(
            `Calculated Tc (${totalTc.toFixed(1)} min) < minimum (${minimumTc} min). Using minimum Tc.`
        );
        totalTc = minimumTc;
    }

    // Warning for unusual values
    if (totalTc > 1440) {  // 24 hours
        result.warnings.push(
            `Tc > 24 hours (${totalTc.toFixed(1)} min) - unusual for small watershed`
        );
    }

    result.totalTc = totalTc;
    return result;
}

// =============================================================================
// HUFF DISTRIBUTION AND HYETOGRAPH
// =============================================================================

/**
 * Interpolate cumulative rainfall percentage from Huff distribution.
 *
 * @param {number} timeFraction - Fraction of storm duration (0 to 1)
 * @param {string} quartile - Huff quartile ('1st', '2nd', '3rd', or '4th')
 * @returns {number} Cumulative rainfall percentage (0 to 100)
 */
function interpolateHuff(timeFraction, quartile = '3rd') {
    if (timeFraction < 0 || timeFraction > 1) {
        throw new Error("Time fraction must be between 0 and 1");
    }

    const huffData = HUFF_POINT[quartile];
    const timePoints = Object.keys(huffData).map(Number).sort((a, b) => a - b);

    // Find surrounding points for interpolation
    for (let i = 0; i < timePoints.length - 1; i++) {
        if (timePoints[i] <= timeFraction && timeFraction <= timePoints[i + 1]) {
            const t1 = timePoints[i];
            const t2 = timePoints[i + 1];
            const p1 = huffData[t1];
            const p2 = huffData[t2];
            // Linear interpolation
            return p1 + (p2 - p1) * (timeFraction - t1) / (t2 - t1);
        }
    }

    // Edge cases
    if (timeFraction <= 0) {
        return 0.0;
    }
    return 100.0;
}

/**
 * Generate rainfall hyetograph using Huff distribution.
 *
 * @param {number} totalPrecipInches - Total storm precipitation (inches)
 * @param {number} durationHours - Storm duration (hours)
 * @param {number} timeStepMinutes - Time step for output (minutes), default 5
 * @param {string} quartile - Huff quartile, auto-selected if not provided
 * @returns {Object} {timeMinutes, cumulativeInches, incrementalInches}
 */
function generateHyetograph(
    totalPrecipInches,
    durationHours,
    timeStepMinutes = 5.0,
    quartile = null
) {
    if (quartile === null) {
        quartile = getHuffQuartileRecommendation(durationHours);
    }

    const durationMinutes = durationHours * 60;
    const nSteps = Math.ceil(durationMinutes / timeStepMinutes) + 1;

    const timeMinutes = [];
    const timeFractions = [];
    for (let i = 0; i < nSteps; i++) {
        const t = (i / (nSteps - 1)) * durationMinutes;
        timeMinutes.push(t);
        timeFractions.push(t / durationMinutes);
    }

    // Get cumulative percentages and convert to inches
    const cumulativeInches = timeFractions.map(tf =>
        (interpolateHuff(tf, quartile) / 100.0) * totalPrecipInches
    );

    // Calculate incremental rainfall
    const incrementalInches = [0];
    for (let i = 1; i < cumulativeInches.length; i++) {
        incrementalInches.push(cumulativeInches[i] - cumulativeInches[i - 1]);
    }

    return {
        timeMinutes,
        cumulativeInches,
        incrementalInches,
        quartile
    };
}

// =============================================================================
// PEAK DISCHARGE CALCULATION
// =============================================================================

/**
 * Calculate peak discharge using SCS Unit Hydrograph method.
 *
 * Formula: qp = 484 * A * Q / Tp
 * where:
 * - A = area in square miles
 * - Q = runoff depth in inches
 * - Tp = time to peak = D/2 + 0.6*Tc
 *
 * @param {number} areaAcres - Drainage area (acres)
 * @param {number} runoffDepthInches - Total runoff depth (inches)
 * @param {number} tcHours - Time of concentration (hours)
 * @param {number} durationHours - Storm duration (hours), default 24
 * @returns {Object} {peakDischarge, details}
 */
function calculatePeakDischargeSCS(
    areaAcres,
    runoffDepthInches,
    tcHours,
    durationHours = 24.0
) {
    if (areaAcres <= 0) {
        throw new Error("Area must be positive");
    }
    if (runoffDepthInches < 0) {
        throw new Error("Runoff depth cannot be negative");
    }
    if (tcHours <= 0) {
        throw new Error("Time of concentration must be positive");
    }

    // Convert area to square miles
    const areaSqMi = areaAcres / 640.0;

    // Calculate time to peak
    const D = durationHours / 24.0;  // Duration of unit hydrograph increment
    const Tp = D / 2 + 0.6 * tcHours;

    // SCS unit hydrograph peak discharge coefficient
    const qpUnit = 484 * areaSqMi / Tp;

    // Peak discharge for actual runoff
    const qp = qpUnit * runoffDepthInches;

    const details = {
        areaSqMi,
        D_hours: D,
        Tp_hours: Tp,
        qpUnit,
        runoffInches: runoffDepthInches
    };

    return {
        peakDischarge: qp,
        details
    };
}

/**
 * Calculate peak discharge using Rational Method.
 *
 * Formula: Q = C * I * A
 *
 * @param {number} areaAcres - Drainage area (acres)
 * @param {number} intensityInHr - Rainfall intensity (inches/hour)
 * @param {number} cCoefficient - Runoff coefficient (0-1)
 * @returns {number} Peak discharge (cfs)
 */
function calculatePeakDischargeRational(areaAcres, intensityInHr, cCoefficient) {
    if (cCoefficient < 0 || cCoefficient > 1) {
        throw new Error("Runoff coefficient must be between 0 and 1");
    }

    return cCoefficient * intensityInHr * areaAcres;
}

// =============================================================================
// COMPLETE ANALYSIS FUNCTION
// =============================================================================

/**
 * Run complete hydrologic analysis.
 *
 * @param {number} areaAcres - Total drainage area (acres)
 * @param {Array} landCovers - Land cover information for CN calculation
 * @param {number} tcMinutes - Time of concentration (minutes)
 * @param {number} precipInches - Total precipitation depth (inches)
 * @param {number} durationHours - Storm duration (hours), default 24
 * @param {string} quartile - Huff quartile, auto-selected if not provided
 * @returns {Object} Complete analysis results
 */
function runAnalysis(
    areaAcres,
    landCovers,
    tcMinutes,
    precipInches,
    durationHours = 24.0,
    quartile = null
) {
    if (quartile === null) {
        quartile = getHuffQuartileRecommendation(durationHours);
    }

    // Calculate composite CN
    const compositeCN = calculateCompositeCN(landCovers);

    // Calculate runoff depth
    const runoffDepth = calculateRunoffDepth(precipInches, compositeCN);

    // Calculate peak discharge
    const tcHours = tcMinutes / 60.0;
    const { peakDischarge, details: peakDetails } = calculatePeakDischargeSCS(
        areaAcres, runoffDepth, tcHours, durationHours
    );

    return {
        compositeCN,
        runoffDepthInches: runoffDepth,
        peakDischargeCfs: peakDischarge,
        peakDetails,
        quartileUsed: quartile
    };
}
