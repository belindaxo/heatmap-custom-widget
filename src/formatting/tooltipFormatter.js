import * as Highcharts from 'highcharts';
/**
 * Formats the tooltip for the chart.
 * @param {Function} scaleFormat 
 * @param {Array} dimensions - Array of dimension objects 
 * @returns {Function} A function that formats the tooltip content.
 */
export function formatTooltip(scaleFormat, dimensions) {
    return function () {
        const seriesName = this.series.name || 'Series';
        const rawValue = this.rawValue;
        const { scaledValue, valueSuffix } = scaleFormat(rawValue);
        const value = Highcharts.numberFormat(scaledValue, -1, '.', ',');
        const valueWithSuffix = `${value} ${valueSuffix}`;
        const xLabel = this.category;
        const yLabel = this.series.yAxis.categories[this.y];
        const xDim = dimensions[0].description || 'X Axis';
        const yDim = dimensions[1].description || 'Y Axis';
        return `
            <div style="text-align: left; font-family: '72', sans-serif; font-size: 14px;">
                <div style="font-size: 14px; font-weight: normal; color: #666666;">${seriesName}</div>
                <div style="font-size: 18px; font-weight: normal; color: #000000;">${valueWithSuffix}</div>
                <hr style="border: none; border-top: 1px solid #eee; margin: 5px 0;">
                <table style="width: 100%; font-size: 14px; color: #000000;">
                    <tr>
                        <td style="text-align: left; padding-right: 10px;">${xDim}</td>
                        <td style="text-align: right; padding-left: 10px;">${xLabel}</td>
                    </tr>
                    <tr>
                        <td style="text-align: left; padding-right: 10px;">${yDim}</td>
                        <td style="text-align: right; padding-left: 10px;">${yLabel}</td>
                    </tr>
                </table>
            </div>
        `;
    }
}