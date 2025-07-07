import * as Highcharts from 'highcharts';

/**
 * Applies Highcharts global options
 */
export function applyHighchartsDefaults() {
    Highcharts.setOptions({
        lang: {
            thousandsSep: ','
        },
        colors: ['#004b8d', '#939598', '#faa834', '#00aa7e', '#47a5dc', '#006ac7', '#ccced2', '#bf8028', '#00e4a7']
    });
}