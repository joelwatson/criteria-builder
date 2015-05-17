Ext.define('CriteriaBuilder.mixin.SQLParser', {
    extend: 'Ext.Mixin',
    mixinId: 'sqlparser',
    /**
     * @property {RegExp} fieldRegex
     * @private
     * A regular expression used for retrieving field names and aliases from sql string
     */
    fieldRegex: /^select\s(.*?)(?=where|join|order\sby$)/gi,
    /**
     * @property {RegExp} joinRegex
     * @private
     * A regular expression used for retrieving join names and aliases from sql string
     */
    joinRegex: /join.*?(?=where|join|$)/gi,
    /**
     * @property {RegExp} criteriaRegex
     * @private
     * A regular expression used for retrieving criteria from sql string
     */
    criteriaRegex: /where\s.*?(?=order\sby|$)/gi,
    /**
     * @property {RegExp} orderRegex
     * @private
     * A regular expression used for retrieving "order" from sql string
     */
    orderRegex: /\sorder\sby\s.*?(?=limit\s|$)/gi,
    /**
     * @property {RegExp} limitRegex
     * @private
     * A regular expression used for retrieving limit and offset data from sql string
     */
    limitRegex: /\slimit\s[1-9]+((,|,\s)[1-9]+)?$/gi,
    /**
     * @property {RegExp} operatorRegex
     * @private
     * A regular expression used for determining the comparison operator
     */
    operatorRegex: /=|!=|<=|<|>=|>|like|not\slike|between|not\sbetween|is\snull|is\snot\snull/gi,
    /**
     * @property {RegExp} likeRegex
     * @private
     * A regular expression used to test for a "like" criteria
     */
    likeRegex: /like|not\slike/i,
    /**
     * @property {RegExp} betweenRegex
     * @private
     * A regular expression used to test for a "between" criteria
     */
    betweenRegex: /between|not\sbetween/i,
    /**
     * @property {RegExp} nullRegex
     * @private
     * A regular expression used to test for a "null" criteria
     */
    nullRegex: /is\snull|is\snots\null/,
    /**
     * @property {RegExp} andOrRegex
     * @private
     * A regular expression used to test for "and/or" occurrences in criteria string
     */
    andOrRegex: /\sand\s|\sor\s/i,
    /**
     * String parsing method for determining fields from query string
     * @private
     * @param {String} query The query string to parse
     */
    determineFields: function(query) {
        var fields = {},
            fieldMatches = query.match(this.fieldRegex),
            rawFields = fieldMatches.length ? fieldMatches[0].replace(/^select\s/i, '').split(',') : [],
            rawField,nameSection,fieldAlias,fieldName,i;
        
        for(i=0; i<rawFields.length; i++) {
            rawField = Ext.String.trim(rawFields[i]).split(/\s/);
            nameSection = rawField[0].split('.');
            fieldName = nameSection.length > 1 ? nameSection[1] : nameSection[0];
            fieldAlias = rawField.length > 1 ? rawField[1] : fieldName;
            this.addColumn(rawField[0], fieldAlias);
        }
    },
    /**
     * String parsing method for determining joins from query string
     * @param {String} query The query string to parse
     */
    determineJoins: function(query) {
        var joins = {},
            joinMatches = query.match(this.joinRegex),
            joinAlias,
     		rawJoinArgs,
            joinKey,
            rawJoin,i;

        for(i=0; i<joinMatches.length; i++) {
            rawJoin = Ext.String.trim(joinMatches[i]);
            rawJoinArgs = rawJoin.split(' ');
            joinKey = rawJoinArgs[2] || rawJoinArgs[1].toLowerCase(),
            joinAlias = rawJoinArgs[2] || rawJoinArgs[1].toLowerCase();
            this.addJoin(rawJoinArgs[1], joinAlias, rawJoinArgs[4])
        }
    },
    /**
     * String parsing method for determining criteria from query string
     * @private
     * @param {String} query The query string to parse
     */
    determineCriteria: function(query) {
    	var criteria = [],
            criteriaRegex = this.criteriaRegex,
            operatorRegex = this.operatorRegex,
            criteriaMatches = query.match(criteriaRegex),
            rawCriteriaString,
            sideSplit,
            propertySplit,
            criteriaSplit,
            propertyString,
            operatorString,
            criterionString,i,
            customFn,
            type;
        
        if(criteriaMatches.length) {
            rawCriteriaString = criteriaMatches[0].replace(/where\s/gi, '');
            criteriaSplit = rawCriteriaString.split(this.andOrRegex);
           
            for(i=0; i<criteriaSplit.length; i++) {
                criterionString = Ext.String.trim(criteriaSplit[i]);
                sideSplit = criterionString.split(operatorRegex);
                propertySplit = sideSplit[0].split('.');
                propertyString = propertySplit.length > 1 ? sideSplit[0] : this.rootEntity + '.' + sideSplit[0];
                operatorString = criterionString.match(operatorRegex);
                
                if(operatorString) {
                    this.addCriteria(
                        Ext.String.trim(propertyString),
                        Ext.String.trim(sideSplit[1]),
                        operatorString[0],
                        this.determineCriteriaType(operatorString[0])
                    );
                }
                // this might be a custom function...check
                else {
                    if(/{{.*}}/.test(criterionString)) {
                        customFn = criterionString.replace(/{|}/g, '');
                        if(this.customCriteriaCache[customFn]) {
                            this.addCriteria(null, null, customFn, 'custom');
                        }
                        else {
                            // <debug>
                            Ext.Error.raise({
                                msg: 'Custom method was not found!',
                                fn: customFn
                            })
                            // </debug>
                        }
                    }
                }
            }
        }
	},
    /**
     * String parsing method for determining sort orders from query string
     * @private
     * @param {String} query The query string to parse
     */
    determineOrder: function(query) {
        var order = [],
            orderRegex = this.orderRegex,
            orderMatches = query.match(orderRegex),
            orderSplit,i;
        
        for(i=0; i<orderMatches.length; i++) {
            orderSplit = Ext.String.trim(orderMatches[i]).split(/\s/);
            if(orderSplit.length==4 && /ASC|DESC/i.test(orderSplit[3])) {
                this.addOrder(orderSplit[2], orderSplit[3]);
            }
        }
    },
    /**
     * String parsing method for determining limit/offset from query string
     * @private
     * @param {String} query The query string to parse
     */
    determineLimit: function(query) {
      	var max = 0,
            offset = 0,
            limitRegex = this.limitRegex,
            limitMatches = query.match(limitRegex),
            limitSplit;
        
        if(limitMatches && limitMatches.length) {
            limitSplit = limitMatches[0].match(/[1-9]+/g);
            this.max = parseInt(limitSplit[0]) || max;
            this.offset = parseInt(limitSplit[1]) || offset;
        }
    },
    /**
     * Determine type of comparison operator by evaluating string
     * @private
     * @param {String} operator The operator string to test
     */
    determineCriteriaType: function(operator) {
        var type;
        if(this.nullRegex.test(operator)) {
            return 'null';
        }
        if(this.likeRegex.test(operator)) {
            return 'like';
        } 
        if(this.betweenRegex.test(operator)) {
            return 'between';
        }
        return 'compare';
    }
});
