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

            const xCategories = Array.from(xSet);
            const yCategories = Array.from(ySet);

            // Create heatmap data array
            const seriesData = data.map(row => {
                const xLabel = row[xDimension.key].label || 'No Label';
                const yLabel = row[yDimension.key].label || 'No Label';
                const value = row[measureKey].raw;

                return {
                    x: xCategories.indexOf(xLabel),
                    y: yCategories.indexOf(yLabel),
                    value: value
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

            const series = [{
                name: measures[0].label || 'Measure',
                borderWidth: 1,
                data: seriesData,
                dataLabels: {
                    enabled: true,
                    color: '#000000'
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
                xAxis: {
                    categories: xCategories
                },
                yAxis: {
                    categories: yCategories,
                    title: null,
                    reversed: true
                },
                colorAxis: {
                    min: 0,
                    minColor: '#FFFFFF',
                    maxColor: Highcharts.getOptions().colors[0],
                },
                legend: {
                    align: 'right',
                    layout: 'vertical',
                    margin: 0,
                    verticalAlign: 'top',
                    y: 25,
                    symbolHeight: 280
                },
                series
            }
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
        }
    }
    customElements.define('com-sap-sample-heatmap', Heatmap);
})();