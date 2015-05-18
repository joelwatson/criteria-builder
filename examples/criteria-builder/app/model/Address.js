Ext.define('CriteriaBuilder.model.Address', {
    extend: 'CriteriaBuilder.model.Base',
    idProperty: 'addressId',
    fields: [{
        name: 'addressId'
    },{
        name: 'address',
        type: 'string'
    },{
        name: 'city',
        type: 'string'
    },{
        name: 'state',
        type: 'string'
    },{
        name: 'postalCode'
    }]
})
