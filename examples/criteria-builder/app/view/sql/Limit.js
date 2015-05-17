Ext.define('CriteriaBuilder.view.sql.Limit', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-sql-limit',
    title: 'SQL Limit',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/sql-limit.html',
        autoLoad: true
    }
});
