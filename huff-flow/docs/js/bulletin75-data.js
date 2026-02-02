/**
 * ISWS Bulletin 75 Data Module
 *
 * Contains precipitation frequency data from Table 7 and Huff Distribution
 * data from Table 26.
 *
 * Data Source: ISWS Bulletin 75 (March 2020)
 * Representative Year: 2017
 */

// Precipitation Frequency Data - Table 7 (Northeast Section, includes McHenry)
const PRECIP_FREQ_NE = {
    '5min': {
        '2mo': 0.30, '3mo': 0.35, '6mo': 0.44, '9mo': 0.50,
        '1yr': 0.54, '2yr': 0.65, '5yr': 0.80, '10yr': 0.92,
        '25yr': 1.08, '50yr': 1.21, '100yr': 1.35, '200yr': 1.50, '500yr': 1.71
    },
    '10min': {
        '2mo': 0.46, '3mo': 0.54, '6mo': 0.69, '9mo': 0.78,
        '1yr': 0.85, '2yr': 1.02, '5yr': 1.27, '10yr': 1.47,
        '25yr': 1.72, '50yr': 1.93, '100yr': 2.16, '200yr': 2.40, '500yr': 2.74
    },
    '15min': {
        '2mo': 0.56, '3mo': 0.65, '6mo': 0.83, '9mo': 0.94,
        '1yr': 1.02, '2yr': 1.22, '5yr': 1.52, '10yr': 1.76,
        '25yr': 2.07, '50yr': 2.32, '100yr': 2.59, '200yr': 2.88, '500yr': 3.29
    },
    '30min': {
        '2mo': 0.72, '3mo': 0.84, '6mo': 1.06, '9mo': 1.21,
        '1yr': 1.31, '2yr': 1.57, '5yr': 1.95, '10yr': 2.26,
        '25yr': 2.66, '50yr': 2.98, '100yr': 3.33, '200yr': 3.70, '500yr': 4.23
    },
    '1hr': {
        '2mo': 0.87, '3mo': 1.01, '6mo': 1.29, '9mo': 1.46,
        '1yr': 1.59, '2yr': 1.90, '5yr': 2.37, '10yr': 2.75,
        '25yr': 3.23, '50yr': 3.62, '100yr': 4.05, '200yr': 4.50, '500yr': 5.14
    },
    '2hr': {
        '2mo': 1.02, '3mo': 1.19, '6mo': 1.51, '9mo': 1.72,
        '1yr': 1.87, '2yr': 2.24, '5yr': 2.79, '10yr': 3.24,
        '25yr': 3.81, '50yr': 4.27, '100yr': 4.77, '200yr': 5.30, '500yr': 6.05
    },
    '3hr': {
        '2mo': 1.14, '3mo': 1.33, '6mo': 1.69, '9mo': 1.92,
        '1yr': 2.09, '2yr': 2.51, '5yr': 3.12, '10yr': 3.62,
        '25yr': 4.26, '50yr': 4.78, '100yr': 5.34, '200yr': 5.93, '500yr': 6.77
    },
    '6hr': {
        '2mo': 1.40, '3mo': 1.64, '6mo': 2.08, '9mo': 2.37,
        '1yr': 2.57, '2yr': 3.09, '5yr': 3.84, '10yr': 4.46,
        '25yr': 5.25, '50yr': 5.88, '100yr': 6.57, '200yr': 7.30, '500yr': 8.34
    },
    '12hr': {
        '2mo': 1.68, '3mo': 1.96, '6mo': 2.49, '9mo': 2.83,
        '1yr': 3.08, '2yr': 3.69, '5yr': 4.60, '10yr': 5.34,
        '25yr': 6.28, '50yr': 7.04, '100yr': 7.86, '200yr': 8.73, '500yr': 9.98
    },
    '24hr': {
        '2mo': 1.97, '3mo': 2.30, '6mo': 2.92, '9mo': 3.32,
        '1yr': 3.61, '2yr': 4.33, '5yr': 5.39, '10yr': 6.26,
        '25yr': 7.36, '50yr': 8.25, '100yr': 9.21, '200yr': 10.23, '500yr': 11.69
    },
    '48hr': {
        '2mo': 2.24, '3mo': 2.62, '6mo': 3.33, '9mo': 3.79,
        '1yr': 4.12, '2yr': 4.94, '5yr': 6.16, '10yr': 7.15,
        '25yr': 8.41, '50yr': 9.43, '100yr': 10.53, '200yr': 11.70, '500yr': 13.37
    },
    '72hr': {
        '2mo': 2.42, '3mo': 2.83, '6mo': 3.60, '9mo': 4.09,
        '1yr': 4.45, '2yr': 5.34, '5yr': 6.65, '10yr': 7.73,
        '25yr': 9.09, '50yr': 10.19, '100yr': 11.38, '200yr': 12.64, '500yr': 14.45
    }
};

