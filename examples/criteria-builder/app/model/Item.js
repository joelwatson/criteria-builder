Ext.define('CriteriaBuilder.model.Item', {
    extend: 'CriteriaBuilder.model.Base',
    idProperty: 'itemId',
    fields: [{
        name: 'itemId'
    },{
        name: 'sku',
        type: 'string'
    },{
        name: 'quantity',
        type: 'integer'
    },{
        name: 'price',
        type: 'float'
    },{
        name: 'orderId',
        reference: 'Order'
    }]
})
