Ext.define('CriteriaBuilder.view.sql.Order', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-sql-order',
    title: 'SQL Order By',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/sql-order.html',
        autoLoad: true
    }
});
