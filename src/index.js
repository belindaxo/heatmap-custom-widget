/**
 * Module dependencies for Highcharts Heatmap.
 */
import * as Highcharts from 'highcharts';
import 'highcharts/modules/heatmap';
import 'highcharts/modules/exporting';
import HighchartsCustomEvents from 'highcharts-custom-events';
HighchartsCustomEvents(Highcharts);
import { handleXAxisLabelClick, handleYAxisLabelClick, handlePointClick } from './interactions/eventHandlers';
import { scaleValue } from './formatting/scaleFormatter';
import { formatTooltip } from './formatting/tooltipFormatter';
import { formatDataLabels } from './formatting/labelFormatter';
import { toggleAxisTitles, updateSubtitle, updateTitle } from './config/chartUtils';
import { createChartStylesheet } from './config/styles';
import { applyHighchartsDefaults, overrideContextButtonSymbol } from './config/highchartsSetup';
import { parseMetadata } from './data/metadataParser';
import { processSeriesData } from './data/dataProcessor';

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
            this._selectedPoint = null;
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
            this._selectedPoint = null;
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
                'xTopN', 'yTopN',                                                                           // Ranking properties
                'minColor', 'maxColor'                                                                      // Color properties 
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

        _renderChart() {
            const dataBinding = this.dataBinding;
            if (!dataBinding || dataBinding.state !== 'success') {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedLabel = null;
                    this._selectedPoint = null;
                }
                return;
            }

            const { data, metadata } = dataBinding;
            const { dimensions, measures } = parseMetadata(metadata);

            if (dimensions.length < 2 || measures.length < 1) {
                if (this._chart) {
                    this._chart.destroy();
                    this._chart = null;
                    this._selectedLabel = null;
                    this._selectedPoint = null;
                }
                return;
            }

            const { xCategories, yCategories, data: seriesData } = processSeriesData(data, dimensions, measures, this.xTopN, this.yTopN);

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
            const onPointClick = (event) => handlePointClick(event, dataBinding, dimensions, this);

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

            applyHighchartsDefaults();
            overrideContextButtonSymbol();

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
                exporting: {
                    enabled: true,
                    buttons: {
                        contextButton: {
                            enabled: false,
                        }
                    },
                    menuItemDefinitions: {
                        resetFilters: {
                            text: 'Reset Filters',
                            onclick: () => {
                                const linkedAnalysis = this.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();
                                if (linkedAnalysis) {
                                    linkedAnalysis.removeFilters();
                                    if (this._selectedPoint) {
                                        this._selectedPoint.select(false, false);
                                        this._selectedPoint = null;
                                    }
                                    if (this._selectedLabel) {
                                        this._selectedLabel = null;
                                    }
                                }
                            }

                        }
                    }
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
                    minColor: this.minColor || '#FFFFFF',
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
                plotOptions: {
                    series: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        point: {
                            events: {
                                select: onPointClick,
                                unselect: onPointClick
                            }
                        }
                    }
                },
                series
            }
            this._chart = Highcharts.chart(this.shadowRoot.getElementById('container'), chartOptions);
            const container = this.shadowRoot.getElementById('container');

            // Container Event Listeners
            container.addEventListener("mouseenter", () => {
                if (this._chart) {
                    this._chart.update({
                        exporting: {
                            buttons: {
                                contextButton: {
                                    enabled: true,
                                    symbol: 'contextButton',
                                    menuItems: ['resetFilters']
                                },
                            },
                        },
                    }, true);
                }
            });
            container.addEventListener("mouseleave", () => {
                if (this._chart) {
                    this._chart.update({
                        exporting: {
                            buttons: {
                                contextButton: {
                                    enabled: false,
                                },
                            },
                        },
                    }, true);
                }
            });
        }

        // SAC Scripting Methods
        /**
         * Returns the members of the specified feed of the chart.
         * @returns {Array} An array of members (measures) from the data binding.
         */
        getHeatmapMembers() {
            const dataBinding = this.dataBindings.getDataBinding('dataBinding');
            const members = dataBinding.getMembers('measures');
            return members;
        }

        /**
         * Returns the dimensions of the chart.
         * @returns {Array} An array of dimensions from the data binding.
         */
        getHeatmapDimensions() {
            const dataBinding = this.dataBindings.getDataBinding('dataBinding');
            const dimensions = dataBinding.getDimensions('dimensions');
            return dimensions;
        }

        /**
         * Removes the specified member from the chart.
         * @param {string} memberId - The ID of the member to remove from the chart.
         */
        removeHeatmapMember(memberId) {
            const dataBinding = this.dataBindings.getDataBinding('dataBinding');
            dataBinding.removeMember(memberId);
        }

        /**
         * Removes the specified dimension from the chart.
         * @param {string} dimensionId - The ID of the dimension to remove from the chart.
         */
        removeHeatmapDimension(dimensionId) {
            const dataBinding = this.dataBindings.getDataBinding('dataBinding');
            dataBinding.removeDimension(dimensionId);
        }

        /**
         * Adds the specified member to the chart.
         * @param {string} memberId - The ID of the member to add to the chart.
         */
        addHeatmapMember(memberId) {
            const dataBinding = this.dataBindings.getDataBinding('dataBinding');
            dataBinding.addMemberToFeed('measures', memberId);
        }

        /**
         * Adds the specified dimension to the chart.
         * @param {string} dimensionId - The ID of the dimension to add to the chart.
         */
        addHeatmapDimension(dimensionId) {
            const dataBinding = this.dataBindings.getDataBinding('dataBinding');
            dataBinding.addDimensionToFeed('dimensions', dimensionId);
        }
    }
    customElements.define('com-sap-sample-heatmap', Heatmap);
})();