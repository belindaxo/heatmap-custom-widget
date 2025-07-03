/**
 * Module dependencies for Highcharts Heatmap.
 */
import * as Highcharts from 'highcharts';
import 'highcharts/modules/heatmap';

/**
 * Parses metadata into structured dimensions and measures.
 * @param {Object} metadata - The metadata object from SAC data binding.
 * @returns {Object} An object containing parsed dimensions, measures, and their maps.
 */
var parseMetadata = metadata => {
    const { dimensions: dimensionsMap, mainStructureMembers: measuresMap } = metadata;
    const dimensions = [];
    for (const key in dimensionsMap) {
        const dimension = dimensionsMap[key];
        dimensions.push({ key, ...dimension });
    }

    const measures = [];
    for (const key in measuresMap) {
        const measure = measuresMap[key];
        measures.push({ key, ...measure });
    }
    return { dimensions, measures, dimensionsMap, measuresMap };
}

(function () {
    /**
     * Custom Web Component for rendering a Heatmap in SAP Analytics Cloud.
     * @extends HTMLElement
     */
    class Heatmap extends HTMLElement {
        /**
         * Initializes the shadow DOM, styles, and chart container.
         */
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });

            // Create a CSSStyleSheet for the shadow DOM
            const sheet = new CSSStyleSheet();
            sheet.replaceSync(`
                @font-face {
                    font-family: '72';
                    src: url('../fonts/72-Regular.woff2') format('woff2');
                }
                #container {
                    width: 100%;
                    height: 100%;
                    font-family: '72';
                }
            `);

            // Apply the stylesheet to the shadow DOM
            this.shadowRoot.adoptedStyleSheets = [sheet];

            // Add the container for the chart
            this.shadowRoot.innerHTML = `
                <div id="container"></div>    
            `;
        }

        /**
         * Called when the widget is resized.
         * @param {number} width - New width of the widget.
         * @param {number} height - New height of the widget.
         */
        onCustomWidgetResize(width, height) {
            this._renderChart();
        }

        /**
         * Called after widget properties are updated.
         * @param {Object} changedProperties - Object containing changed attributes.
         */
        onCustomWidgetAfterUpdate(changedProperties) {
            this._renderChart();
        }

        /**
         * Called when the widget is destroyed. Cleans up chart instance.
         */
        onCustomWidgetDestroy() {
            if (this._chart) {
                this._chart.destroy();
                this._chart = null;
            }
        }

        /**
         * Specifies which attributes should trigger re-rendering on change.
         * @returns {string[]} An array of observed attribute names.
         */
        static get observedAttributes() {
            return [
                'chartTitle', 'titleSize', 'titleFontStyle', 'titleAlignment', 'titleColor',                // Title properties
                'chartSubtitle', 'subtitleSize', 'subtitleFontStyle', 'subtitleAlignment', 'subtitleColor', // Subtitle properties
                'showAxisTitles', 'axisTitleSize', 'axisTitleColor',                                        // Axis title properties
                'scaleFormat', 'decimalPlaces',                                                             // Number formatting properties
                'showDataLabels', 'allowOverlap',                                                           // Data label properties
                'showLegend',                                                                               // Legend properties
                'topN'                                                                                      // Ranking property 
            ];
        }

        /**
         * Called when an observed attribute changes.
         * @param {string} name - The name of the changed attribute.
         * @param {string} oldValue - The old value of the attribute.
         * @param {string} newValue - The new value of the attribute.
         */
        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue) {
                this[name] = newValue;
                this._renderChart();
            }
        }

        _processSeriesData(data, dimensions, measures) {
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
            const topN = parseInt(this.topN);
            if (!isNaN(topN) && topN > 0) {
                const sorted = Array.from(columnTotals.entries()).sort((a, b) => b[1] - a[1]).slice(0, topN).map(entry => entry[0]);

                xCategories = sorted;
            }

            console.log('Column Totals:');
            columnTotals.forEach((total, label) => {
                console.log(`${label}: ${total}`);
            })

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

        _renderChart() {
            const dataBinding = this.dataBinding;
            if (!dataBinding || dataBinding.state !== 'success') {
                return;
            }

            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);
            console.log('dimensions:', dimensions);
            console.log('measures:', measures);
            console.log('data:', data);

            if (dimensions.length < 2 || measures.length < 1) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                }
                return;
            }

            const xCategories = this._processSeriesData(data, dimensions, measures).xCategories;
            const yCategories = this._processSeriesData(data, dimensions, measures).yCategories;
            const seriesData = this._processSeriesData(data, dimensions, measures).data;
            console.log('xCategories:', xCategories);
            console.log('yCategories:', yCategories);
            console.log('seriesData:', seriesData);

            const scaleFormat = (value) => this._scaleFormat(value);
            const subtitleText = this._updateSubtitle();

            const xLabel = dimensions[0].description || 'X Axis';
            const yLabel = dimensions[1].description || 'Y Axis';
            const measureLabel = measures[0].label || 'Measure';

            const autoTitle = `${measureLabel} per ${xLabel}, ${yLabel}`;
            const titleText = this._updateTitle(autoTitle, this.chartTitle);
            const axisTitleX = this._toggleAxisTitles(this.showAxisTitles, dimensions[0]);
            const axisTitleY = this._toggleAxisTitles(this.showAxisTitles, dimensions[1]);

            const series = [{
                name: measures[0].label || 'Measure',
                borderWidth: 1,
                data: seriesData,
                dataLabels: {
                    enabled: this.showDataLabels || true,
                    allowOverlap: this.allowOverlap || false,
                    formatter: this._formatDataLabels(scaleFormat)
                }
            }];
            console.log('series:', series);

            Highcharts.setOptions({
                lang: {
                    thousandsSep: ','
                },
                colors: ['#004b8d', '#939598', '#faa834', '#00aa7e', '#47a5dc', '#006ac7', '#ccced2', '#bf8028', '#00e4a7']
            });

            const chartOptions = {
                chart: {
                    type: 'heatmap',
                    style: {
                        fontFamily: "'72', sans-serif"
                    }
                },
                credits: {
                    enabled: false
                },
                title: {
                    text: titleText,
                    align: this.titleAlignment || 'left',
                    style: {
                        fontSize: this.titleSize || '16px',
                        fontWeight: this.titleFontStyle || 'bold',
                        color: this.titleColor || '#004b8d'
                    }
                },
                subtitle: {
                    text: subtitleText,
                    align: this.subtitleAlignment || "left",
                    style: {
                        fontSize: this.subtitleSize || "11px",
                        fontStyle: this.subtitleFontStyle || "normal",
                        color: this.subtitleColor || "#000000",
                    },
                },
                legend: {
                    enabled: this.showLegend || true
                },
                xAxis: {
                    categories: xCategories,
                    opposite: false,
                    title: {
                        text: axisTitleX,
                        margin: 20,
                        style: {
                            fontSize: this.axisTitleSize || '14px',
                            color: this.axisTitleColor || '#000000'
                        }
                    }
                },
                yAxis: {
                    categories: yCategories,
                    title: {
                        text: axisTitleY,
                        margin: 20,
                        style: {
                            fontSize: this.axisTitleSize || '14px',
                            color: this.axisTitleColor || '#000000'
                        }
                    },
                    reversed: false
                },
                colorAxis: {
                    min: 0,
                    max: 1,
                    minColor: '#99CFFF',
                    maxColor: Highcharts.getOptions().colors[0],
                },
                tooltip: {
                    useHTML: true,
                    followPointer: true,
                    hideDelay: 0,
                    formatter: this._formatTooltip(scaleFormat, dimensions),
                },
                legend: {
                    align: 'right',
                    layout: 'vertical',
                    margin: 0,
                    verticalAlign: 'middle',
                    y: 25,
                    symbolHeight: 280
                },
                series
            }
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }

        /**
         * Scales a value based on the selected scale format (k, m, b).
         * @param {number} value 
         * @returns {Object} An object containing the scaled value and its suffix.
         */
        _scaleFormat(value) {
            let scaledValue = value;
            let valueSuffix = '';

            switch (this.scaleFormat) {
                case 'k':
                    scaledValue = value / 1000;
                    valueSuffix = 'k';
                    break;
                case 'm':
                    scaledValue = value / 1000000;
                    valueSuffix = 'm';
                    break;
                case 'b':
                    scaledValue = value / 1000000000;
                    valueSuffix = 'b';
                    break;
                default:
                    break;
            }
            return {
                scaledValue: scaledValue.toFixed(this.decimalPlaces),
                valueSuffix
            };
        }

        /**
         * Determines subtitle text based on scale format or user input.
         * @returns {string} The subtitle text.
         */
        _updateSubtitle() {
            if (!this.chartSubtitle || this.chartSubtitle === '') {
                let subtitleText = '';
                switch (this.scaleFormat) {
                    case 'k':
                        subtitleText = 'in k';
                        break;
                    case 'm':
                        subtitleText = 'in m';
                        break;
                    case 'b':
                        subtitleText = 'in b';
                        break;
                    default:
                        subtitleText = '';
                        break;
                }
                return subtitleText;
            } else {
                return this.chartSubtitle;
            }
        }

        _updateTitle(autoTitle, chartTitle) {
            if (!chartTitle || chartTitle === '') {
                return autoTitle;
            } else {
                return chartTitle;
            }
        }

        _toggleAxisTitles(showAxisTitles, dimension) {
            if (showAxisTitles) {
                return dimension.description || 'Axis';
            } else {
                return '';
            }
        }

        _formatDataLabels(scaleFormat) {
            return function () {
                const rawValue = this.rawValue;
                const { scaledValue, valueSuffix } = scaleFormat(rawValue);
                const value = Highcharts.numberFormat(scaledValue, -1, '.', ',');
                return `${value}`;
            }
        }

        _formatTooltip(scaleFormat, dimensions) {
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
    }
    customElements.define('com-sap-sample-heatmap', Heatmap);
})();