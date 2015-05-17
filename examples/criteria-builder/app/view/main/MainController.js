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
        'return-collection': 'onContentChange',
        'return-store': 'onContentChange',
        'return-filter': 'onContentChange',
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
    }
});
