var mere = (function () {

	//#region jquery plugins
	// Outer HTML
	(function ($) {
		$.fn.outerHtml = function () {
			if (this.length == 0) return false;
			var elem = this[0], name = elem.tagName.toLowerCase();
			if (elem.outerHTML) return elem.outerHTML;
			var attrs = $.map(elem.attributes, function (i) { return i.name + '="' + i.value + '"'; });
			return "<" + name + (attrs.length > 0 ? " " + attrs.join(" ") : "") + ">" + elem.innerHTML + "</" + name + ">";
		};
	})(jQuery);
	//#endregion

	//#region starter prototypes
	var saveableContainingObjectPrototypeStarter = {
		createDirtySaveableFlag: function() {
			return mere.utils.hasDirtySaveable(this);
		},
		hasDirtySaveable: function () {
			var self = this,
				val;

			for (var prop in self) {
				if (self.hasOwnProperty(prop)) {
					val = self[prop];
					if (val && val.isSaveable && !val.ignore && val.isDirty()) {
						return true;
					}
				}
			}

			return false;
		},
		commitDirtySaveable: function (toCommit) {
			mere.utils.commitDirtySaveable(this, toCommit);
			return this;
		},
		revertDirtySaveable: function (toCommit) {
			mere.utils.revertDirtySaveable(this, toCommit);
			return this;
		},
		hasDirtyProtectedObservables: function () {
			var self = this,
				val;

			for (var prop in self) {
				if (self.hasOwnProperty(prop)) {
					val = self[prop];
					if (val && val.isProtected && !val.ignore && val.isDirty()) {
						return true;
					}
				}
			}

			return false;
		},
		getDirtyProtectedObservableValues: function () {
			var self = this,
				val,
				found = {},
				cnt = 0;

			for (var prop in self) {
				if (self.hasOwnProperty(prop)) {
					val = self[prop];
					if (val && val.isProtected && val.isDirty()) {
						cnt++;
						found[prop] = val.tempVal();
					}
				}
			}

			if (cnt === 0)
				return undefined;

			return found;
		},
		getDirtyProtectedObservables: function () {
			var self = this,
				val,
				found = {},
				cnt = 0;

			for (var prop in self) {
				if (self.hasOwnProperty(prop)) {
					val = self[prop];
					if (val && val.isProtected && val.isDirty()) {
						cnt++;
						found[prop] = val;
					}
				}
			}

			if (cnt === 0)
				return undefined;

			return found;
		},
		commitDirtyProtectedObservables: function (toCommit) {
			var self = this,
				commitObj = toCommit || self;

			objectForEach(self.getDirtyProtectedObservables(commitObj), function (val) {
				val.commit();
			});
			return self;
		},
		revertDirtyProtectedObservables: function (toRevert) {
			var self = this,
				revertObj = toRevert || self;

			foreachDirtyProtectedObjectProperties(revertObj, function (val) {
				val.revert();
			});
		},
		getDirtySaveableValues: function() {
			return getDirtySaveableValues(this);
		},
		getDirtySaveable: function() {
			return getDirtySaveable(this);
		}
	};
	//#endregion

	//#region sql operators
	var sqlOperators = [
		{
			english: [
				'Equal To',
				'eq',
				'Equals'
			],
			operators: [
				'=',
				'==',
				'==='
			],
			sqlOperator: '='
		},
		{
			english: [
				'Not Equal To'
			],
			operators: [
				'!=',
				'!==',
				'<>'
			],
			sqlOperator: '<>'
		},
		{
			english: [
				'Greater Than',
				'gt'
			],
			operators: [
				'>'
			],
			sqlOperator: '>'
		},
		{
			english: [
				'Greater Than Or Equal To'
			],
			operators: [
				'>='
			],
			sqlOperator: '>='
		},
		{
			english: [
				'Less Than',
				'lt'
			],
			operators: [
				'<'
			],
			sqlOperator: '<'
		},
		{
			english: [
				'Less Than Or Equal To'
			],
			operators: [
				'<='
			],
			sqlOperator: '<='
		},
		{
			english: [
				'Between'
			],
			operators: [
				'BETWEEN'
			],
			sqlOperator: 'BETWEEN'
		},
		{
			english: [
				'In'
			],
			operators: [
				'IN'
			],
			sqlOperator: 'IN'
		},
		{
			english: [
				'Not In'
			],
			operators: [
				'NOT IN'
			],
			sqlOperator: 'NOT IN'
		},
		{
			english: [
				'Starts With'
			],
			operators: [
				'startsWith'
			],
			sqlOperator: 'startsWith'
		},
		{
			english: [
				'End With'
			],
			operators: [
				'endsWith'
			],
			sqlOperator: 'endsWith'
		},
		{
			english: [
				'Contains'
			],
			operators: [
				'contains'
			],
			sqlOperator: 'contains'
		}
	];

	var sqlDataTypeOperatorsEnglish = [
		{
			dataTypes: [
				'money',
				'smallmoney',//***??
				'decimal',
				'int',
				'tinyint',
				'smallint',
				'bigint',//***??
				'numeric',
				'float',
				'datetime',
				'smalldatetime',
				'date',
				'datetime2',//***??
				'time',//***??
				'timestamp'//***??
			],
			operatorOptions: [
				'Equal To',
				'Not Equal To',
				'Greater Than',
				'Greater Than Or Equal To',
				'Less Than',
				'Less Than Or Equal To',
				'Between',
				'In',
				'Not In'
			]
		},
		{
			dataTypes: [
				'varbinary',
				'varchar',
				'nchar',
				'char',
				'nvarchar',
				'text',//***??
				'uniqueidentifier'//***??
			],
			operatorOptions: [
				'Equal To',
				'Not Equal To',
				'Starts With',
				'Ends With',
				'Contains',
				'In',
				'Not In'
			]
		},
		{
			dataTypes: [
				'bit',
				'bool'
			],
			operatorOptions: [
				'Equal To',
				' Not Equal To '
			]
		}

	];

	var sqlDataTypeOperators = [
		{
			dataTypes: [
				'money',
				'smallmoney',//***??
				'decimal',
				'int',
				'tinyint',
				'smallint',
				'bigint',//***??
				'numeric',
				'float',
				'datetime',
				'smalldatetime',
				'date',
				'datetime2',//***??
				'time',//***??
				'timestamp'//***??
			],
			operatorOptions: [
				' = ',
				' Not Equal To ',
				' > ',
				' >= ',
				' < ',
				' <= ',
				'Between',
				'In',
				'Not In'
			]
		},
		{
			dataTypes: [
				'varbinary',
				'varchar',
				'nchar',
				'char',
				'nvarchar',
				'text',//***??
				'uniqueidentifier'//***??
			],
			operatorOptions: [
				' = ',
				' Not Equal To ',
				'Starts With',
				'Ends With',
				'Contains',
				'In',
				'Not In'
			]
		},
		{
			dataTypes: [
				'bit',
				'bool'
			],
			operatorOptions: [
				' = ',
				' Not Equal To '
			]
		}

	];

	var sqlSimpleOperators = {
		eq: { english: 'Equal To', operator: '=' },
		nt: { english: 'Not Equal To', operator: '<>' },
		gt: { english: 'Greater Than', operator: '>' },
		ge: { english: 'Greater Than Or Equal To', operator: '>=' },
		lt: { english: 'Less Than', operator: '<' },
		le: { english: 'Less Than Or Equal To', operator: '<=' },
		bt: { english: 'Between', operator: 'BETWEEN' },
		n: { english: 'In', operator: 'IN' },
		nn: { english: 'Not In', operator: 'NOT IN' } ,
		sw: { english: 'Starts With', operator: 'sw' } ,
		ew: { english: 'Ends With', operator: 'ew' } ,
		ct: { english: 'Contains', operator: 'ct' }
	};

	var sqlDataTypeOperatorConverters = [
		{
			dataTypes: [
				'money',
				'smallmoney',//***??
				'decimal',
				'int',
				'tinyint',
				'smallint',
				'bigint',//***??
				'numeric',
				'float',
				'datetime',
				'smalldatetime',
				'date',
				'datetime2',//***??
				'time',//***??
				'timestamp'//***??
			],
			operatorOptions: [
				sqlSimpleOperators.eq,
				sqlSimpleOperators.nt,
				sqlSimpleOperators.gt,
				sqlSimpleOperators.ge,
				sqlSimpleOperators.lt,
				sqlSimpleOperators.le,
				sqlSimpleOperators.bt,
				sqlSimpleOperators.n,
				sqlSimpleOperators.nn
			]
		},
		{
			dataTypes: [
				'varbinary',
				'varchar',
				'nchar',
				'char',
				'nvarchar',
				'text',//***??
				'uniqueidentifier'//***??
			],
			operatorOptions: [
				sqlSimpleOperators.eq,
				sqlSimpleOperators.nt,
				sqlSimpleOperators.sw,
				sqlSimpleOperators.ew,
				sqlSimpleOperators.ct,
				sqlSimpleOperators.n,
				sqlSimpleOperators.nn
			]
		},
		{
			dataTypes: [
				'bit',
				'bool'
			],
			operatorOptions: [
				sqlSimpleOperators.eq,
				sqlSimpleOperators.nt
			]
		}

	];
	//#endregion

	//wrapper to an observable that requires accept/cancel
	ko.saveableObservable = function (initialValue) {
		//throttle = throttle || 250;
		//private variables
		var actualValue = ko.observable(initialValue),
			tempValue = initialValue,
			isDirty = ko.observable(false),
			extendDefaults = {
				ignore: false
			};

		//computed observable that we will return
		var result = ko.computed({
			//always return the actual value
			read: function () {
				return actualValue();
			},
			//stored in a temporary spot until commit
			write: function (newVal) {
				result.tempVal(newVal);
				tempValue = newVal;
				if (tempValue != actualValue())
					isDirty(true);
				else
					isDirty(false);
			}
		});//.extend({throttle: throttle});

		//result.dirtyFlag = ko.dirtyFlag(result);
		result.isDirty = ko.computed(function () {
			return isDirty();
		});

		result.tempVal = ko.observable(tempValue);//.extend({ throttle: throttle });

		result.tempVal.subscribe(function (newVal) {
			result.tempVal(newVal);
			tempValue = newVal;
			if (tempValue != actualValue())
				isDirty(true);
			else
				isDirty(false);
		});
		//result.tempVal = function () {
		//    return tempValue;
		//};

		//if different, commit temp value
		result.commit = function () {
			if (tempValue !== actualValue()) {
				actualValue(result.tempVal());
				result.tempVal(tempValue);
			}
			isDirty(false);
		};

		result.extend = function (args) {
			var opt = ko.utils.extend(extendDefaults, args);
			result.ignore = opt.ignore;
		};

		//force subscribers to take original
		result.revert = function () {
			actualValue.valueHasMutated();
			tempValue = actualValue();   //reset temp value
			result.tempVal(actualValue());
			isDirty(false);
		};

		//result.isProtected = false;

		result.isSaveable = true;
		result.isReadonly = false;
		result.ignore = false;

		return result;
	};

	//wrapper to an observable that requires accept/cancel
	ko.protectedObservable = function (initialValue) {
		//throttle = throttle || 250;
		//private variables
		var actualValue = ko.observable(initialValue),
			tempValue = initialValue,
			isDirty = ko.observable(false),
			extendDefaults = {
				saveable: false,
				ignore: false
			};

		//computed observable that we will return
		var result = ko.computed({
			//always return the actual value
			read: function () {
				return actualValue();
			},
			//stored in a temporary spot until commit
			write: function (newVal) {
				result.tempVal(newVal);
				tempValue = newVal;
				if (tempValue != actualValue())
					isDirty(true);
				else
					isDirty(false);
			}
		});//.extend({throttle: throttle});

		//result.dirtyFlag = ko.dirtyFlag(result);
		result.isDirty = ko.computed(function () {
			return isDirty();
		});

		result.tempVal = ko.observable(tempValue);//.extend({ throttle: throttle });

		result.tempVal.subscribe(function (newVal) {
			result.tempVal(newVal);
			tempValue = newVal;
			if (tempValue != actualValue())
				isDirty(true);
			else
				isDirty(false);
		});
		//result.tempVal = function () {
		//    return tempValue;
		//};

		//if different, commit temp value
		result.commit = function () {
			if (tempValue !== actualValue()) {
				actualValue(result.tempVal());
				result.tempVal(tempValue);
			}
			isDirty(false);
		};

		result.extend = function (args) {
			var opt = ko.utils.extend(extendDefaults, args);
			result.isSaveable = opt.saveable;
			result.ignore = args.ignore;
		};

		//force subscribers to take original
		result.revert = function () {
			actualValue.valueHasMutated();
			tempValue = actualValue();   //reset temp value
			result.tempVal(actualValue());
			isDirty(false);
		};

		result.isProtected = true;

		result.isSaveable = true;
		result.isReadonly = false;
		result.ignore = false;

		return result;
	};
	utils = {
		guid: guid,
		sqlSimpleOperators: sqlSimpleOperators,
		sqlDataTypeOperatorConverters: sqlDataTypeOperatorConverters,
		sqlDataTypeOperators: sqlDataTypeOperators,
		sqlDataTypeOperatorsEnglish: sqlDataTypeOperatorsEnglish,
		sqlOperators: sqlOperators,
		createObject: createObject,
		createSaveableObject: createSaveableObject,
		objectFilterProperties: objectFilterProperties,
		objectForEach: objectForEach,
		hasDirtyProtectedObservables: hasDirtyProtectedObservables,
		foreachDirtySaveableObjectProperties: foreachDirtySaveableObjectProperties,
		getDirtyProtectedObservableValues: getDirtyProtectedObservableValues,
		commitDirtyProtectedObservables: commitDirtyProtectedObservables,
		revertDirtyProtectedObservables: revertDirtyProtectedObservables,
		getDirtySaveableValues: getDirtySaveableValues,
		hasDirtySaveable: hasDirtySaveable,
		commitDirtySaveable: commitDirtySaveable,
		revertDirtySaveable: revertDirtySaveable,
		extendToSaveableObject: extendToSaveableObject,
		extendPrototypeToSaveableObject: extendPrototypeToSaveableObject
	};

	return {
		utils: utils
	};

	function createObject(o) {
		o = o || {};
		var f = function () {
			return {};
		};
		f.prototype = o;
		return new f();
	}

	//perks to http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
	function guid() {
		return (typeof (window.crypto) != 'undefined' &&
			typeof (window.crypto.getRandomValues) != 'undefined') ?
			(function () {
				// If we have a cryptographically secure PRNG, use that
				// http://stackoverflow.com/questions/6906916/collisions-when-generating-uuids-in-javascript
				var buf = new Uint16Array(8);
				window.crypto.getRandomValues(buf);
				var s4 = function (num) {
					var ret = num.toString(16);
					while (ret.length < 4) {
						ret = "0" + ret;
					}
					return ret;
				};
				return (s4(buf[0]) + s4(buf[1]) + "-" + s4(buf[2]) + "-" + s4(buf[3]) + "-" + s4(buf[4]) + "-" + s4(buf[5]) + s4(buf[6]) + s4(buf[7]));
			})()
			:
			(function () {
				// Otherwise, just use Math.random
				// http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#2117523
				return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
					var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
					return v.toString(16);
				});
			})();
	}

	/**
	 * Generates a GUID string, according to RFC4122 standards.
	 * @returns {String} The generated GUID.
	 * @example af8a8416-6e18-a307-bd9c-f2c947bbb3aa
	 * @author Slavik Meltser (slavik@meltser.info).
	 * @link http://slavik.meltser.info/?p=142
	 */
		//function guid() {
		//    function p8(s) {
		//        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
		//        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
		//    }
		//    return p8() + p8(true) + p8(true) + p8();
		//}

	function createSaveableObject(o) {
		o = o || {};
		var f = function () { return this; };
		f.prototype = ko.utils.extend(saveableContainingObjectPrototypeStarter, o);
		return new f();
	}

	function extendPrototypeToSaveableObject(prototype) {
		ko.utils.extend(prototype, saveableContainingObjectPrototypeStarter);
	}

	function extendToSaveableObject(obj) {
		obj.prototype = ko.utils.extend(saveableContainingObjectPrototypeStarter, obj.prototype);
	}

	function objectFilterProperties(obj, predicate) {
		var toReturn = {},
			cnt = 0;
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				if (predicate(obj[prop])) {
					cnt++;
					toReturn[prop] = obj[prop];
				}
			}
		}
		return cnt === 0 ? undefined : toReturn;
	}

	function objectForEach(obj, callback) {
		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				callback(obj[prop]);
			}
		}
	}

	function foreachDirtyProtectedObjectProperties(obj, callback) {
		for (var prop in getDirtyProtectedObservables(obj)) {
			if (obj.hasOwnProperty(prop)) {
				callback(obj[prop]);
			}
		}
	}

	function foreachDirtySaveableObjectProperties(obj, callback) {
		for (var prop in getDirtySaveable(obj)) {
			if (obj.hasOwnProperty(prop)) {
				callback(obj[prop]);
			}
		}
	}

	//protected observable helpers
	function getDirtyProtectedObservableValues(obj) {
		var found = {},
			cnt = 0,
			val;

		for (var prop in this) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isProtected && !val.ignore && val.isDirty()) {
					cnt++;
					found[prop] = val.tempVal();
				}
			}
		}

		if (cnt === 0)
			return undefined;

		return found;
	}

	function getDirtyProtectedObservables(obj) {
		var found = {},
			cnt = 0,
			val;

		for (var prop in this) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isProtected && !val.ignore && val.isDirty()) {
					cnt++;
					found[prop] = val;
				}
			}
		}

		if (cnt === 0)
			return undefined;

		return found;
	}

	function hasDirtyProtectedObservables(obj, throttle) {
		return ko.computed(function () {
			var val;

			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					val = this[prop];
					if (val && val.isProtected && !val.ignore && val.isDirty()) {
						return true;
					}
				}
			}

			return false;
		}, obj).extend({ throttle: throttle || 100 });
	}

	//toCommit is optional when not provided all are commited
	function commitDirtyProtectedObservables(obj, toCommit) {
		var toCom = toCommit ? toCommit : obj,
			val;

		for (var prop in toCom) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isProtected && !val.ignore && val.isDirty()) {
					obj[prop].commit();
				}
			}
		}

		return obj;
	}

	//toRevert is optional when not provided all are toRevert
	function revertDirtyProtectedObservables(obj, toRevert) {
		var toRev = toRevert ? toRevert : obj,
			val;

		for (var prop in toRev) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isProtected && !val.ignore && val.isDirty()) {
					obj[prop].revert();
				}
			}
		}

		return obj;
	}
	//end protected observable helpers

	//saveable protected observable helpers
	function getDirtySaveableValues(obj) {
		var found = {},
			cnt = 0,
			val;

		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isSaveable && !val.ignore && val.isDirty()) {
					cnt++;
					found[prop] = val.tempVal();
				}
			}
		}

		if (cnt === 0)
			return undefined;

		return found;
	}

	function getDirtySaveable(obj) {
		var found = {},
			cnt = 0,
			val;

		for (var prop in obj) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isSaveable && !val.ignore && val.isDirty()) {
					cnt++;
					found[prop] = val;
				}
			}
		}

		if (cnt === 0)
			return undefined;

		return found;
	}



	function hasDirtySaveable(obj, throttle) {
		return ko.computed(function () {
			var val;

			for (var prop in this) {
				if (this.hasOwnProperty(prop)) {
					val = this[prop];
					if (val && val.isSaveable && !val.ignore && val.isDirty()) {
						return true;
					}
				}
			}

			return false;
		}, obj).extend({ throttle: throttle || 100 });
	}


	function commitDirtySaveable(obj, toCommit) {
		/// <summary>Commits all dirty saveable values in an object.</summary>
		/// <param name="obj" optional="false" type="Object">The object containing the values to be commited.</param>
		/// <param name="toCommit" optional="true" type="Object">Object specifying values in obj to commit. Optional when not provided all values in obj are commited.</param>
		/// <returns type="Object">obj.</returns>
		///
		var toCom = toCommit ? toCommit : obj,
			val;

		for (var prop in toCom) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isSaveable && !val.ignore && val.isDirty()) {
					obj[prop].commit();
				}
			}
		}

		return obj;
	}


	function revertDirtySaveable(obj, toRevert) {
		/// <summary>Reverts all dirty saveable values in an object.</summary>
		/// <param name="obj" type="Object">The object containing the values to be reverted.</param>
		/// <param name="toRevert" type="Object">Object specifying values in obj to revert. Optional when not provided all values in obj are reverted.</param>
		/// <returns type="Object">obj.</returns>

		var toRev = toRevert ? toRevert : obj,
			val;

		for (var prop in toRev) {
			if (obj.hasOwnProperty(prop)) {
				val = obj[prop];
				if (val && val.isSaveable && !val.ignore && val.isDirty()) {
					obj[prop].revert();
				}
			}
		}

		return obj;
	}
	//end saveable protected observable helpers

})();

