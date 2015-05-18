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
            rawFields = fieldMatches && fieldMatches.length ? fieldMatches[0].replace(/^select\s/i, '').split(',') : [],
            rawField, nameSection, fieldAlias, fieldName, i;
        for (i = 0; i < rawFields.length; i++) {
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
            joinAlias, rawJoinArgs, joinKey, rawJoin, i;
        for (i = 0; i < joinMatches.length; i++) {
            rawJoin = Ext.String.trim(joinMatches[i]);
            rawJoinArgs = rawJoin.split(' ');
            joinKey = rawJoinArgs[2] || rawJoinArgs[1].toLowerCase() , joinAlias = rawJoinArgs[2] || rawJoinArgs[1].toLowerCase();
            this.addJoin(rawJoinArgs[1], joinAlias, rawJoinArgs[4]);
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
            rawCriteriaString, sideSplit, propertySplit, criteriaSplit, propertyString, operatorString, criterionString, i, customFn, type;
        if (criteriaMatches.length) {
            rawCriteriaString = criteriaMatches[0].replace(/where\s/gi, '');
            criteriaSplit = rawCriteriaString.split(this.andOrRegex);
            for (i = 0; i < criteriaSplit.length; i++) {
                criterionString = Ext.String.trim(criteriaSplit[i]);
                sideSplit = criterionString.split(operatorRegex);
                propertySplit = sideSplit[0].split('.');
                propertyString = propertySplit.length > 1 ? sideSplit[0] : this.rootEntity + '.' + sideSplit[0];
                operatorString = criterionString.match(operatorRegex);
                if (operatorString) {
                    this.addCriteria(Ext.String.trim(propertyString), Ext.String.trim(sideSplit[1]), operatorString[0], this.determineCriteriaType(operatorString[0]));
                } else // this might be a custom function...check
                {
                    if (/{{.*}}/.test(criterionString)) {
                        customFn = criterionString.replace(/{|}/g, '');
                        if (this.customCriteriaCache[customFn]) {
                            this.addCriteria(null, null, customFn, 'custom');
                        } else {
                            Ext.Error.raise({
                                msg: 'Custom method was not found!',
                                fn: customFn
                            });
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
            orderSplit, i;
        for (i = 0; i < orderMatches.length; i++) {
            orderSplit = Ext.String.trim(orderMatches[i]).split(/\s/);
            if (orderSplit.length == 4 && /ASC|DESC/i.test(orderSplit[3])) {
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
        if (limitMatches && limitMatches.length) {
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
        if (this.nullRegex.test(operator)) {
            return 'null';
        }
        if (this.likeRegex.test(operator)) {
            return 'like';
        }
        if (this.betweenRegex.test(operator)) {
            return 'between';
        }
        return 'compare';
    }
});

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
        var i, column, isArray, name, alias;
        for (i in columns) {
            column = columns[i];
            isArray = Ext.isArray(column);
            name = isArray ? column[0] : column.column;
            alias = isArray ? column[1] : column.alias;
            if (name) {
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
        this.addCriteria(column, [
            minValue,
            maxValue
        ].join(','), 'between', 'between');
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
        this.addCriteria(column, [
            minValue,
            maxValue
        ].join(','), 'not between', 'between');
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

Ext.define('CriteriaBuilder.Builder', {
    extend: 'Ext.Base',
    mixins: [
        'CriteriaBuilder.mixin.SQLParser',
        'CriteriaBuilder.mixin.DSL'
    ],
    config: {
        store: null
    },
    /**
     * @property {String} rootEntity
     * @private
     * The root entity for the query
     */
    rootEntity: '_this',
    /**
     * @property {Object} fields
     * @private
     * Collection of fields defined for this query
     */
    fields: {},
    /**
     * @property {Object} joins
     * @private
     * Collection of joins defined for this query
     */
    joins: {},
    /**
     * @property {Array} criteria
     * @private
     * Array of criteria defined for this query
     */
    criteria: [],
    /**
     * @property {Array} sorters
     * @private
     * Array of sorters defined for this query
     */
    sorters: [],
    /**
     * @property {Number} max
     * @private
     * The max results to return for this query
     */
    max: 0,
    /**
     * @property {Number} max
     * @private
     * The offset (starting position) to use for this query
     */
    offset: 0,
    /**
     * @property {Object} joinMap
     * @private
     * Inverse mapping of join and join aliases
     */
    joinMap: {},
    /**
     * @property {Object} customCriteriaCache
     * @private
     * Cache of user-defined criteria methods
     */
    customCriteriaCache: {},
    /**
     * @property {Object} fieldTypeMappings
     * @private
     * Mapping of field types
     */
    fieldTypeMappings: {},
    /**
     * @property {Object} operatorMap
     * @private
     * Map of operators to their executable methods
     */
    operatorMap: {
        '=': 'findEQ',
        '!=': 'findNEQ',
        '<': 'findLT',
        '<=': 'findLTE',
        '>': 'findGT',
        '>=': 'findGTE',
        'like': 'findLike',
        'not like': 'findNotLike',
        'between': 'findBetween',
        'not between': 'findNotBetween',
        'is null': 'findIsNull',
        'is not null': 'findIsNotNull'
    },
    constructor: function(config) {
        this.initConfig(config);
        this.reset();
        this.determineFieldTypes();
        return this;
    },
    /**
     * Creates field type mappings for passed model and fields
     * @private
     * @param {Ext.data.Model} model The model to create field mappings for
     * @param {String} alias The alias that these mappings model should obtain
     */
    createFieldTypeMap: function(model, alias, side) {
        var me = this;
        Ext.Object.each(model.getFieldsMap(), function(key, item, obj) {
            // for now, only right-side association fields will use their own type; any left-side association fields needsd to be 'auto'
            me.fieldTypeMappings[alias + '.' + key] = side == 'right' ? item.getType() : 'auto';
        });
    },
    /**
     * Common internal entry point for adding a column, whether from string parsing or DSL
     * @private
     * @param {String} name The column name
     * @param {String} alias The column alias
     */
    addColumn: function(name, alias) {
        var nameSplit = name.split('.'),
            noPrefixName = nameSplit.length > 1 ? nameSplit[1] : nameSplit[0],
            prefix = nameSplit.length > 1 ? nameSplit[0] : this.rootEntity;
        this.fields[prefix + '.' + noPrefixName] = {
            name: noPrefixName,
            alias: alias || name
        };
    },
    /**
     * Common internal entry point for adding a join, whether from string parsing or DSL
     * @private
     * @param {String} association The name of the association being joined from
     * @param {String} alias The alias for the join
     * @param {String} join The association being joined to
     */
    addJoin: function(association, alias, join) {
        var finalAlias = alias || association;
        this.joins[alias || association] = {
            association: association,
            alias: finalAlias,
            owner: join
        };
        this.joinMap[association] = finalAlias;
    },
    /**
     * Common internal entry point for adding criteria, whether from string parsing or DSL
     * @param {String} property The property to evaluate
     * @param {String} value The value being analyzed
     * @param {String} operator The comparison operator
     * @param {String} type The type of comparison
     */
    addCriteria: function(property, value, operator, type) {
        var hasProperty = property,
            hasAlias = hasProperty && property.split('.').length > 1,
            cleanValue = /([\"'])(?:\\\1|.)*?\1/.test(value) ? value.replace(/^["'](.*)["']$/, '$1') : value;
        // if a custom criteria method, we need to check some stuff first
        this.criteria.push({
            property: !hasAlias && hasProperty ? this.rootEntity + '.' + property : property,
            value: cleanValue,
            operator: operator,
            type: type
        });
    },
    /**
     * Common internal entry point for adding sort order, whether from string parsing or DSL
     * @private
     * @param {String} column The column to sort
     * @param {String} direction The direction of the sort
     */
    addOrder: function(column, direction) {
        this.sorters.push({
            property: column,
            direction: direction.toUpperCase()
        });
    },
    /**
     * Determines range based on size of collection and configured limit/offset settings
     * @private
     * @param {Ext.util.MixedCollection} collection The collection to analyze
     * @return {Array}
     */
    determineRange: function(collection) {
        var start = this.offset,
            end = collection.getCount() - 1;
        if (this.max) {
            //if(start) {
            end = Math.min((start + (this.max - 1)), end);
        }
        //}
        return [
            start,
            end
        ];
    },
    /**
     * Determines field types by introspecting the owning model's schema
     * @private
     */
    determineFieldTypes: function() {
        var me = this,
            schema = this.getStore().getModel().schema,
            left, right, role;
        // run for rooted model
        this.createFieldTypeMap(this.getStore().getModel(), this.rootEntity);
        // now analyze for associations
        schema.eachAssociation(function(name, association) {
            left = association.left;
            right = association.right;
            if (left && left.cls) {
                role = left.role;
                me.createFieldTypeMap(left.cls, role, 'left');
            }
            if (right && right.cls) {
                role = right.role;
                me.createFieldTypeMap(right.cls, role, 'right');
            }
        });
    },
    /**
     * Recursively gets flattened data representation of an entire association relationship
     * @private
     * @param {Object} data The data object
     * @param {Object} root The starting object for parsing data
     * @param {Object} node The relationship to be analyzed
     * @param {[Number]} nodeIndex Index of the node within an array relationship
     * @return {Object}
     */
    getFlattenedData: function(data, root, node, nodeIndex) {
        var me = this,
            lookupNode = this.joinMap[node],
            finalNode, lookupKey;
        // regular object? 
        if (Ext.isObject(root)) {
            Ext.Object.each(root, function(key, value, obj) {
                finalNode = '';
                // if node doesn't exist, we don't have a join so we shouldn't include this field(s)
                if (lookupNode) {
                    if (!Ext.isObject(value) && !Ext.isArray(value)) {
                        finalNode = nodeIndex !== undefined ? lookupNode + '.' + nodeIndex : lookupNode;
                        lookupKey = finalNode + '.' + key;
                        data[lookupKey] = value;
                    } else {
                        me.getFlattenedData(data, root[key], key);
                    }
                }
            });
        }
        // array of data?
        if (Ext.isArray(root)) {
            Ext.Array.each(root, function(item, index, len) {
                me.getFlattenedData(data, item, node, index);
            });
        }
        return data;
    },
    /**
     * Finds keys that match a specific pattern in the object; useful for generic fields
     * that need to match on compound keys
     * @param {String} property The property to match against
     * @param {Object} data The data object containing the keys
     *
     */
    findMatchingKeys: function(property, data) {
        if (!property) {
            return [];
        }
        var keys = [],
            split = property.split('.'),
            // create regex to find compound keys
            // Ex: i.price might apply to a one-to-many, so the keys will actually be i.0.price
            regex = new RegExp('^' + split[0] + '(.[0-9]+)?' + '.' + split[1] + '$');
        Ext.Object.each(data, function(key, value, obj) {
            if (regex.test(key)) {
                keys.push(key);
            }
        });
        return keys;
    },
    /**
     * Prunes full data object of all properties not contained in "select" statement
     * @private
     * @param {Object} data The data object to prune
     *
     */
    pruneData: function(data) {
        var map = this.fields,
            pruned = {},
            compoundRegex = /^\w+\.\d+\.\w+$/i,
            replacerRegex = /(^\w+)(\.\d+)(\.\w+$)/i,
            isCompound;
        Ext.Object.each(data, function(key, value, obj) {
            isCompound = compoundRegex.test(key);
            key = isCompound ? key.replace(replacerRegex, '$1$3') : key;
            if (map.hasOwnProperty(key)) {
                if (!isCompound) {
                    pruned[map[key].alias] = value;
                } else {
                    if (!Ext.isArray(pruned[map[key].alias])) {
                        pruned[map[key].alias] = [];
                    }
                    pruned[map[key].alias].push(value);
                }
            }
        });
        return pruned;
    },
    /**
     * Builds simple field definition array for use in a store
     * @private
     * return {Array}
     */
    getFieldsForStore: function() {
        var map = this.fields,
            key,
            fieldDefs = [],
            prefix, join, joinKey, fieldTypeMapping;
        for (key in map) {
            prefix = key.split('.')[0];
            join = this.joins[prefix];
            joinKey = join ? join.association : this.rootEntity;
            fieldTypeMapping = this.fieldTypeMappings[joinKey + '.' + map[key].name];
            fieldDefs.push({
                name: map[key].alias,
                type: fieldTypeMapping || 'auto'
            });
        }
        return fieldDefs;
    },
    /**
     * Creates a store from selected fields
     * @private
     * @param {Ext.util.MixedCollection} collection The collection to transform into a store
     * @return {Ext.data.Store}
     */
    createStore: function(collection) {
        var me = this,
            fields = me.getFieldsForStore(),
            store = new Ext.data.Store({
                fields: fields,
                sorters: this.sorters
            }),
            records = [],
            prunedValues;
        collection.each(function(item, index, len) {
            prunedValues = me.pruneData(item);
            records.push(prunedValues);
        });
        store.add(records);
        return store;
    },
    /**
     * Prepares collection for final state
     * @private
     * @param {Ext.util.MixedCollection} collection The collection to preparte
     * @return {Ext.util.MixedCollection}
     */
    prepareCollection: function(collection) {
        var me = this,
            // create new collection...prolly faster than removing values from existing one?
            finalCollection = this.createCollection(),
            prunedValues;
        // iterate over the current collection, prune the values, and add to new collection
        collection.each(function(item, index, len) {
            prunedValues = me.pruneData(item);
            finalCollection.add(item.$id, prunedValues);
        });
        return finalCollection;
    },
    /**
     * Applies limit and offset to collection
     * @private
     * @param {Ext.util.MixedCollection} collection The mixed collection to apply the range to
     * @return {Ext.util.MixedCollection}
     */
    rangeCollection: function(collection) {
        var range = this.determineRange(collection);
        // if we have a limit defined, or an offset
        if (range[0] > 0 || range[1]) {
            collection.each(function(item, index, len) {
                if (index < range[0] || index > range[1]) {
                    collection.remove(item);
                }
            });
        }
        return collection;
    },
    /**
     * Applies sorters and filters to store based on mixed collection
     * @private
     * @param {Ext.util.MixedCollection} collection The mixed collection that represents the filtered, sorted data
     */
    filterAndSortStoreByCollection: function(collection) {
        var store = this.getStore(),
            keys = collection.keys;
        // simple filter that matches records to collection keys
        store.filterBy(function(record, id) {
            return Ext.Array.contains(keys, record.getId());
        });
        // the collection is already properly sorted, so we just need to
        // intercept the sort index from collection and apply them to the store
        store.sort({
            sorterFn: function(record1, record2) {
                var index1 = collection.indexOfKey(record1.getId()),
                    index2 = collection.indexOfKey(record2.getId());
                return index1 > index2 ? 1 : (index1 === index2) ? 0 : -1;
            }
        });
    },
    /**
     * Runs appropriate parsers for query string
     * @private
     * @param {String} query The query string to parse
     */
    parseQueryString: function(query) {
        this.determineFields(query);
        this.determineJoins(query);
        this.determineCriteria(query);
        this.determineOrder(query);
        this.determineLimit(query);
    },
    /**
     * Get new mixed collection for tracking data with custom getKey() implementation
     * @private
     * @return {Ext.util.MixedCollection}
     */
    createCollection: function() {
        return new Ext.util.MixedCollection({
            getKey: function(item) {
                return item.$id;
            }
        });
    },
    /**
     * Main method for taking configured criteria and applying them to the data set
     * @private
     * @param {Ext.util.MixedCollection} collection The collection to query
     * @return {Ext.util.MixedCollection}
     */
    processCriteria: function(collection) {
        var me = this,
            results = [],
            matches = true,
            lookupCache = {},
            i, x, criterion, regex, row, compareMethod, rowValue, args, queryValue, matchingKeys, property, matchCount, instanceMatch,
            hasCompoundMatchScheme = false;
        // loop over collection to apply criteria
        collection.each(function(row, index, len) {
            for (x in me.criteria) {
                matches = true;
                criterion = me.criteria[x];
                // determine the method that should be executed to evaluate the criterion
                compareMethod = me.operatorMap[criterion.operator];
                // get keys that match the specific pattern for the criterion property
                matchingKeys = me.findMatchingKeys(criterion.property, row);
                // if there is more than one key match, this is a compound scheme and needs to be treated differently
                hasCompoundMatchScheme = matchingKeys.length > 1;
                matchCount = 0;
                // loop over all matching keys so we can compare each value
                for (i in matchingKeys) {
                    property = matchingKeys[i];
                    if (row.hasOwnProperty(property)) {
                        rowValue = row[property];
                        switch (criterion.type) {
                            case 'null':
                                instanceMatch = me[compareMethod](rowValue);
                                break;
                            case 'compare':
                                queryValue = Ext.isDate(rowValue) ? Ext.Date.parse(criterion.value, 'Y-m-d') : criterion.value;
                                if (criterion.operator == '=' || criterion.operator == '!=') {
                                    regex = lookupCache['eq_' + property] = lookupCache['eq_' + property] || me.buildEqRegex(criterion.value);
                                    args = [
                                        rowValue,
                                        regex
                                    ];
                                } else {
                                    args = [
                                        rowValue,
                                        queryValue
                                    ];
                                };
                                break;
                            case 'like':
                                regex = lookupCache['like_' + property] = lookupCache['like_' + property] || me.buildLikeRegex(criterion.value);
                                args = [
                                    rowValue,
                                    regex
                                ];
                                break;
                            case 'between':
                                range = lookupCache['between_' + property] = lookupCache['between_' + property] || me.buildBetweenRange(criterion.value);
                                args = [
                                    rowValue,
                                    range[0],
                                    range[1]
                                ];
                                break;
                        }
                        instanceMatch = me[compareMethod].apply(this, args);
                        // if there's an instance match, increment the tracker
                        if (instanceMatch) {
                            matchCount++;
                        }
                    }
                }
                if (criterion.type == 'custom') {
                    instanceMatch = me.customCriteriaCache[criterion.operator](row);
                    if (instanceMatch) {
                        matchCount++;
                    }
                }
                // do we have a compound scheme?
                if (hasCompoundMatchScheme) {
                    // if we have a compound matching scheme, any match is a success
                    matches = matchCount >= 1;
                } else // no scheme, just use simple match count (0 or 1)
                {
                    matches = matchCount;
                }
                // if there are no matches, exclude this entire row from the collection
                if (!matches) {
                    collection.remove(row);
                    break;
                }
            }
        });
        return collection;
    },
    /**
     * Builds cacheable range based on the passed value
     * @private
     * @param {String} value The value to test
     * @return {Array}
     */
    buildBetweenRange: function(value) {
        var values = value.split(','),
            min = values[0] ? Ext.String.trim(values[0]) : 0,
            max = values[1] ? Ext.String.trim(values[1]) : 0;
        return [
            min,
            max
        ];
    },
    /**
     * Builds cacheable like regex based on the passed value
     * @private
     * @param {String} value The value to test
     * @return {RegExp}
     */
    buildLikeRegex: function(value) {
        var head = value.charAt(0) == '%' ? '' : '^',
            tail = value.charAt(value.length - 1) == '%' ? '' : '$',
            regexString = head + value.replace(/%/g, '') + tail;
        // don't add 'g' because of dump regex bug
        return new RegExp(regexString, 'i');
    },
    /**
     * Builds cacheable eq/neq regex based on the passed value
     * @private
     * @param {String} value The value to test
     * @return {RegExp}
     */
    buildEqRegex: function(value) {
        return Ext.String.createRegex(value, false, true, true);
    },
    /**
     * Determines whether property value is null
     * @private
     * @param {String} value The value to test
     * @return {Boolean}
     */
    findIsNull: function(value) {
        return Ext.isEmpty(value);
    },
    /**
     * Determines whether property value is not null
     * @private
     * @param {String} value The value to test
     * @return {Boolean}
     */
    findIsNotNull: function(value) {
        return !Ext.isEmpty(value);
    },
    /**
     * Finds value between min and max values
     * @private
     * @param {String} value The value to test
     * @param {String} value The min value to test
     * @param {String} value The max value to test
     * @return {Boolean}
     */
    findBetween: function(value, min, max) {
        var min = !Ext.isDate(min) ? Ext.Date.parse(min, 'Y-m-d') : min,
            max = !Ext.isDate(max) ? Ext.Date.parse(max, 'Y-m-d') : max;
        return value >= min && value <= max;
    },
    /**
     * Finds value not between min and max values
     * @private
     * @param {String} value The value to test
     * @param {String} value The min value to test
     * @param {String} value The max value to test
     * @return {Boolean}
     */
    findNotBetween: function(value, min, max) {
        var min = !Ext.isDate(min) ? Ext.Date.parse(min, 'Y-m-d') : min,
            max = !Ext.isDate(max) ? Ext.Date.parse(max, 'Y-m-d') : max;
        return value < min || value > max;
    },
    /**
     * Finds value "like" the passed regex
     * @private
     * @param {String} value The value to test
     * @param {RegExp} regex The regex for testing
     * @return {Boolean}
     */
    findLike: function(value, regex) {
        return regex.test(value);
    },
    /**
     * Finds value "not like" the passed regex
     * @private
     * @param {String} value The value to test
     * @param {RegExp} regex The regex for testing
     * @return {Boolean}
     */
    findNotLike: function(value, regex) {
        return !regex.test(value);
    },
    /**
     * Determines whether first value is "=" to second value
     * @private
     * @param {String} first The left-hand side of the operator
     * @param {String} second The right-hand side of the operator
     * @return {Boolean}
     */
    findEQ: function(value, regex) {
        return regex.test(value);
    },
    /**
     * Determines whether first value is "!=" to second value
     * @private
     * @param {String} first The left-hand side of the operator
     * @param {String} second The right-hand side of the operator
     * @return {Boolean}
     */
    findNEQ: function(value, regex) {
        return !regex.test(value);
    },
    /**
     * Determines whether first value is "<" to second value
     * @private
     * @param {String} first The left-hand side of the operator
     * @param {String} second The right-hand side of the operator
     * @return {Boolean}
     */
    findLT: function(first, second) {
        return first < second;
    },
    /**
     * Determines whether first value is "<=" to second value
     * @private
     * @param {String} first The left-hand side of the operator
     * @param {String} second The right-hand side of the operator
     * @return {Boolean}
     */
    findLTE: function(first, second) {
        return first <= second;
    },
    /**
     * Determines whether first value is ">" to second value
     * @private
     * @param {String} first The left-hand side of the operator
     * @param {String} second The right-hand side of the operator
     * @return {Boolean}
     */
    findGT: function(first, second) {
        return first > second;
    },
    /**
     * Determines whether first value is ">=" to second value
     * @private
     * @param {String} first The left-hand side of the operator
     * @param {String} second The right-hand side of the operator
     * @return {Boolean}
     */
    findGTE: function(first, second) {
        return first >= second;
    },
    /**
     * Resets criteria builder
     */
    reset: function() {
        this.fields = {};
        this.joins = {};
        this.criteria = [];
        this.sorters = [];
        this.max = 0;
        this.offset = 0;
        this.joinMap[this.rootEntity] = this.rootEntity;
        this.fieldTypeMappings = {};
    },
    /**
     * Main method to execute query against store
     * @param {Object} options The options to use when running the query
     * @return {Ext.util.MixedCollection/Ext.data.Store}
     */
    query: function(options) {
        var options = Ext.isObject(options) ? options : {},
            query = options.sql || null,
            type = options.type || 'store',
            reset = options.reset || query ? true : false,
            collection = this.createCollection(),
            records = this.getStore().getRange(),
            i, range, record, rawDataMap;
        // if reset, clear out all collections
        if (reset) {
            this.reset();
        }
        // if we have a raw query, we need to parse the strings for each component;
        // with the dsl approach, there's no need
        // but both distill down to a common end, so it should be the same after this is done
        if (query) {
            this.parseQueryString(query);
        }
        // loop over the records and add their data to the collection
        for (i = 0; i < records.length; i++) {
            record = records[i];
            rawDataMap = this.getFlattenedData({}, record.getData(true), this.rootEntity);
            rawDataMap['$id'] = record.getId();
            collection.add(rawDataMap['$id'], rawDataMap);
        }
        this.processCriteria(collection);
        if (this.sorters.length) {
            collection.sort(this.sorters);
        }
        this.rangeCollection(collection);
        switch (type) {
            case 'collection':
                return this.prepareCollection(collection);
            case 'filter':
                // run filter on store...
                this.filterAndSortStoreByCollection(collection);
                return this.getStore().getRange();
            case 'store':
                return this.createStore(collection);
        }
    }
});

Ext.define('CriteriaBuilder.mixin.CriteriaBuilder', {
    extend: 'Ext.Mixin',
    requires: [
        'CriteriaBuilder.Builder'
    ],
    mixinConfig: {
        id: 'criteriabuilder'
    },
    /**
     * Creates a new criteria builder instance and attaches it to the store
     * @return {CriteriaBuilder.Builder}
     */
    newCriteriaBuilder: function() {
        return this.criteriaBuilder = new CriteriaBuilder.Builder({
            store: this
        });
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
        return builder.query({
            sql: sql,
            type: 'collection'
        });
    },
    /**
     * Filters store using a SQL statement
     * @param {String} sql The sql-like string to use for a filter
     * @return {Ext.util.MixedCollection}
     */
    filterBySql: function(sql) {
        var builder = this.criteriaBuilder || this.newCriteriaBuilder();
        return builder.query({
            sql: sql,
            type: 'filter'
        });
    }
});

