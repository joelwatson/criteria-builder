Ext.define('CriteriaBuilder.view.criteria.Criteria', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-criteria',
    title: 'Criteria Types',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/criteria.html',
        loadOnRender: true
    }
});
