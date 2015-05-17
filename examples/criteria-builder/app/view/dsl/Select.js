Ext.define('CriteriaBuilder.view.dsl.Select', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-dsl-select',
    title: 'DSL Column Select',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/dsl-select.html',
        autoLoad: true
    }
});
