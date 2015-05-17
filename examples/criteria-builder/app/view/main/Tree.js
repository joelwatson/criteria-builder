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
            },{
                text:'Limit',
                href:'#sql-limit',
                leaf: true
            },{
                text:'Order By',
                href:'#sql-order',
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
            },{
                text:'Limit',
                href:'#dsl-limit',
                leaf: true
            },{
                text:'Order By',
                href:'#dsl-order',
                leaf: true
            }]
        },{
            text: 'Return Types',
            leaf: true,
            href: '#return'
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
