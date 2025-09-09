/**
 * Processes the data based on dimensions and measures.
 * @param {Array} data - The raw data from the data binding.
 * @param {Array} dimensions - Array of dimension objects.
 * @param {Array} measures - Array of measure objects.
 * @param {number} xTopN - The number of top categories to include in the heatmap for the X-Axis.
  * If not specified, all categories will be included.
 * @param {number} yTopN - The number of top categories to include in the heatmap for the Y-Axis.
  * If not specified, all categories will be included.
 * @returns {Object} An object containing processed xCategories, yCategories, and data for the heatmap.
 */
export function processSeriesData(data, dimensions, measures, xTopN, yTopN) {
    if (dimensions.length < 2 || measures.length < 1) {
        return {
            xCategories: [],
            yCategories: [],
            data: []
        };
    }

    const xDimension = dimensions[0];
    const yDimension = dimensions[1];
    const measureKey = measures[0].key;

    const xSet = new Set();
    const ySet = new Set();

    // Collect unique labels
    for (const row of data) {
        xSet.add(row[xDimension.key].label || 'No Label');
        ySet.add(row[yDimension.key].label || 'No Label');
    }
    let xCategories = Array.from(xSet);
    let yCategories = Array.from(ySet);

    // Totals by X (for X Top N)
    const xTotals = new Map(xCategories.map(x => [x, 0]));
    for (const row of data) {
        const xLabel = row[xDimension.key].label || 'No Label';
        const value = row[measureKey].raw ?? 0;
        xTotals.set(xLabel, (xTotals.get(xLabel) || 0) + value);
    }

    // Totals by Y (for Y Top N)
    const yTotals = new Map(yCategories.map(y => [y, 0]));
    for (const row of data) {
        const yLabel = row[yDimension.key].label || 'No Label';
        const value = row[measureKey].raw ?? 0;
        yTotals.set(yLabel, (yTotals.get(yLabel) || 0) + value);
    }

    // Apply X Top N filtering if specified
    const xN = parseInt(xTopN);
    if (!Number.isNaN(xN) && xN > 0) {
        xCategories = Array.from(xTotals.entries())
            .sort((a, b) => b[1] - a[1]) 
            .slice(0, xN)               
            .map(([x]) => x);          
    }

    // Apply Y Top N filtering if specified
    const yN = parseInt(yTopN);
    if (!Number.isNaN(yN) && yN > 0) {
        yCategories = Array.from(yTotals.entries())
            .sort((a, b) => b[1] - a[1]) 
            .slice(0, yN)               
            .map(([y]) => y);          
    }

    // Recompute visible columns
    const visibleColumnsTotals = new Map(xCategories.map(x => [x, 0]));
    for (const row of data) {
        const xLabel = row[xDimension.key].label || 'No Label';
        const yLabel = row[yDimension.key].label || 'No Label';
        if (!xCategories.includes(xLabel) || !yCategories.includes(yLabel)) {
            continue;
        }
        const value = row[measureKey].raw ?? 0;
        visibleColumnsTotals.set(xLabel, (visibleColumnsTotals.get(xLabel) || 0) + value);
    }

    // Create heatmap data array (only visible x and y)
    const seriesData = [];
    for (const row of data) {
        const xLabel = row[xDimension.key].label || 'No Label';
        const yLabel = row[yDimension.key].label || 'No Label';
        if (!xCategories.includes(xLabel) || !yCategories.includes(yLabel)) {
            continue;
        }
        const rawValue = row[measureKey].raw ?? 0;
        const denom = visibleColumnsTotals.get(xLabel) || 1;
        const proportion = denom === 0 ? 0 : rawValue / denom;
        seriesData.push({
            x: xCategories.indexOf(xLabel),
            y: yCategories.indexOf(yLabel),
            value: proportion,
            rawValue
        });
    }

    return {
        xCategories,
        yCategories,
        data: seriesData
    };
}