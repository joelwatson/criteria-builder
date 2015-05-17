Ext.define('CriteriaBuilder.view.sql.Criteria', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-sql-criteria',
    title: 'SQL Criteria',
    bodyPadding: 10,
    loader: {
        url: 'resources/html/sql-criteria.html',
        loadOnRender: true
    }
});
