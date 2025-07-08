/**
 * Event handler for x-axis label click events.
 * @param {Object} event - The event object containing the click event.
 * @param {Object} dataBinding - The data binding object containing the data.
 * @param {Array} dimensions - Array of dimension objects.
 * @param {Object} widget - Reference to the widget.
 */
export function handleXAxisLabelClick(event, dataBinding, dimensions, widget) {
    const target = event.target;
    console.log('X Axis label clicked:', target);
    const dimension = dimensions[0];
    const dimensionKey = dimension.key;
    const dimensionId = dimension.id;
    const label = Array.from(target.childNodes)
        .map(node => node.textContent.replace(/[\u200B\u00A0]/g, '').trim()) // remove zero-width & non-breaking spaces
        .filter(text => text.length > 0)
        .join(' ')
        .trim();
    console.log(`target.childNodes:`, target.childNodes);
    console.log(`Dimension Key: ${dimensionKey}, Dimension ID: ${dimensionId}, Label: ${label}`);

    const selectedItem = dataBinding.data.find((item) => item[dimensionKey].label === label);
    console.log('Selected Item:', selectedItem);

    const linkedAnalysis = widget.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedPoint) {
        widget._selectedPoint.select(false, false);
        widget._selectedPoint = null;
    }

    if (widget._selectedLabel === target) {
        // If the same label is clicked again, remove filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;

        if (widget._selectedPoint) {
            widget._selectedPoint.select(false, false);
            widget._selectedPoint = null;
        }

        console.log('Filters removed for label:', label);
        return;
    }

    if (widget._selectedLabel && widget._selectedLabel !== target) {
        // If a different label was previously selected, remove its filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;

        if (widget._selectedPoint) {
            widget._selectedPoint.select(false, false);
            widget._selectedPoint = null;
        }
    }

    if (selectedItem) {
        const selection = {};
        selection[dimensionId] = selectedItem[dimensionKey].id;
        console.log('Selection:', selection);
        console.log('selection[dimensionId]:', selection[dimensionId]);
        console.log('selectedItem[dimensionKey].id:', selectedItem[dimensionKey].id);
        linkedAnalysis.setFilters(selection);
        widget._selectedLabel = target;
    }
}

/**
 * Event handler for y-axis label click events.
 * @param {Object} event - The event object containing the click event.
 * @param {Object} dataBinding - The data binding object containing the data.
 * @param {Array} dimensions - Array of dimension objects.
 * @param {Object} widget - Reference to the widget.
 */
export function handleYAxisLabelClick(event, dataBinding, dimensions, widget) {
    const target = event.target;
    console.log('Y Axis label clicked:', target);
    const dimension = dimensions[1];
    const dimensionKey = dimension.key;
    const dimensionId = dimension.id;
    const label = Array.from(target.childNodes)
        .map(node => node.textContent.replace(/[\u200B\u00A0]/g, '').trim()) // remove zero-width & non-breaking spaces
        .filter(text => text.length > 0)
        .join(' ')
        .trim();
    console.log(`Dimension Key: ${dimensionKey}, Dimension ID: ${dimensionId}, Label: ${label}`);

    const selectedItem = dataBinding.data.find((item) => item[dimensionKey].label === label);
    console.log('Selected Item:', selectedItem);

    const linkedAnalysis = widget.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedPoint) {
        widget._selectedPoint.select(false, false);
        widget._selectedPoint = null;
    }

    if (widget._selectedLabel === target) {
        // If the same label is clicked again, remove filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;

        if (widget._selectedPoint) {
            widget._selectedPoint.select(false, false);
            widget._selectedPoint = null;
        }

        console.log('Filters removed for label:', label);
        return;
    }

    if (widget._selectedLabel && widget._selectedLabel !== target) {
        // If a different label was previously selected, remove its filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;

        if (widget._selectedPoint) {
            widget._selectedPoint.select(false, false);
            widget._selectedPoint = null;
        }
    }

    if (selectedItem) {
        const selection = {};
        selection[dimensionId] = selectedItem[dimensionKey].id;
        console.log('Selection:', selection);
        console.log('selection[dimensionId]:', selection[dimensionId]);
        console.log('selectedItem[dimensionKey].id:', selectedItem[dimensionKey].id);
        linkedAnalysis.setFilters(selection);
        widget._selectedLabel = target;
    }
}

/**
 * Event handler for point click events.
 * @param {Object} event - The event object containing the click event.
 * @param {Object} dataBinding - The data binding object containing the data.
 * @param {Array} dimensions - Array of dimension objects.
 * @param {Object} widget - Reference to the widget ('this', in context).
 */
export function handlePointClick(event, dataBinding, dimensions, widget) {
    const point = event.target;
    console.log('Point clicked:', point);
    if (!point) {
        console.log('Point undefined');
        return;
    }

    const linkedAnalysis = widget.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

    const xLabel = point.category;
    const yLabel = point.series.yAxis.categories[point.y];

    const dimX = dimensions[0];
    const dimY = dimensions[1];

    const row = dataBinding.data.find(
        r => r[dimX.key]?.label === xLabel && r[dimY.key]?.label === yLabel
    );

    linkedAnalysis.removeFilters();

    if (widget._selectedPoint && widget._selectedPoint !== point) {
        widget._selectedPoint.select(false, false);
    }
    widget._selectedLabel = null;
    widget._selectedPoint = null;

    if (event.type === 'select') {
        if (row) {
            const selection = {};
            selection[dimX.id] = row[dimX.key].id;
            selection[dimY.id] = row[dimY.key].id;
            linkedAnalysis.setFilters(selection);
            widget._selectedPoint = point;
        }
    } else if (event.type === 'unselect') {
        widget._selectedPoint = null;
    }
}