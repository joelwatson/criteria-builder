Ext.define('CriteriaBuilder.view.Base', {
    extend: 'Ext.panel.Panel',
    bodyPadding: 10,
    scrollable: true,
    initComponent: function() {
        this.loader = {
            url: this.loaderUrl,
            loadOnRender: true
        };
        this.callParent();
    }
});
