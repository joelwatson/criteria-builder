Ext.define('CriteriaBuilder.view.sql.Select', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-sql-select',
    title: 'SQL Column Select',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/sql-select.html',
        autoLoad: true
    }
});
