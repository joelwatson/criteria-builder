Ext.define('CriteriaBuilder.store.Mixin', {
    extend: 'Ext.data.Store',
    alias: 'store.mixinstore',
    requires: ['CriteriaBuilder.model.Order'],
    mixins: ['CriteriaBuilder.mixin.CriteriaBuilder'],
    model: 'CriteriaBuilder.model.Order',
    autoLoad: true,
    remoteSort: false,
    remoteFilter: false,
    proxy: {
        type: 'ajax',
        url: 'resources/data/orders.json'
    }
});
