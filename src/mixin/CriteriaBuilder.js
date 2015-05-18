Ext.define('CriteriaBuilder.mixin.CriteriaBuilder', {
    extend: 'Ext.Mixin',
    requires: ['CriteriaBuilder.Builder'],
    mixinConfig: {
        id: 'criteriabuilder'
    },
    /**
     * Creates a new criteria builder instance and attaches it to the store
     * @return {CriteriaBuilder.Builder}
     */
    newCriteriaBuilder: function() {
        return this.criteriaBuilder = new CriteriaBuilder.Builder({store:this});
    },
    /**
     * Return criteria builder instance defined on store
     * @return {CriteriaBuilder.Builder/null}
     */
    getCriteriaBuilder: function() {
        return this.criteriaBuilder || null;
    },
    /**
     * Executes a criteria builder using a SQL statement
     * @param {String} sql The sql-like string to execute
     * @return {Ext.util.MixedCollection}
     */
    queryBySql: function(sql) {
        var builder = this.criteriaBuilder || this.newCriteriaBuilder();
        return builder.query({sql:sql, type:'collection'})
	},
    /**
     * Filters store using a SQL statement
     * @param {String} sql The sql-like string to use for a filter
     * @return {Ext.util.MixedCollection}
     */
    filterBySql: function(sql) {
    	var builder = this.criteriaBuilder || this.newCriteriaBuilder();
        return builder.query({sql:sql, type:'filter'})
	}
})