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