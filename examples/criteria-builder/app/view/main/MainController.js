/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('CriteriaBuilder.view.main.MainController', {
    extend: 'Ext.app.ViewController',
    requires: [],
    alias: 'controller.main',
    routes: {
        'sql-select': 'onContentChange',
        'sql-join': 'onContentChange',
        'sql-criteria': 'onContentChange',
        'sql-order': 'onContentChange',
        'sql-limit': 'onContentChange',
        'dsl-select': 'onContentChange',
        'dsl-join': 'onContentChange',
        'dsl-criteria': 'onContentChange',
        'dsl-limit': 'onContentChange',
        'dsl-order': 'onContentChange',
        'return': 'onContentChange',
        'about': 'onContentChange',
        'criteria': 'onContentChange',
        'example-sql': 'onContentChange',
        'example-dsl': 'onContentChange',
        'example-criteria-builder': 'onContentChange'
    },
    onContentChange: function() {
        var token = Ext.util.History.getToken(),
            mainContent = this.lookupReference('main-content-panel');
        // destroy existing content
        mainContent.removeAll();
        // now add based on token/xtype
        mainContent.add({xtype:'criteriabuilder-view-' + token});
    },
    onSQLFilter: function(btn, e, eOpts) {
        var store = btn.up('grid').getStore(),
            sql = 'join user u join address a on user where u.lastName like "R%" and a.address like "%Ave%" order by u.lastName DESC';
        // clear the filter first
        store.clearFilter();
        // run filterBySql
        store.filterBySql(sql);
    },
    onDSLFilter: function(btn, e, eOpts) {
        var store = btn.up('grid').getStore(),
            cb = store.newCriteriaBuilder();
        cb.join('user', 'u')
          .between('orderDate', '2001-01-01', '2012-01-01')
          .limit(5)
          .order('u.lastName', 'ASC');
        // run the query
        var data = cb.query({type:'filter'});
    }
});
