Ext.define('CriteriaBuilder.view.sql.Join', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-sql-join',
    title: 'SQL Column Select',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/sql-join.html',
        autoLoad: true
    }
});