// Huff Distribution Data - Table 26 (Point Distributions, 0-10 sq mi)
const HUFF_POINT = {
    '1st': {
        0.000: 0.00, 0.042: 8.36, 0.083: 17.73, 0.125: 28.11,
        0.167: 38.33, 0.208: 47.45, 0.250: 55.50, 0.292: 62.25,
        0.333: 67.22, 0.375: 70.82, 0.417: 74.17, 0.458: 76.97,
        0.500: 79.81, 0.542: 82.55, 0.583: 85.18, 0.625: 87.40,
        0.667: 89.47, 0.708: 91.17, 0.750: 92.70, 0.792: 94.03,
        0.833: 95.36, 0.875: 96.56, 0.917: 97.74, 0.958: 98.85,
        1.000: 100.00
    },
    '2nd': {
        0.000: 0.00, 0.042: 2.29, 0.083: 4.82, 0.125: 7.78,
        0.167: 11.33, 0.208: 15.79, 0.250: 21.39, 0.292: 28.41,
        0.333: 36.44, 0.375: 45.29, 0.417: 54.35, 0.458: 62.38,
        0.500: 69.76, 0.542: 75.48, 0.583: 80.38, 0.625: 84.70,
        0.667: 87.81, 0.708: 90.22, 0.750: 92.17, 0.792: 93.81,
        0.833: 95.29, 0.875: 96.57, 0.917: 97.74, 0.958: 98.84,
        1.000: 100.00
    },
    '3rd': {
        0.000: 0.00, 0.042: 2.05, 0.083: 4.31, 0.125: 6.67,
        0.167: 9.12, 0.208: 11.71, 0.250: 14.36, 0.292: 16.91,
        0.333: 19.64, 0.375: 22.78, 0.417: 26.33, 0.458: 30.93,
        0.500: 36.35, 0.542: 43.92, 0.583: 52.11, 0.625: 61.02,
        0.667: 69.89, 0.708: 78.19, 0.750: 84.92, 0.792: 89.74,
        0.833: 93.11, 0.875: 95.34, 0.917: 97.06, 0.958: 98.56,
        1.000: 100.00
    },
    '4th': {
        0.000: 0.00, 0.042: 2.31, 0.083: 4.79, 0.125: 7.12,
        0.167: 9.78, 0.208: 12.53, 0.250: 15.23, 0.292: 17.91,
        0.333: 20.33, 0.375: 22.83, 0.417: 25.41, 0.458: 28.35,
        0.500: 31.25, 0.542: 33.90, 0.583: 36.33, 0.625: 38.61,
        0.667: 41.24, 0.708: 45.08, 0.750: 51.29, 0.792: 59.31,
        0.833: 69.19, 0.875: 80.05, 0.917: 89.71, 0.958: 96.04,
        1.000: 100.00
    }
};

