const defaultColors = ['#004b8d', '#939598', '#faa834', '#00aa7e', '#47a5dc', '#006ac7', '#ccced2', '#bf8028', '#00e4a7'];
(function () {
    /**
     * Template for the Styling Panel (APS) of the Funnel3D widget.
     */
    let template = document.createElement('template');
    template.innerHTML = `
        <form id="form">
        <legend style="font-weight: bold;font-size: 18px;"> Font </legend>
        <table>
            <tr>
                <td>Chart Title</td>
            </tr>
            <tr>
                <td><input id="chartTitle" type="text"></td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Font Style</td>
                        <td>Alignment</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="titleSize">
                                <option value="10px">10</option>
                                <option value="12px">12</option>
                                <option value="14px">14</option>
                                <option value="16px" selected>16</option>
                                <option value="18px">18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <select id="titleFontStyle">
                                <option value="normal">Normal</option>
                                <option value="bold" selected>Bold</option>
                            </select>
                        </td>
                        <td>
                            <select id="titleAlignment">
                                <option value="left" selected>Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input id="titleColor" type="color" value="#004B8D">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <table>
            <tr>
                <td>Chart Subtitle</td>
            </tr>
            <tr>
                <td><input id="chartSubtitle" type="text"></td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Font Style</td>
                        <td>Alignment</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="subtitleSize">
                                <option value="10px">10</option>
                                <option value="11px" selected>11</option>
                                <option value="12px">12</option>
                                <option value="14px">14</option>
                                <option value="16px">16</option>
                                <option value="18px">18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <select id="subtitleFontStyle">
                                <option value="normal" selected>Normal</option>
                                <option value="italic">Italic</option>
                            </select>
                        </td>
                        <td>
                            <select id="subtitleAlignment">
                                <option value="left" selected>Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </td>
                        <td>
                            <input id="subtitleColor" type="color" value="#000000">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <table>
            <tr>
                <td>Axis Titles</td>
            </tr>
            <tr>
                <td>
                    <input id="showAxisTitles" type="checkbox" checked />
                    <label for="showAxisTitles">Show axis titles</label>
                </td>
            </tr>
            <tr>
                <table>
                    <tr>
                        <td>Size</td>
                        <td>Color</td>
                    </tr>
                    <tr>
                        <td>
                            <select id="axisTitleSize">
                                <option value="10px">10</option>
                                <option value="11px">11</option>
                                <option value="12px">12</option>
                                <option value="14px" selected>14</option>
                                <option value="16px">16</option>
                                <option value="18px">18</option>
                                <option value="20px">20</option>
                                <option value="22px">22</option>
                                <option value="24px">24</option>
                                <option value="32px">32</option>
                                <option value="48px">48</option>
                            </select>
                        </td>
                        <td>
                            <input id="axisTitleColor" type="color" value="#000000">
                        </td>
                    </tr>
                </table>
            </tr>
        </table>
        <legend style="font-weight: bold;font-size: 18px;"> Number Formatting </legend>
        <table>
            <tr>
                <td>Scale Format</td>
            </tr>
            <tr>
                <td>
                    <select id="scaleFormat">
                        <option value="unformatted" selected>Unformatted</option>
                        <option value="k">Thousands (k)</option>
                        <option value="m">Millions (m)</option>
                        <option value="b">Billions (b)</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>Decimal Places</td>
            </tr>
            <tr>
                <td>
                    <select id="decimalPlaces">
                        <option value="0">0</option>
                        <option value="1">1</option>
                        <option value="2" selected>2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </td>
            </tr>
        </table>
        <legend style="font-weight: bold; font-size: 18px">Data Labels</legend>
        <table>
            <tr>
                <td>
                    <input id="showDataLabels" type="checkbox" checked/>
                    <label for="showDataLabels">Show data labels</label>
                </td>
            </tr>
            <tr>
                <td>
                    <input id="allowOverlap" type="checkbox"/>
                    <label for="allowOverlap">Allow overlap</label>
                </td>
            </tr>
        </table>
        <legend style="font-weight: bold; font-size: 18px">Rank</legend>
        <table>
            <tr>
                <td>Top N (X-Axis)</td>
            </tr>
            <tr>
                <td>
                    <input id="topN" type="number" min="1"/>
                </td>
            </tr>
        </table>
        <legend style="font-weight: bold; font-size: 18px">Colors</legend>
        <table>
            <tr>
                <td>Min. Color</td>
                <td>Max. Color</td>
            </tr>
            <tr>
                <td>
                    <input id="minColor" type="color" value="#99CFFF">
                </td>
                <td>
                    <input id="maxColor" type="color" value="#004B8D">
                </td>
        </table>
        <tr>
            <button id="resetDefaults" type="button" style="margin-top: 10px; margin-bottom: 10px;">Reset to Default</button>
        </tr>
        <input type="submit" style="display:none;">
        </form>
    `; 

    /**
     * Custom Web Component for the Styling Panel (APS) of the widget.
     * @extends HTMLElement
     */
    class HeatmapAps extends HTMLElement {
        /**
         * Initializes the shadow DOM and sets up event listeners for form inputs.
         */
        constructor() {
            super();

            const DEFAULTS = {
                chartTitle: '',
                titleSize: '16px',
                titleFontStyle: 'bold',
                titleAlignment: 'left',
                titleColor: '#004B8D',
                chartSubtitle: '',
                subtitleSize: '11px',
                subtitleFontStyle: 'normal',
                subtitleAlignment: 'left',
                subtitleColor: '#000000',
                showAxisTitles: true,
                axisTitleSize: '14px',
                axisTitleColor: '#000000',
                scaleFormat: 'unformatted',
                decimalPlaces: '2',
                showDataLabels: true,
                allowOverlap: false,
                minColor: '#99CFFF',
                maxColor: '#004B8D'
            }

            this._shadowRoot = this.attachShadow({ mode: 'open' });
            this._shadowRoot.appendChild(template.content.cloneNode(true));

            this._shadowRoot.getElementById('form').addEventListener('submit', this._submit.bind(this));
            this._shadowRoot.getElementById('titleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleFontStyle').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleAlignment').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('titleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleFontStyle').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleAlignment').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('subtitleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('showAxisTitles').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('axisTitleSize').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('axisTitleColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('scaleFormat').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('decimalPlaces').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('showDataLabels').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('allowOverlap').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('topN').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('minColor').addEventListener('change', this._submit.bind(this));
            this._shadowRoot.getElementById('maxColor').addEventListener('change', this._submit.bind(this));

            // Reset button logic
            this._shadowRoot.getElementById('resetDefaults').addEventListener('click', () => {
                for (const key in DEFAULTS) {
                    if (key === 'chartTitle' || key === 'chartSubtitle') {
                        continue; // Skip these fields
                    }

                    const element = this._shadowRoot.getElementById(key);
                    if (!element) continue; 

                    if (typeof DEFAULTS[key] === 'boolean') {
                        element.checked = DEFAULTS[key];
                    } else {
                        element.value = DEFAULTS[key];
                    }
                }
                this._submit(new Event('submit')); 
            });
        }

        /**
         * Handles the form submissions and dispatches a 'propertiesChanged' event.
         * @param {Event} e - The form submission event.
         */
        _submit(e) {
            e.preventDefault();
            this.dispatchEvent(new CustomEvent('propertiesChanged', {
                detail: {
                    properties: {
                        chartTitle: this.chartTitle,
                        titleSize: this.titleSize,
                        titleFontStyle: this.titleFontStyle,
                        titleAlignment: this.titleAlignment,
                        titleColor: this.titleColor,
                        chartSubtitle: this.chartSubtitle,
                        subtitleSize: this.subtitleSize,
                        subtitleFontStyle: this.subtitleFontStyle,
                        subtitleAlignment: this.subtitleAlignment,
                        subtitleColor: this.subtitleColor,
                        showAxisTitles: this.showAxisTitles,
                        axisTitleSize: this.axisTitleSize,
                        axisTitleColor: this.axisTitleColor,
                        scaleFormat: this.scaleFormat,
                        decimalPlaces: this.decimalPlaces,
                        showDataLabels: this.showDataLabels,
                        allowOverlap: this.allowOverlap,
                        topN: this.topN,
                        minColor: this.minColor,
                        maxColor: this.maxColor
                    }
                }
            }));
        }

        // Getters and setters for each property
        get chartTitle() {
            return this._shadowRoot.getElementById('chartTitle').value;
        }
        set chartTitle(value) {
            this._shadowRoot.getElementById('chartTitle').value = value;
        }

        get titleSize() {
            return this._shadowRoot.getElementById('titleSize').value;
        }
        set titleSize(value) {
            this._shadowRoot.getElementById('titleSize').value = value;
        }

        get titleFontStyle() {
            return this._shadowRoot.getElementById('titleFontStyle').value;
        }
        set titleFontStyle(value) {
            this._shadowRoot.getElementById('titleFontStyle').value = value;
        }

        get titleAlignment() {
            return this._shadowRoot.getElementById('titleAlignment').value;
        }
        set titleAlignment(value) {
            this._shadowRoot.getElementById('titleAlignment').value = value;
        }
        
        get titleColor() {
            return this._shadowRoot.getElementById('titleColor').value;
        }
        set titleColor(value) {
            this._shadowRoot.getElementById('titleColor').value = value;
        }

        get chartSubtitle() {
            return this._shadowRoot.getElementById('chartSubtitle').value;
        }
        set chartSubtitle(value) {
            this._shadowRoot.getElementById('chartSubtitle').value = value;
        }

        get subtitleSize() {
            return this._shadowRoot.getElementById('subtitleSize').value;
        }
        set subtitleSize(value) {
            this._shadowRoot.getElementById('subtitleSize').value = value;
        }

        get subtitleFontStyle() {
            return this._shadowRoot.getElementById('subtitleFontStyle').value;
        }
        set subtitleFontStyle(value) {
            this._shadowRoot.getElementById('subtitleFontStyle').value = value;
        }

        get subtitleAlignment() {
            return this._shadowRoot.getElementById('subtitleAlignment').value;
        }
        set subtitleAlignment(value) {
            this._shadowRoot.getElementById('subtitleAlignment').value = value;
        }

        get subtitleColor() {
            return this._shadowRoot.getElementById('subtitleColor').value;
        }
        set subtitleColor(value) {
            this._shadowRoot.getElementById('subtitleColor').value = value;
        }

        get showAxisTitles() {
            return this._shadowRoot.getElementById('showAxisTitles').checked;
        }
        set showAxisTitles(value) {
            this._shadowRoot.getElementById('showAxisTitles').checked = value;
        }

        get axisTitleSize() {
            return this._shadowRoot.getElementById('axisTitleSize').value;
        }
        set axisTitleSize(value) {
            this._shadowRoot.getElementById('axisTitleSize').value = value;
        }

        get axisTitleColor() {
            return this._shadowRoot.getElementById('axisTitleColor').value;
        }
        set axisTitleColor(value) {
            this._shadowRoot.getElementById('axisTitleColor').value = value;
        }

        get scaleFormat() {
            return this._shadowRoot.getElementById('scaleFormat').value;
        }
        set scaleFormat(value) {
            this._shadowRoot.getElementById('scaleFormat').value = value;
        }

        get decimalPlaces() {
            return this._shadowRoot.getElementById('decimalPlaces').value;
        }
        set decimalPlaces(value) {
            this._shadowRoot.getElementById('decimalPlaces').value = value;
        }

        get showDataLabels() {
            return this._shadowRoot.getElementById('showDataLabels').checked;
        }
        set showDataLabels(value) {
            this._shadowRoot.getElementById('showDataLabels').checked = value;
        }

        get allowOverlap() {
            return this._shadowRoot.getElementById('allowOverlap').checked;
        }
        set allowOverlap(value) {
            this._shadowRoot.getElementById('allowOverlap').checked = value;
        }

        get topN() {
            return this._shadowRoot.getElementById('topN').value;
        }
        set topN(value) {
            this._shadowRoot.getElementById('topN').value = value;
        }

        get minColor() {
            return this._shadowRoot.getElementById('minColor').value;
        }
        set minColor(value) {
            this._shadowRoot.getElementById('minColor').value = value;
        }

        get maxColor() {
            return this._shadowRoot.getElementById('maxColor').value;
        }
        set maxColor(value) {
            this._shadowRoot.getElementById('maxColor').value = value;
        }
    }
    customElements.define('com-sap-sample-heatmap-aps', HeatmapAps);
})();