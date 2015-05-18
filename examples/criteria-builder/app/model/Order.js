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
    },{
        name: 'orderBy',
        mapping: 'user',
        convert: function(value) {
            return value.lastName + ', ' + value.firstName;
        }
    },{
        name: 'address',
        mapping: 'user.address',
        convert: function(value) {
            return value.address + '<br />' + value.city + ', ' + value.state + ' ' + value.postalCode;
        }
    }]
})
