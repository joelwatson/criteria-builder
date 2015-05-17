Ext.define('CriteriaBuilder.view.dsl.Criteria', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-dsl-criteria',
    title: 'DSL Criteria',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/dsl-criteria.html',
        loadOnRender: true
    }
});
