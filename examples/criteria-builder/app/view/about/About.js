Ext.define('CriteriaBuilder.view.about.About', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-about',
    title: 'SQL Criteria',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/about.html',
        loadOnRender: true
    }
});
