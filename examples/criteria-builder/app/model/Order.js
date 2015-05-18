Ext.define('CriteriaBuilder.model.Order', {
    extend: 'CriteriaBuilder.model.Base',
    idProperty: 'orderId',
    fields: [{
        name: 'orderId'
    },{
        name: 'orderNumber',
        type: 'string'
    },{
        name: 'orderDate',
        type: 'date'
    },{
        name: 'userId',
        reference: 'User'
    }]
})
