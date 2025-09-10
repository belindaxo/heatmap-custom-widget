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

    const xMap = new Map();
    const yMap = new Map();

    // Collect unique labels
    for (const row of data) {
        const xId = row[xDimension.key].id || 'No ID';
        const xLabel = row[xDimension.key].label || 'No Label';
        if (!xMap.has(xId)) (xId, { id: xId, label: xLabel });

        const yId = row[yDimension.key].id || 'No ID';
        const yLabel = row[yDimension.key].label || 'No Label';
        if (!yMap.has(yId)) yMap.set(yId, { id: yId, label: yLabel });
    }
    let xCategories = Array.from(xMap.values());
    let yCategories = Array.from(yMap.values());

    // Totals by X (for X Top N)
    const xTotals = new Map(xCategories.map(c => [c.id, 0]));
    for (const row of data) {
        const xId = row[xDimension.key].id || 'No ID';
        const value = row[measureKey].raw ?? 0;
        xTotals.set(xId, (xTotals.get(xId) || 0) + Math.abs(value));
    }

    // Totals by Y (for Y Top N)
    const yTotals = new Map(yCategories.map(y => [y.id, 0]));
    for (const row of data) {
        const yId = row[yDimension.key].id || 'No ID';
        const value = row[measureKey].raw ?? 0;
        yTotals.set(yId, (yTotals.get(yId) || 0) + Math.abs(value));
    }

    // Apply X Top N filtering if specified
    const xN = parseInt(xTopN);
    if (!Number.isNaN(xN) && xN > 0) {
        const topXIds = Array.from(xTotals.entries())
            .sort((a,b)=>b[1]-a[1])
            .slice(0, xN)
            .map(([id]) => id);
        xCategories = xCategories.filter(c => topXIds.includes(c.id));
    }

    // Apply Y Top N filtering if specified
    const yN = parseInt(yTopN);
    if (!Number.isNaN(yN) && yN > 0) {
        const topYIds = Array.from(yTotals.entries())
            .sort((a,b)=>b[1]-a[1])
            .slice(0, yN)
            .map(([id]) => id);
        yCategories = yCategories.filter(c => topYIds.includes(c.id));
    }

    // Recompute visible columns
    const visibleColumnsTotals = new Map(xCategories.map(c => [c.id, 0]));
    for (const row of data) {
        const xId = row[xDimension.key].id || 'No ID';
        const yId = row[yDimension.key].id || 'No ID';
        if (!xCategories.some(c=>c.id===xId) || !yCategories.some(c=>c.id===yId)) {
            continue;
        }
        const value = row[measureKey].raw ?? 0;
        visibleColumnsTotals.set(xId, (visibleColumnsTotals.get(xId) || 0) + Math.abs(value));
    }

    // Create heatmap data array (only visible x and y)
    const seriesData = [];
    for (const row of data) {
        const xId = row[xDimension.key].id || 'No ID';
        const yId = row[yDimension.key].id || 'No ID';
        if (!xCategories.some(c=>c.id===xId) || !yCategories.some(c=>c.id===yId)) {
            continue;
        }
        const rawValue = row[measureKey].raw ?? 0;
        const denom = visibleColumnsTotals.get(xId) || 1;
        const proportion = denom === 0 ? 0 : rawValue / denom;
        seriesData.push({
            x: xCategories.findIndex(c => c.id === xId),
            y: yCategories.findIndex(c => c.id === yId),
            value: proportion,
            rawValue
        });
    }

    return {
        xCategories: xCategories.map(c => c.label),
        yCategories: yCategories.map(c => c.label),
        data: seriesData
    };
}