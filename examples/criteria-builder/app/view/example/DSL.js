Ext.define('CriteriaBuilder.view.example.DSL', {
    extend: 'Ext.panel.Panel',
    xtype: 'criteriabuilder-view-example-dsl',
    requires:['CriteriaBuilder.store.Mixin'],
    title: 'Example with DSL',
    layout: 'border',
    items:[{
        xtype: 'panel',
        bodyPadding:10,
        loader: {
            url: 'resources/html/example-dsl.html',
            loadOnRender: true
        },
        region: 'north'
    },{
        xtype: 'grid',
        title: 'Pending Orders',
        region: 'center',
        tbar: [{
            text: 'Filter!',
            handler: 'onDSLFilter'
        }],
        store: {
            type: 'mixinstore'
        },
        columns: [{
            xtype: 'rownumberer'
        },{
            text: 'Order ID#',
            dataIndex: 'orderId',
            flex: 1
        },{
            text: 'Order Number',
            dataIndex: 'orderId',
            flex: 1
        },{
            xtype: 'datecolumn',
            text: 'Order Date',
            dataIndex: 'orderDate',
            format: 'Y-m-d H:i:s',
            flex: 1
        },{
            text: 'Order By',
            dataIndex: 'orderBy',
            flex: 1
        },{
            text: 'Ship To',
            dataIndex: 'address',
            flex: 1
        }]
    }]
});