// Curve Number Lookup Table
const CN_TABLE = {
    'Impervious': {'A': 98, 'B': 98, 'C': 98, 'D': 98},
    'Open_Space_Good': {'A': 39, 'B': 61, 'C': 74, 'D': 80},
    'Open_Space_Fair': {'A': 49, 'B': 69, 'C': 79, 'D': 84},
    'Open_Space_Poor': {'A': 68, 'B': 79, 'C': 86, 'D': 89},
    'Woods_Good': {'A': 30, 'B': 55, 'C': 70, 'D': 77},
    'Woods_Fair': {'A': 35, 'B': 70, 'C': 77, 'D': 83},
    'Woods_Poor': {'A': 45, 'B': 75, 'C': 82, 'D': 86},
    'Native_Vegetation': {'A': 35, 'B': 58, 'C': 72, 'D': 79},
    'Wetland': {'A': 25, 'B': 45, 'C': 60, 'D': 70},
    'Rain_Garden': {'A': 32, 'B': 58, 'C': 72, 'D': 79},
    'Solar_Native': {'A': 35, 'B': 58, 'C': 72, 'D': 79},
    'Agricultural': {'A': 72, 'B': 81, 'C': 88, 'D': 91},
    'Residential_1_8_acre': {'A': 77, 'B': 85, 'C': 90, 'D': 92},
    'Residential_1_4_acre': {'A': 61, 'B': 75, 'C': 83, 'D': 87},
    'Residential_1_3_acre': {'A': 57, 'B': 72, 'C': 81, 'D': 86},
    'Residential_1_2_acre': {'A': 54, 'B': 70, 'C': 80, 'D': 85},
    'Residential_1_acre': {'A': 51, 'B': 68, 'C': 79, 'D': 84},
    'Residential_2_acre': {'A': 46, 'B': 65, 'C': 77, 'D': 82},
    'Commercial': {'A': 89, 'B': 92, 'C': 94, 'D': 95},
    'Industrial': {'A': 81, 'B': 88, 'C': 91, 'D': 93},
    'Parking_Paved': {'A': 98, 'B': 98, 'C': 98, 'D': 98},
    'Streets_Paved': {'A': 98, 'B': 98, 'C': 98, 'D': 98},
    'Gravel': {'A': 76, 'B': 85, 'C': 89, 'D': 91},
    'Dirt': {'A': 72, 'B': 82, 'C': 87, 'D': 89},
    'Pasture_Good': {'A': 39, 'B': 61, 'C': 74, 'D': 80},
    'Pasture_Fair': {'A': 49, 'B': 69, 'C': 79, 'D': 84},
    'Pasture_Poor': {'A': 68, 'B': 79, 'C': 86, 'D': 89},
    'Meadow': {'A': 30, 'B': 58, 'C': 71, 'D': 78},
    'Brush_Good': {'A': 30, 'B': 48, 'C': 65, 'D': 73},
    'Brush_Fair': {'A': 35, 'B': 56, 'C': 70, 'D': 77},
    'Brush_Poor': {'A': 48, 'B': 67, 'C': 77, 'D': 83}
};

// Helper Functions
function getPrecipitationDepth(duration, returnPeriod) {
    if (PRECIP_FREQ_NE[duration] && PRECIP_FREQ_NE[duration][returnPeriod]) {
        return PRECIP_FREQ_NE[duration][returnPeriod];
    }
    return null;
}

function getCurveNumber(landCover, soilGroup) {
    if (CN_TABLE[landCover] && CN_TABLE[landCover][soilGroup]) {
        return CN_TABLE[landCover][soilGroup];
    }
    return null;
}

function getHuffQuartileRecommendation(durationHours) {
    if (durationHours <= 6) return '1st';
    if (durationHours <= 12) return '2nd';
    if (durationHours <= 24) return '3rd';
    return '4th';
}

function listLandCovers() {
    return Object.keys(CN_TABLE).sort();
}

function listDurations() {
    return Object.keys(PRECIP_FREQ_NE);
}

function listReturnPeriods() {
    return Object.keys(PRECIP_FREQ_NE['24hr']);
}
