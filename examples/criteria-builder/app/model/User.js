Ext.define('CriteriaBuilder.model.User', {
    extend: 'CriteriaBuilder.model.Base',
    idProperty: 'userId',
    fields: [{
        name: 'userId'
    },{
        name: 'firstName',
        type: 'string'
    },{
        name: 'lastName',
        type: 'string'
    },{
        name: 'addressId',
        reference: 'Address'
    }]
})
