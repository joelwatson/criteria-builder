/**
 * This class is the main view for the application. It is specified in app.js as the
 * "autoCreateViewport" property. That setting automatically applies the "viewport"
 * plugin to promote that instance of this class to the body element.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('CriteriaBuilder.view.main.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'CriteriaBuilder.view.*'
    ],
    xtype: 'app-main',
    controller: 'main',
    viewModel: {
        type: 'main'
    },
    layout: {
        type: 'border'
    },
    items: [{
        xtype: 'panel',
        bind: {
            title: '{name}'
        },
        region: 'west',
        width: 250,
        split: true,
        items: [{
            xtype: 'criteriabuilder-main-tree'
        }]
    },{
        region: 'center',
        xtype: 'container',
        layout: 'fit',
        reference: 'main-content-panel'
    }]
});
