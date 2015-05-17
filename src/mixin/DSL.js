Ext.define('CriteriaBuilder.mixin.DSL', {
    extend: 'Ext.Mixin',
    mixinId: 'dsl',
    /**
     * Chainable DSL method for adding columns to the query object
     * @param {Array} columns Array of columns to add
     * @return {Fiddle.data.QueryBuilder}
     */
    columns: function(columns) {
        // can be an array of arrays, or an array of objects
        var i,
            column,isArray,
            name, alias;
        
        for(i in columns) {
            column = columns[i];
            isArray = Ext.isArray(column);
            name = isArray ? column[0] : column.column;
            alias = isArray ? column[1] : column.alias;
            if(name) {
                this.addColumn(name, alias || null);
            }
        }
        return this;
    },
    /**
     * Chainable DSL method for adding columns to the query object
     * @param {String} name The name of the column
     * @param {String} alias An alias for the column
     * @return {Fiddle.data.QueryBuilder}
     */
    column: function(name, alias) {
        this.addColumn(name, alias);
        return this;
    },
    /**
     * Chainable DSL method for adding joins to the query object
     * @param {String} association The name of the association being joined from
     * @param {String} alias An alias for the join
     * @param {String} join The association being joined to
     * @return {Fiddle.data.QueryBuilder}
     */
    join: function(association, alias, join) {
      	this.addJoin(association, alias, join);
        return this;  
    },
    /**
     * Chainable DSL method for adding sort orders to the query object
     * @param {String} column The name of the column to sort
     * @param {String} direction The sort direction
     * @return {Fiddle.data.QueryBuilder}
     */
    order: function(column, direction) {
        this.addOrder(column, direction);
        return this;
    },
    /**
     * Chainable DSL method for setting limit/offset on the query object
     * @param {String} max The max number of results that should be returned
     * @param {String} offset The starting index for valid returnable records
     * @return {Fiddle.data.QueryBuilder}
     */
    limit: function(max, offset) {
        this.max = max || 0;
        this.offset = offset || 0;
        return this;
    },
    /**
     * Chainable DSL method for adding a "between" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} minValue The minimum allowable value
     * @param {String} maxValue The maxiumum allowable value
     * @return {Fiddle.data.QueryBuilder}
     */
    between: function(column, minValue, maxValue) {
      	this.addCriteria(column, [minValue, maxValue].join(','), 'between', 'between');
        return this;
    },
    /**
     * Chainable DSL method for adding a "not between" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} minValue The minimum allowable value
     * @param {String} maxValue The maxiumum allowable value
     * @return {Fiddle.data.QueryBuilder}
     */
    notbetween: function(column, minValue, maxValue) {
      	this.addCriteria(column, [minValue, maxValue].join(','), 'not between', 'between');
        return this;
    },
    /**
     * Chainable DSL method for adding a "like" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    like: function(column, value) {
        this.addCriteria(column, value, 'like', 'like');
        return this;
    },
    /**
     * Chainable DSL method for adding a "not like" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    notlike: function(column, value) {
        this.addCriteria(column, value, 'not like', 'like');
        return this;
    },
    /**
     * Chainable DSL method for adding a "=" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    eq: function(column, value) {
        this.addCriteria(column, value, '=', 'compare');
        return this;
    },
    /**
     * Chainable DSL method for adding a "!=" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    neq: function(column, value) {
        this.addCriteria(column, value, '!=', 'compare');
        return this;
    },
    /**
     * Chainable DSL method for adding a "<" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    lt: function(column, value) {
        this.addCriteria(column, value, '<', 'compare');
        return this;
    },
    /**
     * Chainable DSL method for adding a "<=" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    lte: function(column, value) {
        this.addCriteria(column, value, '<=', 'compare');
        return this;
    },
    /**
     * Chainable DSL method for adding a ">" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    gt: function(column, value) {
        this.addCriteria(column, value, '>', 'compare');
        return this;
    },
    /**
     * Chainable DSL method for adding a ">=" criteria
     * @param {String} column The name of the column to evaluate
     * @param {String} value The value
     * @return {Fiddle.data.QueryBuilder}
     */
    gte: function(column, value) {
        this.addCriteria(column, value, '>=', 'compare');
        return this;
    },
    /**
     * Chainable DSL method for adding a "is null" criteria
     * @param {String} column The name of the column to evaluate
     * @return {Fiddle.data.QueryBuilder}
     */
    isNull: function(column) {
        this.addCriteria(column, null, 'is null', 'null');
        return this;
    },
    /**
     * Chainable DSL method for adding a "is not null" criteria
     * @param {String} column The name of the column to evaluate
     * @return {Fiddle.data.QueryBuilder}
     */
    isNotNull: function(column) {
        this.addCriteria(column, null, 'is not null', 'null');
        return this;
    },
    /**
     * Chainable DSL method for adding user-defined criteria
     * @param {String} key The key to be used to store the method
     * @param {Function} fn The user-defined function 
     * @return {Fiddle.data.QueryBuilder}
     */
    customCriteria: function(key, fn) {
        this.customCriteriaCache[key] = fn;
        this.addCriteria(null, null, key, 'custom');
        return this;
    }
});
