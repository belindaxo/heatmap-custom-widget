/**
 * Module dependencies for Highcharts Heatmap.
 */
import * as Highcharts from 'highcharts';
import 'highcharts/modules/heatmap';
import HighchartsCustomEvents from 'highcharts-custom-events';
HighchartsCustomEvents(Highcharts);
import { handleXAxisLabelClick, handleYAxisLabelClick } from './interactions/eventHandlers';
import { scaleValue } from './formatting/scaleFormatter';
import { formatTooltip } from './formatting/tooltipFormatter';
import { formatDataLabels } from './formatting/labelFormatter';
import { toggleAxisTitles, updateSubtitle, updateTitle } from './config/chartUtils';
import { createChartStylesheet } from './config/styles';
import { applyHighchartsDefaults } from './config/highchartsSetup';

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

           // Apply the stylesheet to the shadow DOM
            this.shadowRoot.adoptedStyleSheets = [createChartStylesheet()];

            // Add the container for the chart
            this.shadowRoot.innerHTML = `
                <div id="container"></div>    
            `;

            this._selectedLabel = null; 
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
            this._selectedLabel = null; 
        }

        /**
         * Specifies which attributes should trigger re-rendering on change.
         * @returns {string[]} An array of observed attribute names.
         */
        static get observedAttributes() {
            return [
                'chartTitle', 'titleSize', 'titleFontStyle', 'titleAlignment', 'titleColor',                            // Title properties
                'chartSubtitle', 'subtitleSize', 'subtitleFontStyle', 'subtitleAlignment', 'subtitleColor',             // Subtitle properties
                'showAxisTitles', 'axisTitleSize', 'axisTitleColor',                                                    // Axis title properties
                'scaleFormat', 'decimalPlaces',                                                                         // Number formatting properties
                'showDataLabels', 'allowOverlap',                                                                       // Data label properties
                'topN',                                                                                                 // Ranking property
                'minColor', 'maxColor'                                                                                  // Color  properties 
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
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedLabel = null;
                }
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
                    this._selectedLabel = null;
                }
                return;
            }

            const xCategories = this._processSeriesData(data, dimensions, measures).xCategories;
            const yCategories = this._processSeriesData(data, dimensions, measures).yCategories;
            const seriesData = this._processSeriesData(data, dimensions, measures).data;
            console.log('xCategories:', xCategories);
            console.log('yCategories:', yCategories);
            console.log('seriesData:', seriesData);

            const scaleFormat = (value) => scaleValue(value, this.scaleFormat, this.decimalPlaces);
            const subtitleText = updateSubtitle(this.chartSubtitle, this.scaleFormat);

            const xLabel = dimensions[0].description || 'X Axis';
            const yLabel = dimensions[1].description || 'Y Axis';
            const measureLabel = measures[0].label || 'Measure';

            const autoTitle = `${measureLabel} per ${xLabel}, ${yLabel}`;
            const titleText = updateTitle(autoTitle, this.chartTitle);
            const axisTitleX = toggleAxisTitles(this.showAxisTitles, dimensions[0]);
            const axisTitleY = toggleAxisTitles(this.showAxisTitles, dimensions[1]);

            const onXLabelClick = (event) => handleXAxisLabelClick(event, dataBinding, dimensions, this);
            const onYLabelClick = (event) => handleYAxisLabelClick(event, dataBinding, dimensions, this);

            const series = [{
                name: measures[0].label || 'Measure',
                borderWidth: 1,
                data: seriesData,
                dataLabels: {
                    enabled: this.showDataLabels,
                    allowOverlap: this.allowOverlap || false,
                    formatter: formatDataLabels(scaleFormat)
                }
            }];
            console.log('series:', series);

            applyHighchartsDefaults();

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
                    },
                    labels: {
                        events: {
                            click: onXLabelClick
                        },
                        style: {
                            cursor: 'pointer'
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
                    reversed: false,
                    labels: {
                        events: {
                            click: onYLabelClick
                        },
                        style: {
                            cursor: 'pointer'
                        }
                    }
                },
                colorAxis: {
                    min: 0,
                    max: 1,
                    minColor: this.minColor || '#99CFFF',
                    maxColor: this.maxColor || Highcharts.getOptions().colors[0],
                },
                tooltip: {
                    useHTML: true,
                    followPointer: true,
                    hideDelay: 0,
                    formatter: formatTooltip(scaleFormat, dimensions),
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
    }
    customElements.define('com-sap-sample-heatmap', Heatmap);
})();