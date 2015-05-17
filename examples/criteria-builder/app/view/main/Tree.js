Ext.define('CriteriaBuilder.view.main.Tree', {
    extend: 'Ext.tree.Panel',
    xtype: 'widget.criteriabuilder-main-tree',
    rootVisible: false,
    root: {
        expanded: true,
        children: [{
            text: 'SQL Examples',
            expanded: true,
            children:[{
                text:'Simple "Column" Select',
                href:'#sql-select',
                leaf: true
            },{
                text:'Using "Joins"',
                href:'#sql-join',
                leaf: true
            },{
                text:'Criteria',
                href:'#sql-criteria',
                leaf: true
            }]
        },{
            text: 'DSL Examples',
            expanded: true,
            children:[{
                text:'Selecting Columns',
                href:'#dsl-select',
                leaf: true
            },{
                text:'Adding Joins',
                href:'#dsl-join',
                leaf: true
            },{
                text:'Adding Criteria',
                href:'#dsl-criteria',
                leaf: true
            }]
        },{
            text: 'Return Types',
            expanded: true,
            children:[{
                text:'Collection',
                href:'#return-collection',
                leaf: true
            },{
                text:'Store',
                href:'#return-store',
                leaf: true
            },{
                text:'Filter',
                href:'#return-filter',
                leaf: true
            }]
        },{
            text: 'Live Examples',
            expanded: true,
            children:[{
                text:'SQL Query',
                href:'#example-sql',
                leaf: true
            },{
                text:'DSL Query',
                href:'#example-dsl',
                leaf: true
            },{
                text:'Criteria',
                href:'#example-criteria-builder',
                leaf: true
            }]
        }]
    }
});
