/**
 * Processes the data based on dimensions and measures.
 * @param {Array} data - The raw data from the data binding.
 * @param {Array} dimensions - Array of dimension objects.
 * @param {Array} measures - Array of measure objects.
 * @param {number} xTopN - The number of top categories to include in the heatmap.
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

    // Collect unique labels for each dimension
    data.forEach(row => {
        const xLabel = row[xDimension.key].label || 'No Label';
        const yLabel = row[yDimension.key].label || 'No Label';
        xSet.add(xLabel);
        ySet.add(yLabel);
    });

    let xCategories = Array.from(xSet);
    const yCategories = Array.from(ySet);

    const columnTotals = new Map();
    xCategories.forEach(x => columnTotals.set(x, 0));

    data.forEach(row => {
        const xLabel = row[xDimension.key].label || "No Label";
        const value = row[measureKey].raw || 0;
        columnTotals.set(xLabel, columnTotals.get(xLabel) + Math.abs(value));
    });

    // Apply Top N filter if specified
    const xTopNFilter = parseInt(xTopN);
    if (!isNaN(xTopNFilter) && xTopNFilter > 0) {
        const sorted = Array.from(columnTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, xTopNFilter).map(entry => entry[0]);

        xCategories = sorted;
    }

    // Create heatmap data array
    const seriesData = data.filter(row => xCategories.includes(row[xDimension.key].label)).map(row => {
        const xLabel = row[xDimension.key].label || 'No Label';
        const yLabel = row[yDimension.key].label || 'No Label';
        const rawValue = row[measureKey].raw || 0;
        const colTotal = columnTotals.get(xLabel) || 1;
        const proportion = rawValue / colTotal;

        return {
            x: xCategories.indexOf(xLabel),
            y: yCategories.indexOf(yLabel),
            value: proportion,
            rawValue: rawValue
        };
    });

    return {
        xCategories,
        yCategories,
        data: seriesData
    };
}