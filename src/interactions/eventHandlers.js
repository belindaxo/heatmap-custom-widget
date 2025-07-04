export function handleXAxisLabelClick(event, dataBinding, dimensions, widget) {
    const target = event.target;
    console.log('X Axis label clicked:', target);
    const dimension = dimensions[0];
    const dimensionKey = dimension.key;
    const dimensionId = dimension.id;
    const label = target.textContent;
    console.log(`Dimension Key: ${dimensionKey}, Dimension ID: ${dimensionId}, Label: ${label}`);

    const selectedItem = dataBinding.data.find((item) => item[dimensionKey].label === label);
    console.log('Selected Item:', selectedItem);

    const linkedAnalysis = widget.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedLabel === target) {
        // If the same label is clicked again, remove filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;
        console.log('Filters removed for label:', label);
        return;
    }

    if (widget._selectedLabel && widget._selectedLabel !== target) {
        // If a different label was previously selected, remove its filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;
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

export function handleYAxisLabelClick(event, dataBinding, dimensions, widget) {
    const target = event.target;
    console.log('Y Axis label clicked:', target);
    const dimension = dimensions[1];
    const dimensionKey = dimension.key;
    const dimensionId = dimension.id;
    const label = target.textContent;
    console.log(`Dimension Key: ${dimensionKey}, Dimension ID: ${dimensionId}, Label: ${label}`);

    const selectedItem = dataBinding.data.find((item) => item[dimensionKey].label === label);
    console.log('Selected Item:', selectedItem);

    const linkedAnalysis = widget.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedLabel === target) {
        // If the same label is clicked again, remove filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;
        console.log('Filters removed for label:', label);
        return;
    }

    if (widget._selectedLabel && widget._selectedLabel !== target) {
        // If a different label was previously selected, remove its filters
        linkedAnalysis.removeFilters();
        widget._selectedLabel = null;
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
        console.error('Point is undefined');
        return;
    }

    let selection = {};

    const xDim = dimensions[0];
    const xDimKey = xDim.key;
    const xDimId = xDim.id;
    const xLabel = point.category;
    console.log(`X Dimension Key: ${xDimKey}, X Dimension ID: ${xDimId}, X Label: ${xLabel}`);
    const yDim = dimensions[1];
    const yDimKey = yDim.key;
    const yDimId = yDim.id;
    const yLabel = point.series.yAxis.categories[point.y];
    console.log(`Y Dimension Key: ${yDimKey}, Y Dimension ID: ${yDimId}, Y Label: ${yLabel}`);

    const row = dataBinding.data.find(r =>
        (r[xDimKey]?.label.trim()) === xLabel &&
        (r[yDimKey]?.label.trim()) === yLabel
    );

    if (!row) {
        console.log('Row not found for the clicked point');
        return;
    }
    console.log('Row found:', row);

    selection = {
        [xDimId]: row[xDimKey].id,
        [yDimId]: row[yDimKey].id
    }

    const linkedAnalysis = widget.dataBindings.getDataBinding('dataBinding').getLinkedAnalysis();

    if (widget._selectedPoint && widget._selectedPoint !== point) {
        linkedAnalysis.removeFilters();
        widget._selectedPoint.select(false, false);
        widget._selectedPoint = null;
    }

    if (widget._selectedLabel) {
        linkedAnalysis.removeFilters();
        widget._selectedPoint.select(false, false);
        widget._selectedLabel = null;
    }

    if (event.type === 'select') {
        linkedAnalysis.setFilters(selection);
        widget._selectedPoint = point;
    } else if (event.type === 'unselect') {
        linkedAnalysis.removeFilters();
        widget._selectedPoint = null;
    }
}
