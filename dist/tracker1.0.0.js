/* Tracker SDK 1.0.0 */
 (function() {
/*
Author: Geraint Luff and others
Year: 2013

This code is released into the "public domain" by its author(s).  Anybody may use, alter and distribute the code without restriction.  The author makes no guarantees, and takes no liability of any kind for use of this code.

If you find a bug or make an improvement, it would be courteous to let the author know, but it is not compulsory.
*/
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    global.tv4 = factory();
  } else if (typeof module !== 'undefined' && module.exports){
    // CommonJS. Define export.
    module.exports = factory();
  } else {
    // Browser globals
    global.tv4 = factory();
  }
}(this, function () {

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FObject%2Fkeys
if (!Object.keys) {
	Object.keys = (function () {
		var hasOwnProperty = Object.prototype.hasOwnProperty,
			hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
			dontEnums = [
				'toString',
				'toLocaleString',
				'valueOf',
				'hasOwnProperty',
				'isPrototypeOf',
				'propertyIsEnumerable',
				'constructor'
			],
			dontEnumsLength = dontEnums.length;

		return function (obj) {
			if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) {
				throw new TypeError('Object.keys called on non-object');
			}

			var result = [];

			for (var prop in obj) {
				if (hasOwnProperty.call(obj, prop)) {
					result.push(prop);
				}
			}

			if (hasDontEnumBug) {
				for (var i=0; i < dontEnumsLength; i++) {
					if (hasOwnProperty.call(obj, dontEnums[i])) {
						result.push(dontEnums[i]);
					}
				}
			}
			return result;
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
if (!Object.create) {
	Object.create = (function(){
		function F(){}

		return function(o){
			if (arguments.length !== 1) {
				throw new Error('Object.create implementation only accepts one parameter.');
			}
			F.prototype = o;
			return new F();
		};
	})();
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/isArray?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FisArray
if(!Array.isArray) {
	Array.isArray = function (vArg) {
		return Object.prototype.toString.call(vArg) === "[object Array]";
	};
}
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf?redirectlocale=en-US&redirectslug=JavaScript%2FReference%2FGlobal_Objects%2FArray%2FindexOf
if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
		if (this === null) {
			throw new TypeError();
		}
		var t = Object(this);
		var len = t.length >>> 0;

		if (len === 0) {
			return -1;
		}
		var n = 0;
		if (arguments.length > 1) {
			n = Number(arguments[1]);
			if (n !== n) { // shortcut for verifying if it's NaN
				n = 0;
			} else if (n !== 0 && n !== Infinity && n !== -Infinity) {
				n = (n > 0 || -1) * Math.floor(Math.abs(n));
			}
		}
		if (n >= len) {
			return -1;
		}
		var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);
		for (; k < len; k++) {
			if (k in t && t[k] === searchElement) {
				return k;
			}
		}
		return -1;
	};
}

// Grungey Object.isFrozen hack
if (!Object.isFrozen) {
	Object.isFrozen = function (obj) {
		var key = "tv4_test_frozen_key";
		while (obj.hasOwnProperty(key)) {
			key += Math.random();
		}
		try {
			obj[key] = true;
			delete obj[key];
			return false;
		} catch (e) {
			return true;
		}
	};
}
// Based on: https://github.com/geraintluff/uri-templates, but with all the de-substitution stuff removed

var uriTemplateGlobalModifiers = {
	"+": true,
	"#": true,
	".": true,
	"/": true,
	";": true,
	"?": true,
	"&": true
};
var uriTemplateSuffices = {
	"*": true
};

function notReallyPercentEncode(string) {
	return encodeURI(string).replace(/%25[0-9][0-9]/g, function (doubleEncoded) {
		return "%" + doubleEncoded.substring(3);
	});
}

function uriTemplateSubstitution(spec) {
	var modifier = "";
	if (uriTemplateGlobalModifiers[spec.charAt(0)]) {
		modifier = spec.charAt(0);
		spec = spec.substring(1);
	}
	var separator = "";
	var prefix = "";
	var shouldEscape = true;
	var showVariables = false;
	var trimEmptyString = false;
	if (modifier === '+') {
		shouldEscape = false;
	} else if (modifier === ".") {
		prefix = ".";
		separator = ".";
	} else if (modifier === "/") {
		prefix = "/";
		separator = "/";
	} else if (modifier === '#') {
		prefix = "#";
		shouldEscape = false;
	} else if (modifier === ';') {
		prefix = ";";
		separator = ";";
		showVariables = true;
		trimEmptyString = true;
	} else if (modifier === '?') {
		prefix = "?";
		separator = "&";
		showVariables = true;
	} else if (modifier === '&') {
		prefix = "&";
		separator = "&";
		showVariables = true;
	}

	var varNames = [];
	var varList = spec.split(",");
	var varSpecs = [];
	var varSpecMap = {};
	for (var i = 0; i < varList.length; i++) {
		var varName = varList[i];
		var truncate = null;
		if (varName.indexOf(":") !== -1) {
			var parts = varName.split(":");
			varName = parts[0];
			truncate = parseInt(parts[1], 10);
		}
		var suffices = {};
		while (uriTemplateSuffices[varName.charAt(varName.length - 1)]) {
			suffices[varName.charAt(varName.length - 1)] = true;
			varName = varName.substring(0, varName.length - 1);
		}
		var varSpec = {
			truncate: truncate,
			name: varName,
			suffices: suffices
		};
		varSpecs.push(varSpec);
		varSpecMap[varName] = varSpec;
		varNames.push(varName);
	}
	var subFunction = function (valueFunction) {
		var result = "";
		var startIndex = 0;
		for (var i = 0; i < varSpecs.length; i++) {
			var varSpec = varSpecs[i];
			var value = valueFunction(varSpec.name);
			if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || (typeof value === 'object' && Object.keys(value).length === 0)) {
				startIndex++;
				continue;
			}
			if (i === startIndex) {
				result += prefix;
			} else {
				result += (separator || ",");
			}
			if (Array.isArray(value)) {
				if (showVariables) {
					result += varSpec.name + "=";
				}
				for (var j = 0; j < value.length; j++) {
					if (j > 0) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
						if (varSpec.suffices['*'] && showVariables) {
							result += varSpec.name + "=";
						}
					}
					result += shouldEscape ? encodeURIComponent(value[j]).replace(/!/g, "%21") : notReallyPercentEncode(value[j]);
				}
			} else if (typeof value === "object") {
				if (showVariables && !varSpec.suffices['*']) {
					result += varSpec.name + "=";
				}
				var first = true;
				for (var key in value) {
					if (!first) {
						result += varSpec.suffices['*'] ? (separator || ",") : ",";
					}
					first = false;
					result += shouldEscape ? encodeURIComponent(key).replace(/!/g, "%21") : notReallyPercentEncode(key);
					result += varSpec.suffices['*'] ? '=' : ",";
					result += shouldEscape ? encodeURIComponent(value[key]).replace(/!/g, "%21") : notReallyPercentEncode(value[key]);
				}
			} else {
				if (showVariables) {
					result += varSpec.name;
					if (!trimEmptyString || value !== "") {
						result += "=";
					}
				}
				if (varSpec.truncate != null) {
					value = value.substring(0, varSpec.truncate);
				}
				result += shouldEscape ? encodeURIComponent(value).replace(/!/g, "%21"): notReallyPercentEncode(value);
			}
		}
		return result;
	};
	subFunction.varNames = varNames;
	return {
		prefix: prefix,
		substitution: subFunction
	};
}

function UriTemplate(template) {
	if (!(this instanceof UriTemplate)) {
		return new UriTemplate(template);
	}
	var parts = template.split("{");
	var textParts = [parts.shift()];
	var prefixes = [];
	var substitutions = [];
	var varNames = [];
	while (parts.length > 0) {
		var part = parts.shift();
		var spec = part.split("}")[0];
		var remainder = part.substring(spec.length + 1);
		var funcs = uriTemplateSubstitution(spec);
		substitutions.push(funcs.substitution);
		prefixes.push(funcs.prefix);
		textParts.push(remainder);
		varNames = varNames.concat(funcs.substitution.varNames);
	}
	this.fill = function (valueFunction) {
		var result = textParts[0];
		for (var i = 0; i < substitutions.length; i++) {
			var substitution = substitutions[i];
			result += substitution(valueFunction);
			result += textParts[i + 1];
		}
		return result;
	};
	this.varNames = varNames;
	this.template = template;
}
UriTemplate.prototype = {
	toString: function () {
		return this.template;
	},
	fillFromObject: function (obj) {
		return this.fill(function (varName) {
			return obj[varName];
		});
	}
};
var ValidatorContext = function ValidatorContext(parent, collectMultiple, errorReporter, checkRecursive, trackUnknownProperties) {
	this.missing = [];
	this.missingMap = {};
	this.formatValidators = parent ? Object.create(parent.formatValidators) : {};
	this.schemas = parent ? Object.create(parent.schemas) : {};
	this.collectMultiple = collectMultiple;
	this.errors = [];
	this.handleError = collectMultiple ? this.collectError : this.returnError;
	if (checkRecursive) {
		this.checkRecursive = true;
		this.scanned = [];
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
		this.scannedFrozenValidationErrors = [];
		this.validatedSchemasKey = 'tv4_validation_id';
		this.validationErrorsKey = 'tv4_validation_errors_id';
	}
	if (trackUnknownProperties) {
		this.trackUnknownProperties = true;
		this.knownPropertyPaths = {};
		this.unknownPropertyPaths = {};
	}
	this.errorReporter = errorReporter || defaultErrorReporter('en');
	if (typeof this.errorReporter === 'string') {
		throw new Error('debug');
	}
	this.definedKeywords = {};
	if (parent) {
		for (var key in parent.definedKeywords) {
			this.definedKeywords[key] = parent.definedKeywords[key].slice(0);
		}
	}
};
ValidatorContext.prototype.defineKeyword = function (keyword, keywordFunction) {
	this.definedKeywords[keyword] = this.definedKeywords[keyword] || [];
	this.definedKeywords[keyword].push(keywordFunction);
};
ValidatorContext.prototype.createError = function (code, messageParams, dataPath, schemaPath, subErrors, data, schema) {
	var error = new ValidationError(code, messageParams, dataPath, schemaPath, subErrors);
	error.message = this.errorReporter(error, data, schema);
	return error;
};
ValidatorContext.prototype.returnError = function (error) {
	return error;
};
ValidatorContext.prototype.collectError = function (error) {
	if (error) {
		this.errors.push(error);
	}
	return null;
};
ValidatorContext.prototype.prefixErrors = function (startIndex, dataPath, schemaPath) {
	for (var i = startIndex; i < this.errors.length; i++) {
		this.errors[i] = this.errors[i].prefixWith(dataPath, schemaPath);
	}
	return this;
};
ValidatorContext.prototype.banUnknownProperties = function (data, schema) {
	for (var unknownPath in this.unknownPropertyPaths) {
		var error = this.createError(ErrorCodes.UNKNOWN_PROPERTY, {path: unknownPath}, unknownPath, "", null, data, schema);
		var result = this.handleError(error);
		if (result) {
			return result;
		}
	}
	return null;
};

ValidatorContext.prototype.addFormat = function (format, validator) {
	if (typeof format === 'object') {
		for (var key in format) {
			this.addFormat(key, format[key]);
		}
		return this;
	}
	this.formatValidators[format] = validator;
};
ValidatorContext.prototype.resolveRefs = function (schema, urlHistory) {
	if (schema['$ref'] !== undefined) {
		urlHistory = urlHistory || {};
		if (urlHistory[schema['$ref']]) {
			return this.createError(ErrorCodes.CIRCULAR_REFERENCE, {urls: Object.keys(urlHistory).join(', ')}, '', '', null, undefined, schema);
		}
		urlHistory[schema['$ref']] = true;
		schema = this.getSchema(schema['$ref'], urlHistory);
	}
	return schema;
};
ValidatorContext.prototype.getSchema = function (url, urlHistory) {
	var schema;
	if (this.schemas[url] !== undefined) {
		schema = this.schemas[url];
		return this.resolveRefs(schema, urlHistory);
	}
	var baseUrl = url;
	var fragment = "";
	if (url.indexOf('#') !== -1) {
		fragment = url.substring(url.indexOf("#") + 1);
		baseUrl = url.substring(0, url.indexOf("#"));
	}
	if (typeof this.schemas[baseUrl] === 'object') {
		schema = this.schemas[baseUrl];
		var pointerPath = decodeURIComponent(fragment);
		if (pointerPath === "") {
			return this.resolveRefs(schema, urlHistory);
		} else if (pointerPath.charAt(0) !== "/") {
			return undefined;
		}
		var parts = pointerPath.split("/").slice(1);
		for (var i = 0; i < parts.length; i++) {
			var component = parts[i].replace(/~1/g, "/").replace(/~0/g, "~");
			if (schema[component] === undefined) {
				schema = undefined;
				break;
			}
			schema = schema[component];
		}
		if (schema !== undefined) {
			return this.resolveRefs(schema, urlHistory);
		}
	}
	if (this.missing[baseUrl] === undefined) {
		this.missing.push(baseUrl);
		this.missing[baseUrl] = baseUrl;
		this.missingMap[baseUrl] = baseUrl;
	}
};
ValidatorContext.prototype.searchSchemas = function (schema, url) {
	if (Array.isArray(schema)) {
		for (var i = 0; i < schema.length; i++) {
			this.searchSchemas(schema[i], url);
		}
	} else if (schema && typeof schema === "object") {
		if (typeof schema.id === "string") {
			if (isTrustedUrl(url, schema.id)) {
				if (this.schemas[schema.id] === undefined) {
					this.schemas[schema.id] = schema;
				}
			}
		}
		for (var key in schema) {
			if (key !== "enum") {
				if (typeof schema[key] === "object") {
					this.searchSchemas(schema[key], url);
				} else if (key === "$ref") {
					var uri = getDocumentUri(schema[key]);
					if (uri && this.schemas[uri] === undefined && this.missingMap[uri] === undefined) {
						this.missingMap[uri] = uri;
					}
				}
			}
		}
	}
};
ValidatorContext.prototype.addSchema = function (url, schema) {
	//overload
	if (typeof url !== 'string' || typeof schema === 'undefined') {
		if (typeof url === 'object' && typeof url.id === 'string') {
			schema = url;
			url = schema.id;
		}
		else {
			return;
		}
	}
	if (url === getDocumentUri(url) + "#") {
		// Remove empty fragment
		url = getDocumentUri(url);
	}
	this.schemas[url] = schema;
	delete this.missingMap[url];
	normSchema(schema, url);
	this.searchSchemas(schema, url);
};

ValidatorContext.prototype.getSchemaMap = function () {
	var map = {};
	for (var key in this.schemas) {
		map[key] = this.schemas[key];
	}
	return map;
};

ValidatorContext.prototype.getSchemaUris = function (filterRegExp) {
	var list = [];
	for (var key in this.schemas) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.getMissingUris = function (filterRegExp) {
	var list = [];
	for (var key in this.missingMap) {
		if (!filterRegExp || filterRegExp.test(key)) {
			list.push(key);
		}
	}
	return list;
};

ValidatorContext.prototype.dropSchemas = function () {
	this.schemas = {};
	this.reset();
};
ValidatorContext.prototype.reset = function () {
	this.missing = [];
	this.missingMap = {};
	this.errors = [];
};

ValidatorContext.prototype.validateAll = function (data, schema, dataPathParts, schemaPathParts, dataPointerPath) {
	var topLevel;
	schema = this.resolveRefs(schema);
	if (!schema) {
		return null;
	} else if (schema instanceof ValidationError) {
		this.errors.push(schema);
		return schema;
	}

	var startErrorCount = this.errors.length;
	var frozenIndex, scannedFrozenSchemaIndex = null, scannedSchemasIndex = null;
	if (this.checkRecursive && data && typeof data === 'object') {
		topLevel = !this.scanned.length;
		if (data[this.validatedSchemasKey]) {
			var schemaIndex = data[this.validatedSchemasKey].indexOf(schema);
			if (schemaIndex !== -1) {
				this.errors = this.errors.concat(data[this.validationErrorsKey][schemaIndex]);
				return null;
			}
		}
		if (Object.isFrozen(data)) {
			frozenIndex = this.scannedFrozen.indexOf(data);
			if (frozenIndex !== -1) {
				var frozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].indexOf(schema);
				if (frozenSchemaIndex !== -1) {
					this.errors = this.errors.concat(this.scannedFrozenValidationErrors[frozenIndex][frozenSchemaIndex]);
					return null;
				}
			}
		}
		this.scanned.push(data);
		if (Object.isFrozen(data)) {
			if (frozenIndex === -1) {
				frozenIndex = this.scannedFrozen.length;
				this.scannedFrozen.push(data);
				this.scannedFrozenSchemas.push([]);
			}
			scannedFrozenSchemaIndex = this.scannedFrozenSchemas[frozenIndex].length;
			this.scannedFrozenSchemas[frozenIndex][scannedFrozenSchemaIndex] = schema;
			this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = [];
		} else {
			if (!data[this.validatedSchemasKey]) {
				try {
					Object.defineProperty(data, this.validatedSchemasKey, {
						value: [],
						configurable: true
					});
					Object.defineProperty(data, this.validationErrorsKey, {
						value: [],
						configurable: true
					});
				} catch (e) {
					//IE 7/8 workaround
					data[this.validatedSchemasKey] = [];
					data[this.validationErrorsKey] = [];
				}
			}
			scannedSchemasIndex = data[this.validatedSchemasKey].length;
			data[this.validatedSchemasKey][scannedSchemasIndex] = schema;
			data[this.validationErrorsKey][scannedSchemasIndex] = [];
		}
	}

	var errorCount = this.errors.length;
	var error = this.validateBasic(data, schema, dataPointerPath)
		|| this.validateNumeric(data, schema, dataPointerPath)
		|| this.validateString(data, schema, dataPointerPath)
		|| this.validateArray(data, schema, dataPointerPath)
		|| this.validateObject(data, schema, dataPointerPath)
		|| this.validateCombinations(data, schema, dataPointerPath)
		|| this.validateHypermedia(data, schema, dataPointerPath)
		|| this.validateFormat(data, schema, dataPointerPath)
		|| this.validateDefinedKeywords(data, schema, dataPointerPath)
		|| null;

	if (topLevel) {
		while (this.scanned.length) {
			var item = this.scanned.pop();
			delete item[this.validatedSchemasKey];
		}
		this.scannedFrozen = [];
		this.scannedFrozenSchemas = [];
	}

	if (error || errorCount !== this.errors.length) {
		while ((dataPathParts && dataPathParts.length) || (schemaPathParts && schemaPathParts.length)) {
			var dataPart = (dataPathParts && dataPathParts.length) ? "" + dataPathParts.pop() : null;
			var schemaPart = (schemaPathParts && schemaPathParts.length) ? "" + schemaPathParts.pop() : null;
			if (error) {
				error = error.prefixWith(dataPart, schemaPart);
			}
			this.prefixErrors(errorCount, dataPart, schemaPart);
		}
	}

	if (scannedFrozenSchemaIndex !== null) {
		this.scannedFrozenValidationErrors[frozenIndex][scannedFrozenSchemaIndex] = this.errors.slice(startErrorCount);
	} else if (scannedSchemasIndex !== null) {
		data[this.validationErrorsKey][scannedSchemasIndex] = this.errors.slice(startErrorCount);
	}

	return this.handleError(error);
};
ValidatorContext.prototype.validateFormat = function (data, schema) {
	if (typeof schema.format !== 'string' || !this.formatValidators[schema.format]) {
		return null;
	}
	var errorMessage = this.formatValidators[schema.format].call(null, data, schema);
	if (typeof errorMessage === 'string' || typeof errorMessage === 'number') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage}, '', '/format', null, data, schema);
	} else if (errorMessage && typeof errorMessage === 'object') {
		return this.createError(ErrorCodes.FORMAT_CUSTOM, {message: errorMessage.message || "?"}, errorMessage.dataPath || '', errorMessage.schemaPath || "/format", null, data, schema);
	}
	return null;
};
ValidatorContext.prototype.validateDefinedKeywords = function (data, schema, dataPointerPath) {
	for (var key in this.definedKeywords) {
		if (typeof schema[key] === 'undefined') {
			continue;
		}
		var validationFunctions = this.definedKeywords[key];
		for (var i = 0; i < validationFunctions.length; i++) {
			var func = validationFunctions[i];
			var result = func(data, schema[key], schema, dataPointerPath);
			if (typeof result === 'string' || typeof result === 'number') {
				return this.createError(ErrorCodes.KEYWORD_CUSTOM, {key: key, message: result}, '', '', null, data, schema).prefixWith(null, key);
			} else if (result && typeof result === 'object') {
				var code = result.code;
				if (typeof code === 'string') {
					if (!ErrorCodes[code]) {
						throw new Error('Undefined error code (use defineError): ' + code);
					}
					code = ErrorCodes[code];
				} else if (typeof code !== 'number') {
					code = ErrorCodes.KEYWORD_CUSTOM;
				}
				var messageParams = (typeof result.message === 'object') ? result.message : {key: key, message: result.message || "?"};
				var schemaPath = result.schemaPath || ("/" + key.replace(/~/g, '~0').replace(/\//g, '~1'));
				return this.createError(code, messageParams, result.dataPath || null, schemaPath, null, data, schema);
			}
		}
	}
	return null;
};

function recursiveCompare(A, B) {
	if (A === B) {
		return true;
	}
	if (A && B && typeof A === "object" && typeof B === "object") {
		if (Array.isArray(A) !== Array.isArray(B)) {
			return false;
		} else if (Array.isArray(A)) {
			if (A.length !== B.length) {
				return false;
			}
			for (var i = 0; i < A.length; i++) {
				if (!recursiveCompare(A[i], B[i])) {
					return false;
				}
			}
		} else {
			var key;
			for (key in A) {
				if (B[key] === undefined && A[key] !== undefined) {
					return false;
				}
			}
			for (key in B) {
				if (A[key] === undefined && B[key] !== undefined) {
					return false;
				}
			}
			for (key in A) {
				if (!recursiveCompare(A[key], B[key])) {
					return false;
				}
			}
		}
		return true;
	}
	return false;
}

ValidatorContext.prototype.validateBasic = function validateBasic(data, schema, dataPointerPath) {
	var error;
	if (error = this.validateType(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	if (error = this.validateEnum(data, schema, dataPointerPath)) {
		return error.prefixWith(null, "type");
	}
	return null;
};

ValidatorContext.prototype.validateType = function validateType(data, schema) {
	if (schema.type === undefined) {
		return null;
	}
	var dataType = typeof data;
	if (data === null) {
		dataType = "null";
	} else if (Array.isArray(data)) {
		dataType = "array";
	}
	var allowedTypes = schema.type;
	if (!Array.isArray(allowedTypes)) {
		allowedTypes = [allowedTypes];
	}

	for (var i = 0; i < allowedTypes.length; i++) {
		var type = allowedTypes[i];
		if (type === dataType || (type === "integer" && dataType === "number" && (data % 1 === 0))) {
			return null;
		}
	}
	return this.createError(ErrorCodes.INVALID_TYPE, {type: dataType, expected: allowedTypes.join("/")}, '', '', null, data, schema);
};

ValidatorContext.prototype.validateEnum = function validateEnum(data, schema) {
	if (schema["enum"] === undefined) {
		return null;
	}
	for (var i = 0; i < schema["enum"].length; i++) {
		var enumVal = schema["enum"][i];
		if (recursiveCompare(data, enumVal)) {
			return null;
		}
	}
	return this.createError(ErrorCodes.ENUM_MISMATCH, {value: (typeof JSON !== 'undefined') ? JSON.stringify(data) : data}, '', '', null, data, schema);
};

ValidatorContext.prototype.validateNumeric = function validateNumeric(data, schema, dataPointerPath) {
	return this.validateMultipleOf(data, schema, dataPointerPath)
		|| this.validateMinMax(data, schema, dataPointerPath)
		|| this.validateNaN(data, schema, dataPointerPath)
		|| null;
};

var CLOSE_ENOUGH_LOW = Math.pow(2, -51);
var CLOSE_ENOUGH_HIGH = 1 - CLOSE_ENOUGH_LOW;
ValidatorContext.prototype.validateMultipleOf = function validateMultipleOf(data, schema) {
	var multipleOf = schema.multipleOf || schema.divisibleBy;
	if (multipleOf === undefined) {
		return null;
	}
	if (typeof data === "number") {
		var remainder = (data/multipleOf)%1;
		if (remainder >= CLOSE_ENOUGH_LOW && remainder < CLOSE_ENOUGH_HIGH) {
			return this.createError(ErrorCodes.NUMBER_MULTIPLE_OF, {value: data, multipleOf: multipleOf}, '', '', null, data, schema);
		}
	}
	return null;
};

ValidatorContext.prototype.validateMinMax = function validateMinMax(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (schema.minimum !== undefined) {
		if (data < schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM, {value: data, minimum: schema.minimum}, '', '/minimum', null, data, schema);
		}
		if (schema.exclusiveMinimum && data === schema.minimum) {
			return this.createError(ErrorCodes.NUMBER_MINIMUM_EXCLUSIVE, {value: data, minimum: schema.minimum}, '', '/exclusiveMinimum', null, data, schema);
		}
	}
	if (schema.maximum !== undefined) {
		if (data > schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM, {value: data, maximum: schema.maximum}, '', '/maximum', null, data, schema);
		}
		if (schema.exclusiveMaximum && data === schema.maximum) {
			return this.createError(ErrorCodes.NUMBER_MAXIMUM_EXCLUSIVE, {value: data, maximum: schema.maximum}, '', '/exclusiveMaximum', null, data, schema);
		}
	}
	return null;
};

ValidatorContext.prototype.validateNaN = function validateNaN(data, schema) {
	if (typeof data !== "number") {
		return null;
	}
	if (isNaN(data) === true || data === Infinity || data === -Infinity) {
		return this.createError(ErrorCodes.NUMBER_NOT_A_NUMBER, {value: data}, '', '/type', null, data, schema);
	}
	return null;
};

ValidatorContext.prototype.validateString = function validateString(data, schema, dataPointerPath) {
	return this.validateStringLength(data, schema, dataPointerPath)
		|| this.validateStringPattern(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateStringLength = function validateStringLength(data, schema) {
	if (typeof data !== "string") {
		return null;
	}
	if (schema.minLength !== undefined) {
		if (data.length < schema.minLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_SHORT, {length: data.length, minimum: schema.minLength}, '', '/minLength', null, data, schema);
		}
	}
	if (schema.maxLength !== undefined) {
		if (data.length > schema.maxLength) {
			return this.createError(ErrorCodes.STRING_LENGTH_LONG, {length: data.length, maximum: schema.maxLength}, '', '/maxLength', null, data, schema);
		}
	}
	return null;
};

ValidatorContext.prototype.validateStringPattern = function validateStringPattern(data, schema) {
	if (typeof data !== "string" || (typeof schema.pattern !== "string" && !(schema.pattern instanceof RegExp))) {
		return null;
	}
	var regexp;
	if (schema.pattern instanceof RegExp) {
	  regexp = schema.pattern;
	}
	else {
	  var body, flags = '';
	  // Check for regular expression literals
	  // @see http://www.ecma-international.org/ecma-262/5.1/#sec-7.8.5
	  var literal = schema.pattern.match(/^\/(.+)\/([img]*)$/);
	  if (literal) {
	    body = literal[1];
	    flags = literal[2];
	  }
	  else {
	    body = schema.pattern;
	  }
	  regexp = new RegExp(body, flags);
	}
	if (!regexp.test(data)) {
		return this.createError(ErrorCodes.STRING_PATTERN, {pattern: schema.pattern}, '', '/pattern', null, data, schema);
	}
	return null;
};

ValidatorContext.prototype.validateArray = function validateArray(data, schema, dataPointerPath) {
	if (!Array.isArray(data)) {
		return null;
	}
	return this.validateArrayLength(data, schema, dataPointerPath)
		|| this.validateArrayUniqueItems(data, schema, dataPointerPath)
		|| this.validateArrayItems(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateArrayLength = function validateArrayLength(data, schema) {
	var error;
	if (schema.minItems !== undefined) {
		if (data.length < schema.minItems) {
			error = this.createError(ErrorCodes.ARRAY_LENGTH_SHORT, {length: data.length, minimum: schema.minItems}, '', '/minItems', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxItems !== undefined) {
		if (data.length > schema.maxItems) {
			error = this.createError(ErrorCodes.ARRAY_LENGTH_LONG, {length: data.length, maximum: schema.maxItems}, '', '/maxItems', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayUniqueItems = function validateArrayUniqueItems(data, schema) {
	if (schema.uniqueItems) {
		for (var i = 0; i < data.length; i++) {
			for (var j = i + 1; j < data.length; j++) {
				if (recursiveCompare(data[i], data[j])) {
					var error = this.createError(ErrorCodes.ARRAY_UNIQUE, {match1: i, match2: j}, '', '/uniqueItems', null, data, schema);
					if (this.handleError(error)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateArrayItems = function validateArrayItems(data, schema, dataPointerPath) {
	if (schema.items === undefined) {
		return null;
	}
	var error, i;
	if (Array.isArray(schema.items)) {
		for (i = 0; i < data.length; i++) {
			if (i < schema.items.length) {
				if (error = this.validateAll(data[i], schema.items[i], [i], ["items", i], dataPointerPath + "/" + i)) {
					return error;
				}
			} else if (schema.additionalItems !== undefined) {
				if (typeof schema.additionalItems === "boolean") {
					if (!schema.additionalItems) {
						error = (this.createError(ErrorCodes.ARRAY_ADDITIONAL_ITEMS, {}, '/' + i, '/additionalItems', null, data, schema));
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (error = this.validateAll(data[i], schema.additionalItems, [i], ["additionalItems"], dataPointerPath + "/" + i)) {
					return error;
				}
			}
		}
	} else {
		for (i = 0; i < data.length; i++) {
			if (error = this.validateAll(data[i], schema.items, [i], ["items"], dataPointerPath + "/" + i)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObject = function validateObject(data, schema, dataPointerPath) {
	if (typeof data !== "object" || data === null || Array.isArray(data)) {
		return null;
	}
	return this.validateObjectMinMaxProperties(data, schema, dataPointerPath)
		|| this.validateObjectRequiredProperties(data, schema, dataPointerPath)
		|| this.validateObjectProperties(data, schema, dataPointerPath)
		|| this.validateObjectDependencies(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateObjectMinMaxProperties = function validateObjectMinMaxProperties(data, schema) {
	var keys = Object.keys(data);
	var error;
	if (schema.minProperties !== undefined) {
		if (keys.length < schema.minProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MINIMUM, {propertyCount: keys.length, minimum: schema.minProperties}, '', '/minProperties', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	if (schema.maxProperties !== undefined) {
		if (keys.length > schema.maxProperties) {
			error = this.createError(ErrorCodes.OBJECT_PROPERTIES_MAXIMUM, {propertyCount: keys.length, maximum: schema.maxProperties}, '', '/maxProperties', null, data, schema);
			if (this.handleError(error)) {
				return error;
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectRequiredProperties = function validateObjectRequiredProperties(data, schema) {
	if (schema.required !== undefined) {
		for (var i = 0; i < schema.required.length; i++) {
			var key = schema.required[i];
			if (data[key] === undefined) {
				var error = this.createError(ErrorCodes.OBJECT_REQUIRED, {key: key}, '', '/required/' + i, null, data, schema);
				if (this.handleError(error)) {
					return error;
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectProperties = function validateObjectProperties(data, schema, dataPointerPath) {
	var error;
	for (var key in data) {
		var keyPointerPath = dataPointerPath + "/" + key.replace(/~/g, '~0').replace(/\//g, '~1');
		var foundMatch = false;
		if (schema.properties !== undefined && schema.properties[key] !== undefined) {
			foundMatch = true;
			if (error = this.validateAll(data[key], schema.properties[key], [key], ["properties", key], keyPointerPath)) {
				return error;
			}
		}
		if (schema.patternProperties !== undefined) {
			for (var patternKey in schema.patternProperties) {
				var regexp = new RegExp(patternKey);
				if (regexp.test(key)) {
					foundMatch = true;
					if (error = this.validateAll(data[key], schema.patternProperties[patternKey], [key], ["patternProperties", patternKey], keyPointerPath)) {
						return error;
					}
				}
			}
		}
		if (!foundMatch) {
			if (schema.additionalProperties !== undefined) {
				if (this.trackUnknownProperties) {
					this.knownPropertyPaths[keyPointerPath] = true;
					delete this.unknownPropertyPaths[keyPointerPath];
				}
				if (typeof schema.additionalProperties === "boolean") {
					if (!schema.additionalProperties) {
						error = this.createError(ErrorCodes.OBJECT_ADDITIONAL_PROPERTIES, {key: key}, '', '/additionalProperties', null, data, schema).prefixWith(key, null);
						if (this.handleError(error)) {
							return error;
						}
					}
				} else {
					if (error = this.validateAll(data[key], schema.additionalProperties, [key], ["additionalProperties"], keyPointerPath)) {
						return error;
					}
				}
			} else if (this.trackUnknownProperties && !this.knownPropertyPaths[keyPointerPath]) {
				this.unknownPropertyPaths[keyPointerPath] = true;
			}
		} else if (this.trackUnknownProperties) {
			this.knownPropertyPaths[keyPointerPath] = true;
			delete this.unknownPropertyPaths[keyPointerPath];
		}
	}
	return null;
};

ValidatorContext.prototype.validateObjectDependencies = function validateObjectDependencies(data, schema, dataPointerPath) {
	var error;
	if (schema.dependencies !== undefined) {
		for (var depKey in schema.dependencies) {
			if (data[depKey] !== undefined) {
				var dep = schema.dependencies[depKey];
				if (typeof dep === "string") {
					if (data[dep] === undefined) {
						error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: dep}, '', '', null, data, schema).prefixWith(null, depKey).prefixWith(null, "dependencies");
						if (this.handleError(error)) {
							return error;
						}
					}
				} else if (Array.isArray(dep)) {
					for (var i = 0; i < dep.length; i++) {
						var requiredKey = dep[i];
						if (data[requiredKey] === undefined) {
							error = this.createError(ErrorCodes.OBJECT_DEPENDENCY_KEY, {key: depKey, missing: requiredKey}, '', '/' + i, null, data, schema).prefixWith(null, depKey).prefixWith(null, "dependencies");
							if (this.handleError(error)) {
								return error;
							}
						}
					}
				} else {
					if (error = this.validateAll(data, dep, [], ["dependencies", depKey], dataPointerPath)) {
						return error;
					}
				}
			}
		}
	}
	return null;
};

ValidatorContext.prototype.validateCombinations = function validateCombinations(data, schema, dataPointerPath) {
	return this.validateAllOf(data, schema, dataPointerPath)
		|| this.validateAnyOf(data, schema, dataPointerPath)
		|| this.validateOneOf(data, schema, dataPointerPath)
		|| this.validateNot(data, schema, dataPointerPath)
		|| null;
};

ValidatorContext.prototype.validateAllOf = function validateAllOf(data, schema, dataPointerPath) {
	if (schema.allOf === undefined) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.allOf.length; i++) {
		var subSchema = schema.allOf[i];
		if (error = this.validateAll(data, subSchema, [], ["allOf", i], dataPointerPath)) {
			return error;
		}
	}
	return null;
};

ValidatorContext.prototype.validateAnyOf = function validateAnyOf(data, schema, dataPointerPath) {
	if (schema.anyOf === undefined) {
		return null;
	}
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	var errorAtEnd = true;
	for (var i = 0; i < schema.anyOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.anyOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["anyOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			this.errors = this.errors.slice(0, startErrorCount);

			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
				// We need to continue looping so we catch all the property definitions, but we don't want to return an error
				errorAtEnd = false;
				continue;
			}

			return null;
		}
		if (error) {
			errors.push(error.prefixWith(null, "" + i).prefixWith(null, "anyOf"));
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (errorAtEnd) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ANY_OF_MISSING, {}, "", "/anyOf", errors, data, schema);
	}
};

ValidatorContext.prototype.validateOneOf = function validateOneOf(data, schema, dataPointerPath) {
	if (schema.oneOf === undefined) {
		return null;
	}
	var validIndex = null;
	var errors = [];
	var startErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
	}
	for (var i = 0; i < schema.oneOf.length; i++) {
		if (this.trackUnknownProperties) {
			this.unknownPropertyPaths = {};
			this.knownPropertyPaths = {};
		}
		var subSchema = schema.oneOf[i];

		var errorCount = this.errors.length;
		var error = this.validateAll(data, subSchema, [], ["oneOf", i], dataPointerPath);

		if (error === null && errorCount === this.errors.length) {
			if (validIndex === null) {
				validIndex = i;
			} else {
				this.errors = this.errors.slice(0, startErrorCount);
				return this.createError(ErrorCodes.ONE_OF_MULTIPLE, {index1: validIndex, index2: i}, "", "/oneOf", null, data, schema);
			}
			if (this.trackUnknownProperties) {
				for (var knownKey in this.knownPropertyPaths) {
					oldKnownPropertyPaths[knownKey] = true;
					delete oldUnknownPropertyPaths[knownKey];
				}
				for (var unknownKey in this.unknownPropertyPaths) {
					if (!oldKnownPropertyPaths[unknownKey]) {
						oldUnknownPropertyPaths[unknownKey] = true;
					}
				}
			}
		} else if (error) {
			errors.push(error);
		}
	}
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (validIndex === null) {
		errors = errors.concat(this.errors.slice(startErrorCount));
		this.errors = this.errors.slice(0, startErrorCount);
		return this.createError(ErrorCodes.ONE_OF_MISSING, {}, "", "/oneOf", errors, data, schema);
	} else {
		this.errors = this.errors.slice(0, startErrorCount);
	}
	return null;
};

ValidatorContext.prototype.validateNot = function validateNot(data, schema, dataPointerPath) {
	if (schema.not === undefined) {
		return null;
	}
	var oldErrorCount = this.errors.length;
	var oldUnknownPropertyPaths, oldKnownPropertyPaths;
	if (this.trackUnknownProperties) {
		oldUnknownPropertyPaths = this.unknownPropertyPaths;
		oldKnownPropertyPaths = this.knownPropertyPaths;
		this.unknownPropertyPaths = {};
		this.knownPropertyPaths = {};
	}
	var error = this.validateAll(data, schema.not, null, null, dataPointerPath);
	var notErrors = this.errors.slice(oldErrorCount);
	this.errors = this.errors.slice(0, oldErrorCount);
	if (this.trackUnknownProperties) {
		this.unknownPropertyPaths = oldUnknownPropertyPaths;
		this.knownPropertyPaths = oldKnownPropertyPaths;
	}
	if (error === null && notErrors.length === 0) {
		return this.createError(ErrorCodes.NOT_PASSED, {}, "", "/not", null, data, schema);
	}
	return null;
};

ValidatorContext.prototype.validateHypermedia = function validateCombinations(data, schema, dataPointerPath) {
	if (!schema.links) {
		return null;
	}
	var error;
	for (var i = 0; i < schema.links.length; i++) {
		var ldo = schema.links[i];
		if (ldo.rel === "describedby") {
			var template = new UriTemplate(ldo.href);
			var allPresent = true;
			for (var j = 0; j < template.varNames.length; j++) {
				if (!(template.varNames[j] in data)) {
					allPresent = false;
					break;
				}
			}
			if (allPresent) {
				var schemaUrl = template.fillFromObject(data);
				var subSchema = {"$ref": schemaUrl};
				if (error = this.validateAll(data, subSchema, [], ["links", i], dataPointerPath)) {
					return error;
				}
			}
		}
	}
};

// parseURI() and resolveUrl() are from https://gist.github.com/1088850
//   -  released as public domain by author ("Yaffle") - see comments on gist

function parseURI(url) {
	var m = String(url).replace(/^\s+|\s+$/g, '').match(/^([^:\/?#]+:)?(\/\/(?:[^:@]*(?::[^:@]*)?@)?(([^:\/?#]*)(?::(\d*))?))?([^?#]*)(\?[^#]*)?(#[\s\S]*)?/);
	// authority = '//' + user + ':' + pass '@' + hostname + ':' port
	return (m ? {
		href     : m[0] || '',
		protocol : m[1] || '',
		authority: m[2] || '',
		host     : m[3] || '',
		hostname : m[4] || '',
		port     : m[5] || '',
		pathname : m[6] || '',
		search   : m[7] || '',
		hash     : m[8] || ''
	} : null);
}

function resolveUrl(base, href) {// RFC 3986

	function removeDotSegments(input) {
		var output = [];
		input.replace(/^(\.\.?(\/|$))+/, '')
			.replace(/\/(\.(\/|$))+/g, '/')
			.replace(/\/\.\.$/, '/../')
			.replace(/\/?[^\/]*/g, function (p) {
				if (p === '/..') {
					output.pop();
				} else {
					output.push(p);
				}
		});
		return output.join('').replace(/^\//, input.charAt(0) === '/' ? '/' : '');
	}

	href = parseURI(href || '');
	base = parseURI(base || '');

	return !href || !base ? null : (href.protocol || base.protocol) +
		(href.protocol || href.authority ? href.authority : base.authority) +
		removeDotSegments(href.protocol || href.authority || href.pathname.charAt(0) === '/' ? href.pathname : (href.pathname ? ((base.authority && !base.pathname ? '/' : '') + base.pathname.slice(0, base.pathname.lastIndexOf('/') + 1) + href.pathname) : base.pathname)) +
		(href.protocol || href.authority || href.pathname ? href.search : (href.search || base.search)) +
		href.hash;
}

function getDocumentUri(uri) {
	return uri.split('#')[0];
}
function normSchema(schema, baseUri) {
	if (schema && typeof schema === "object") {
		if (baseUri === undefined) {
			baseUri = schema.id;
		} else if (typeof schema.id === "string") {
			baseUri = resolveUrl(baseUri, schema.id);
			schema.id = baseUri;
		}
		if (Array.isArray(schema)) {
			for (var i = 0; i < schema.length; i++) {
				normSchema(schema[i], baseUri);
			}
		} else {
			if (typeof schema['$ref'] === "string") {
				schema['$ref'] = resolveUrl(baseUri, schema['$ref']);
			}
			for (var key in schema) {
				if (key !== "enum") {
					normSchema(schema[key], baseUri);
				}
			}
		}
	}
}

function defaultErrorReporter(language) {
	language = language || 'en';

	var errorMessages = languages[language];

	return function (error) {
		var messageTemplate = errorMessages[error.code] || ErrorMessagesDefault[error.code];
		if (typeof messageTemplate !== 'string') {
			return "Unknown error code " + error.code + ": " + JSON.stringify(error.messageParams);
		}
		var messageParams = error.params;
		// Adapted from Crockford's supplant()
		return messageTemplate.replace(/\{([^{}]*)\}/g, function (whole, varName) {
			var subValue = messageParams[varName];
			return typeof subValue === 'string' || typeof subValue === 'number' ? subValue : whole;
		});
	};
}

var ErrorCodes = {
	INVALID_TYPE: 0,
	ENUM_MISMATCH: 1,
	ANY_OF_MISSING: 10,
	ONE_OF_MISSING: 11,
	ONE_OF_MULTIPLE: 12,
	NOT_PASSED: 13,
	// Numeric errors
	NUMBER_MULTIPLE_OF: 100,
	NUMBER_MINIMUM: 101,
	NUMBER_MINIMUM_EXCLUSIVE: 102,
	NUMBER_MAXIMUM: 103,
	NUMBER_MAXIMUM_EXCLUSIVE: 104,
	NUMBER_NOT_A_NUMBER: 105,
	// String errors
	STRING_LENGTH_SHORT: 200,
	STRING_LENGTH_LONG: 201,
	STRING_PATTERN: 202,
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: 300,
	OBJECT_PROPERTIES_MAXIMUM: 301,
	OBJECT_REQUIRED: 302,
	OBJECT_ADDITIONAL_PROPERTIES: 303,
	OBJECT_DEPENDENCY_KEY: 304,
	// Array errors
	ARRAY_LENGTH_SHORT: 400,
	ARRAY_LENGTH_LONG: 401,
	ARRAY_UNIQUE: 402,
	ARRAY_ADDITIONAL_ITEMS: 403,
	// Custom/user-defined errors
	FORMAT_CUSTOM: 500,
	KEYWORD_CUSTOM: 501,
	// Schema structure
	CIRCULAR_REFERENCE: 600,
	// Non-standard validation options
	UNKNOWN_PROPERTY: 1000
};
var ErrorCodeLookup = {};
for (var key in ErrorCodes) {
	ErrorCodeLookup[ErrorCodes[key]] = key;
}
var ErrorMessagesDefault = {
	INVALID_TYPE: "Invalid type: {type} (expected {expected})",
	ENUM_MISMATCH: "No enum match for: {value}",
	ANY_OF_MISSING: "Data does not match any schemas from \"anyOf\"",
	ONE_OF_MISSING: "Data does not match any schemas from \"oneOf\"",
	ONE_OF_MULTIPLE: "Data is valid against more than one schema from \"oneOf\": indices {index1} and {index2}",
	NOT_PASSED: "Data matches schema from \"not\"",
	// Numeric errors
	NUMBER_MULTIPLE_OF: "Value {value} is not a multiple of {multipleOf}",
	NUMBER_MINIMUM: "Value {value} is less than minimum {minimum}",
	NUMBER_MINIMUM_EXCLUSIVE: "Value {value} is equal to exclusive minimum {minimum}",
	NUMBER_MAXIMUM: "Value {value} is greater than maximum {maximum}",
	NUMBER_MAXIMUM_EXCLUSIVE: "Value {value} is equal to exclusive maximum {maximum}",
	NUMBER_NOT_A_NUMBER: "Value {value} is not a valid number",
	// String errors
	STRING_LENGTH_SHORT: "String is too short ({length} chars), minimum {minimum}",
	STRING_LENGTH_LONG: "String is too long ({length} chars), maximum {maximum}",
	STRING_PATTERN: "String does not match pattern: {pattern}",
	// Object errors
	OBJECT_PROPERTIES_MINIMUM: "Too few properties defined ({propertyCount}), minimum {minimum}",
	OBJECT_PROPERTIES_MAXIMUM: "Too many properties defined ({propertyCount}), maximum {maximum}",
	OBJECT_REQUIRED: "Missing required property: {key}",
	OBJECT_ADDITIONAL_PROPERTIES: "Additional properties not allowed",
	OBJECT_DEPENDENCY_KEY: "Dependency failed - key must exist: {missing} (due to key: {key})",
	// Array errors
	ARRAY_LENGTH_SHORT: "Array is too short ({length}), minimum {minimum}",
	ARRAY_LENGTH_LONG: "Array is too long ({length}), maximum {maximum}",
	ARRAY_UNIQUE: "Array items are not unique (indices {match1} and {match2})",
	ARRAY_ADDITIONAL_ITEMS: "Additional items not allowed",
	// Format errors
	FORMAT_CUSTOM: "Format validation failed ({message})",
	KEYWORD_CUSTOM: "Keyword failed: {key} ({message})",
	// Schema structure
	CIRCULAR_REFERENCE: "Circular $refs: {urls}",
	// Non-standard validation options
	UNKNOWN_PROPERTY: "Unknown property (not in schema)"
};

function ValidationError(code, params, dataPath, schemaPath, subErrors) {
	Error.call(this);
	if (code === undefined) {
		throw new Error ("No error code supplied: " + schemaPath);
	}
	this.message = '';
	this.params = params;
	this.code = code;
	this.dataPath = dataPath || "";
	this.schemaPath = schemaPath || "";
	this.subErrors = subErrors || null;

	var err = new Error(this.message);
	this.stack = err.stack || err.stacktrace;
	if (!this.stack) {
		try {
			throw err;
		}
		catch(err) {
			this.stack = err.stack || err.stacktrace;
		}
	}
}
ValidationError.prototype = Object.create(Error.prototype);
ValidationError.prototype.constructor = ValidationError;
ValidationError.prototype.name = 'ValidationError';

ValidationError.prototype.prefixWith = function (dataPrefix, schemaPrefix) {
	if (dataPrefix !== null) {
		dataPrefix = dataPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.dataPath = "/" + dataPrefix + this.dataPath;
	}
	if (schemaPrefix !== null) {
		schemaPrefix = schemaPrefix.replace(/~/g, "~0").replace(/\//g, "~1");
		this.schemaPath = "/" + schemaPrefix + this.schemaPath;
	}
	if (this.subErrors !== null) {
		for (var i = 0; i < this.subErrors.length; i++) {
			this.subErrors[i].prefixWith(dataPrefix, schemaPrefix);
		}
	}
	return this;
};

function isTrustedUrl(baseUrl, testUrl) {
	if(testUrl.substring(0, baseUrl.length) === baseUrl){
		var remainder = testUrl.substring(baseUrl.length);
		if ((testUrl.length > 0 && testUrl.charAt(baseUrl.length - 1) === "/")
			|| remainder.charAt(0) === "#"
			|| remainder.charAt(0) === "?") {
			return true;
		}
	}
	return false;
}

var languages = {};
function createApi(language) {
	var globalContext = new ValidatorContext();
	var currentLanguage;
	var customErrorReporter;
	var api = {
		setErrorReporter: function (reporter) {
			if (typeof reporter === 'string') {
				return this.language(reporter);
			}
			customErrorReporter = reporter;
			return true;
		},
		addFormat: function () {
			globalContext.addFormat.apply(globalContext, arguments);
		},
		language: function (code) {
			if (!code) {
				return currentLanguage;
			}
			if (!languages[code]) {
				code = code.split('-')[0]; // fall back to base language
			}
			if (languages[code]) {
				currentLanguage = code;
				return code; // so you can tell if fall-back has happened
			}
			return false;
		},
		addLanguage: function (code, messageMap) {
			var key;
			for (key in ErrorCodes) {
				if (messageMap[key] && !messageMap[ErrorCodes[key]]) {
					messageMap[ErrorCodes[key]] = messageMap[key];
				}
			}
			var rootCode = code.split('-')[0];
			if (!languages[rootCode]) { // use for base language if not yet defined
				languages[code] = messageMap;
				languages[rootCode] = messageMap;
			} else {
				languages[code] = Object.create(languages[rootCode]);
				for (key in messageMap) {
					if (typeof languages[rootCode][key] === 'undefined') {
						languages[rootCode][key] = messageMap[key];
					}
					languages[code][key] = messageMap[key];
				}
			}
			return this;
		},
		freshApi: function (language) {
			var result = createApi();
			if (language) {
				result.language(language);
			}
			return result;
		},
		validate: function (data, schema, checkRecursive, banUnknownProperties) {
			var def = defaultErrorReporter(currentLanguage);
			var errorReporter = customErrorReporter ? function (error, data, schema) {
				return customErrorReporter(error, data, schema) || def(error, data, schema);
			} : def;
			var context = new ValidatorContext(globalContext, false, errorReporter, checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			var error = context.validateAll(data, schema, null, null, "");
			if (!error && banUnknownProperties) {
				error = context.banUnknownProperties(data, schema);
			}
			this.error = error;
			this.missing = context.missing;
			this.valid = (error === null);
			return this.valid;
		},
		validateResult: function () {
			var result = {};
			this.validate.apply(result, arguments);
			return result;
		},
		validateMultiple: function (data, schema, checkRecursive, banUnknownProperties) {
			var def = defaultErrorReporter(currentLanguage);
			var errorReporter = customErrorReporter ? function (error, data, schema) {
				return customErrorReporter(error, data, schema) || def(error, data, schema);
			} : def;
			var context = new ValidatorContext(globalContext, true, errorReporter, checkRecursive, banUnknownProperties);
			if (typeof schema === "string") {
				schema = {"$ref": schema};
			}
			context.addSchema("", schema);
			context.validateAll(data, schema, null, null, "");
			if (banUnknownProperties) {
				context.banUnknownProperties(data, schema);
			}
			var result = {};
			result.errors = context.errors;
			result.missing = context.missing;
			result.valid = (result.errors.length === 0);
			return result;
		},
		addSchema: function () {
			return globalContext.addSchema.apply(globalContext, arguments);
		},
		getSchema: function () {
			return globalContext.getSchema.apply(globalContext, arguments);
		},
		getSchemaMap: function () {
			return globalContext.getSchemaMap.apply(globalContext, arguments);
		},
		getSchemaUris: function () {
			return globalContext.getSchemaUris.apply(globalContext, arguments);
		},
		getMissingUris: function () {
			return globalContext.getMissingUris.apply(globalContext, arguments);
		},
		dropSchemas: function () {
			globalContext.dropSchemas.apply(globalContext, arguments);
		},
		defineKeyword: function () {
			globalContext.defineKeyword.apply(globalContext, arguments);
		},
		defineError: function (codeName, codeNumber, defaultMessage) {
			if (typeof codeName !== 'string' || !/^[A-Z]+(_[A-Z]+)*$/.test(codeName)) {
				throw new Error('Code name must be a string in UPPER_CASE_WITH_UNDERSCORES');
			}
			if (typeof codeNumber !== 'number' || codeNumber%1 !== 0 || codeNumber < 10000) {
				throw new Error('Code number must be an integer > 10000');
			}
			if (typeof ErrorCodes[codeName] !== 'undefined') {
				throw new Error('Error already defined: ' + codeName + ' as ' + ErrorCodes[codeName]);
			}
			if (typeof ErrorCodeLookup[codeNumber] !== 'undefined') {
				throw new Error('Error code already used: ' + ErrorCodeLookup[codeNumber] + ' as ' + codeNumber);
			}
			ErrorCodes[codeName] = codeNumber;
			ErrorCodeLookup[codeNumber] = codeName;
			ErrorMessagesDefault[codeName] = ErrorMessagesDefault[codeNumber] = defaultMessage;
			for (var langCode in languages) {
				var language = languages[langCode];
				if (language[codeName]) {
					language[codeNumber] = language[codeNumber] || language[codeName];
				}
			}
		},
		reset: function () {
			globalContext.reset();
			this.error = null;
			this.missing = [];
			this.valid = true;
		},
		missing: [],
		error: null,
		valid: true,
		normSchema: normSchema,
		resolveUrl: resolveUrl,
		getDocumentUri: getDocumentUri,
		errorCodes: ErrorCodes
	};
	api.language(language || 'en');
	return api;
}

var tv4 = createApi();
tv4.addLanguage('en-gb', ErrorMessagesDefault);

//legacy property
tv4.tv4 = tv4;

return tv4; // used by _header.js to globalise.

}));
/* Tracker SDK 1.0.0 */
 (function() {
/**
 * @module PETracker/app/constants
 * @name AppConstants
 * @description It have the list of constants which are used to describe Application configurations
 */
/**
 * PetAppConstants
 * @class PetAppConstants
 */
function PetAppConstants() {
    this.constants = {};
}

/** @function
 * @lends PetAppConstants.prototype
 * @name environments
 * @description It return the environmental constants
 * @returns {Object} environments
 */
PetAppConstants.prototype.environments = function () {
    var constants = {
        DEVELOPMENT: 'development',
        TEST: 'test',
        STAGE: 'stage',
        PRODUCTION: 'production'
    };
    return constants;
};

/** @function
 * @lends PetAppConstants.prototype
 * @name events
 * @description It return the events constants
 * @returns {Object} events
 */
PetAppConstants.prototype.events = function () {
    var constants = {
        CLICK: 'click',
        FORM_SUBMIT: 'formsubmit',
        LINK_CLICK: 'linkclick',
        PAGE_VIEW: 'pageview',
        SITE_SEARCH: 'sitesearch'
    };
    return constants;
};

/** @function
 * @lends PetAppConstants.prototype
 * @name platforms
 * @description It return the platform constants
 * @returns {Object} platforms
 */
PetAppConstants.prototype.platforms = function () {
    var constants = {
        MOBILE: 'mobile',
        WEB: 'web'
    };
    return constants;
};

/** @function
 * @lends PetAppConstants.prototype
 * @name get
 * @description It return all the app constants
 * @returns {Object} constants
 */
PetAppConstants.prototype.get = function () {
    var constants = {
        ENVIRONMENT: this.environments(),
        EVENTS: this.events(),
        PLATFORM: this.platforms()
    };
    return constants;
};

/**
 * @module PETracker/app/params
 * @name AppParams
 * @description It have the list of parameters which are used for Initialization
 */
/**
 * AppParams
 * @class PetAppParams
 * @constucts {Object} parameters
 * @description Tracker Initialization parameters
 */

function PetAppParams() {
    /**
     * @member {object}
     */
    this.params = {
        //schemaValidation
        schemaValidation: true,

        //autofill
        autofill: true,

        //debugMode
        debugMode: true,

        originatingSystemCode: "AutobahnTrackerSDK",

        //cookie rotatory time
        cookieRotatoryTime: '180',

        //cookie expiry time
        cookieExpiryTime: '165',

        // Tracking SDK Version
        sdkVersion: '1.0.0',

        // Current Tracker JS Version
        jsVersion: '1.0.0',

        // Application Platform
        appPlatform: 'web',

        // Application URL
        url: null,

        // Application Environment
        environment: 'production',

        offlineSupport: true,

        // Cookie Domain Name
        cookieDomainName: 'autobahn',

        // Cookie Prefix
        cookiePrefix: 'gse',

        // Interaction Type | Tracking Event Type
        interactionType: null,

        // Event auto tracking configurations
        autotracking: []
    };
}

/**
 * @module PETracker/app/params/general
 * @name GeneralParams
 * @description It have the list of parameters which are used for getting client's contextual information
 */
/**
 * GeneralParams
 * @class PetGeneralParams
 * @constucts {Object} parameters
 * @description Client's contextual parameters
 */
function PetGeneralParams() {
    // custom modules
    var paramHelper = new PetParamsHelper();

    /**
     * @member {object}
     */
    this.params = {
        // Client contextual information
        // Screen color Depth
        screenDepth: paramHelper.getScreenDepth(),

        // View Port
        viewPort: paramHelper.getViewPort(),

        // Screen Resolution
        screenResolution: paramHelper.getScreenResolution(),

        // Document Encoding type
        documentEncoding: paramHelper.getDocumentEncode(),

        // Timezone
        timezone: paramHelper.getTimezone(),

        // User Agent
        useragent: paramHelper.getUserAgent(),

        // Cookie Enabled
        isCookieEnabled: paramHelper.isCookieEnabled(),

        // Document Size
        documentSize: paramHelper.getDocumentSize(),

        // Java Enabled
        isJavaEnabled: paramHelper.isJavaEnabled(),

        // Flash player version
        flashPlayerVersion: paramHelper.getFlashVersion(),

        // Pdf Plugin Status
        pdfPluginStatus: null,

        // Quick Time Plugin status
        qtPluginStatus: null,

        // Realplayer Plugin status
        realpPluginStatus: null,

        // Windows Media Player Plugin status
        wmaPluginStatus: null,

        // Director Plugin status
        directorPluginStatus: null,

        // Google gears plugin status
        googlegearPluginStatus: null,

        // IP Addres
        userIP: null,

        // Longitude and Latitude
        latitudeLogitude: null,

        // Browser Language
        browserLanguage: paramHelper.getBrowserLanguage(),

        // Document Referrer
        documentReferrer: null,

        // Dynamic parameters (This will be computed when the request is send)
        // Current Timestamp
        timestamp: null,

        // Campaign Source
        campaignSource: null,

        // Campaign Medium
        campaignMedium: null,

        // Campaign ID
        campaignID: null,

        // Campaign Terms
        campaignTerm: null,

        // Campaign Contents
        campaignContent: null
    };
}

/**
 * @module PETracker/app/schema
 * @name AppSchema
 * @description It have the JSON schema for validating the App parameters
 */
/**
 * AppSchema
 * @class PetAppSchema
 * @constucts {Object} schema
 * @description JSON Schema for validating the PETracker.init arguments and it's types
 */

function PetAppSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'App Parameter Schema',
        id: '/app',
        type: 'object',
        properties: {
            originatingSystemCode:{
                type: 'string'
            },
            namespace: {
                type: 'string'
            },
            messageVersion: {
                type: 'string'
            },
            trackingID: {
                type: 'string'
            },
            app: {
                type: 'string'
            },
            sdkVersion: {
                type: 'string'
            },
            appPlatform: {
                type: 'string',
                enum: ['web', 'mobile']
            },
            url: {
                type: 'string',
                format: 'url'
            },
            cookieDomainName: {
                type: 'string'
            },
            cookiePrefix: {
                type: 'string'
            },
            environment: {
                type: 'string',
                enum: ['development', 'test', 'stage', 'production']
            },
            autotracking: {
                type: 'array'
            },
            appName: {
                type: 'string'
            },
            appID: {
                type: ['string', 'number']
            },
            appVersion: {
                type: ['string', 'number']
            },
            appInstallerID: {
                type: 'string'
            }
        },
        required: ['trackingID'],
        additionalProperties: true
    };
}

/**
 * @module PETracker/helpers/cookie
 * @name cookie
 * @description It is used to handle Tracking Cookie functionalities
 */
/**
 * PetCookie
 * @class PetCookie
 */
function PetCookie() {
    // constructor code here
}

/** @function
 * @lends PetCookie.prototype
 * @name create
 * @description It is used to create a tracking cookie
 * @param {String} cookieName
 * @param {String} cookiePrefix
 */
PetCookie.prototype.create = function () {
    var utilHeper = new PetUtilsHelper(),
        expiry = (1051200 * 60 * 1000),
        cookieName,
        cookiePrefix,
        cookieValue,
        expireTime,
        currentDate = new Date(),
        expires;

    if (!this.get(arguments[0])) {
        cookieName = arguments[0];
        cookiePrefix = arguments[1];
        currentDate.setTime(currentDate.getTime()+(arguments[2]*60*1000)),
        cookieValue = arguments[3];

        expires = 'expires=' + currentDate.toUTCString();

        // cookie creation
        document.cookie = cookiePrefix + cookieName + '=' + JSON.stringify(cookieValue) + ';path=/';
    }
};

/** @function
 * @lends PetUtils.prototype
 * @name get
 * @description It is used to get the value from cookie
 * @param {String} cookieName
 */
PetCookie.prototype.get = function () {
    var cookieName = arguments[0] + '=',
        cookies = document.cookie.split(';'),
        cookie,
        i;

    for (i = 0; i < cookies.length; i++) {
        cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }

    return '';
};

/** @function
 * @lends PetUtils.prototype
 * @name pageviewIndex
 * @description It is used to get & set the index value for pageview.
 * @param {String} action => get/setTime
 * @param {String} userId
 */
PetCookie.prototype.pageviewIndex = function (userId) {
    var cookieName = '__PET' + '_pv', // pv denotes the pageview
        cookie = this.get(cookieName),
        expiry = (1051200 * 60 * 1000),
        currentDate = new Date(),
        expires,
        cookieValue,
        resultIndex;

    currentDate.setTime(currentDate.getTime() + expiry);
    expires = 'expires=' + currentDate.toUTCString();

    if (cookie) {
        cookieValue = JSON.parse(cookie);
    } else {
        cookieValue = {
            index: 1
        };
    }

    if (userId === cookieValue.userID) {
        cookieValue.index++;
        resultIndex = cookieValue.index;
        document.cookie = cookieName + '=' + JSON.stringify(cookieValue) + ';' + expires + ';path=/';
    } else {
        cookieValue = {
            userID: userId,
            index: 1
        };
        resultIndex = cookieValue.index;
        document.cookie = cookieName + '=' + JSON.stringify(cookieValue) + ';' + expires + ';path=/';
    }

    return resultIndex;
};

/**
 * @module PETracker/helpers/datasize
 * @name PetGetDataSize
 * @description It handles offline data size
 */
/**
 * Sdk
 * @class PetGetDataSize
 */
function PetGetDataSize() {
    //constructor
}

/** @function
 * @lends PetGetDataSize.prototype
 * @name roughSizeOfObject
 * @description Calculate the size of the data object
 * @param {Object} data
 * @returns {Number} Value
 */
PetGetDataSize.prototype.roughSizeOfObject = function (object) {
    var objectList = [],
        stack = [object],
        bytes = 0,
        value,
        i;

    while (stack.length) {
        value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
            objectList.push(value);
            for (i in value) {
                stack.push(value[i]);
            }
        }
    }

    return bytes;
};

/** @function
 * @lends PetGetDataSize.prototype
 * @name bytesToSize
 * @description converts bytes to data size in appropriate bytes(KB|MB|GB|TB)
 * @param {Number} bytes
 * @returns {Integer} Value
 */
PetGetDataSize.prototype.bytesToSize = function (bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
        i;
    if (bytes === 0) {
        return 'n/a';
    }

    i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

/** @function
 * @lends PetGetDataSize.prototype
 * @name convertBytesToMB
 * @description converts bytes to MB
 * @param {Number} bytes
 * @returns {Integer} Value
 */
PetGetDataSize.prototype.convertBytesToMB = function (num) {
    return (num / 1048576 * 100000) / 100000;
};

/**
 * @module PETracker/helpers/offline
 * @name PetOffline
 * @description It handles offline data processing
 */
/**
 * Sdk
 * @class PetOffline
 * @constructs offline configurations
 */
function PetOffline(sdkParams) {
    this.peTrackerData = 'PETracker';
    this.getSize = new PetGetDataSize();
    this.store = new PetStorage();
    this.ajax = new PetRequest();
    this.receiver = {
        development: '//devapi.english.com/autobahn',
        test: '//testapi.english.com/autobahn',
        stage: '//stageapi.english.com/autobahn',
        production: '//api.english.com/autobahn',
        defaultUrl: '//devapi.english.com/autobahn'
    };
    this.sdkParams = sdkParams;
    this.peEventData = null;
}

/** @function
 * @lends PetOffline.prototype
 * @name save
 * @description it stores the data into local storage
 * @param {Object} data
 */
PetOffline.prototype.save = function (data, type) {
    if (data) {

        this.peEventData = this.store.get(type);

        if (!this.peEventData) {
            this.peEventData = [data];
        } else {
            this.peEventData.push(data);
        }

        this.store.set(type, this.peEventData);
    }
};

/** @function
 * @lends PetOffline.prototype
 * @name checkData
 * @description Check the data in local storage
 */
PetOffline.prototype.checkData = function () {
    // local variables
    var recordsChunkLimit,
        i,
        indexStart,
        indexEnd,
        dataArr,
        j,
        sdkData;

    this.peEventData = this.store.get("events"),
    this.peActivityData = this.store.get("activities");

    if (this.peEventData) {

        recordsChunkLimit = this.getAllowedDataChunk(this.peEventData);
        i = 0;

        while (i < this.peEventData.length) {
            dataArr = [];
            for (j = 0; j < recordsChunkLimit; j++) {

                if (i >= this.peEventData.length) {
                    break;
                }

                dataArr.push(this.peEventData[i]);
                ++i;

                if (j === 0) {
                    indexStart = i - 1;
                }
            }

            sdkData = dataArr;

            indexEnd = i - 1;
            this.send(indexStart, indexEnd, sdkData, "events");
        }
    }

    if (this.peActivityData) {

        recordsChunkLimit = this.getAllowedDataChunk(this.peActivityData);
        i = 0;

        while (i < this.peActivityData.length) {
            dataArr = [];
            for (j = 0; j < recordsChunkLimit; j++) {

                if (i >= this.peActivityData.length) {
                    break;
                }

                dataArr.push(this.peActivityData[i]);
                ++i;

                if (j === 0) {
                    indexStart = i - 1;
                }
            }

            sdkData = dataArr;

            indexEnd = i - 1;
            this.send(indexStart, indexEnd, sdkData, "activities");
        }
    }
};

/** @function
 * @lends PetOffline.prototype
 * @name send
 * @description It sends the data from local storage to tracking system
 * @param {Number} indexStart
 * @param {Number} indexEnd
 * @param {Object} sdkData
 */
PetOffline.prototype.send = function (indexStart, indexEnd, sdkData, type) {
    // local variables
    var receiverUrl,
        self = this,
        data,
        xmlhttp;

    if (typeof this.receiver[this.sdkParams.environment] !== 'undefined') {
        receiverUrl = this.receiver[this.sdkParams.environment];
    } else {
        receiverUrl = this.receiver.defaultUrl;
    }

    receiverUrl += "/collect/bulk/"+type;

    data = {
        trackingID: sdkData[0].data.trackingID,
        sdkVersion: sdkData[0].data.sdkVersion
    };

    xmlhttp = this.ajax.sendXMLHTTP(receiverUrl, sdkData, data);

    // Handling response from Receiver
    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {

            var peEventsData = self.store.get(self.peTrackerData);

            if (peEventsData) {
                if (peEventsData.length >= ++indexEnd) {
                    // delete all processed data from local storage.
                    self.store.delete(self.peTrackerData);
                }
            }
        }
    };
};

/** @function
 * @lends PetOffline.prototype
 * @name getAllowedDataChunk
 * @description It sends the data from local storage to tracking system
 * @param {Object} sdkData
 */
PetOffline.prototype.getAllowedDataChunk = function (peEventData) {
    // default bulk data chunk's size limit for processing.
    var recordsChunkLimit,
        sizeAllowed,
        tempSizeCheck,
        x;

    recordsChunkLimit = 50,
    sizeAllowed = false;

    while (!sizeAllowed) {
        tempSizeCheck = [];

        for (x = 0; x < recordsChunkLimit; x++) {
            tempSizeCheck.push(peEventData[x]);
        }

        if (this.getSize.convertBytesToMB(this.getSize.roughSizeOfObject(tempSizeCheck)) > 0.80) {
            // decrease records limit by 10 until allowed chunk (greater than 1 MB) is formed.
            recordsChunkLimit = recordsChunkLimit - 10;

            if (recordsChunkLimit < 10) {
                recordsChunkLimit = 5;
                sizeAllowed = true;
            }
        } else {
            sizeAllowed = true;
        }
    }

    return recordsChunkLimit;
};

/** @function
 * @lends PetOffline.prototype
 * @name isNetworkAvailable
 * @description It checks if active network connection is available, invokes checking local storage if connection is active
 */
PetOffline.prototype.isNetworkAvailable = function () {
    // local variables
    var self = this,
        xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr) {
        // Most browsers.
        xhr.open('GET', 'http://developer.english.com' + '?ping=' + Math.round(Math.random() * 10000), true);
    } else {
        //IE6, IE5
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('GET', 'http://developer.english.com' + '?ping=' + Math.round(Math.random() * 10000), true);
    }

    xhr.send();
    xhr.onreadystatechange = function () {
        if ((xhr.readyState === 4) && (xhr.status === 200)) {
            self.checkData();
        }
    };
};

/**
 * @module PETracker/helpers/params
 * @name params
 * @description It is used to detect the default values and client's contextual information
 */
/**
 * PetParamsHelper
 * @class PetParamsHelper
 */
function PetParamsHelper() {
    // constructor code here
}

/** @function
 * @lends PetParamsHelper.prototype
 * @name getScreenDepth
 * @description It is used to get the screen depth of client's browser
 * @return {String} screenDepth
 */
PetParamsHelper.prototype.getScreenDepth = function () {
    return window.screen.colorDepth + '-bits';
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getViewPort
 * @description It is used to get the viewport of client's browser
 * @return {String} viewport
 */
PetParamsHelper.prototype.getViewPort = function () {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    return width + 'x' + height;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getScreenResolution
 * @description It is used to get the screen resolution of client's browser
 * @return {String} screenResolution
 */
PetParamsHelper.prototype.getScreenResolution = function () {
    var clientScreen = window.screen;
    return clientScreen.width + 'x' + clientScreen.height;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getDocumentEncode
 * @description It is used to get the type of document encode in client's browser
 * @return {String} documentEncode
 */
PetParamsHelper.prototype.getDocumentEncode = function () {
    return document.characterSet;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name splitTimezone
 * @description It is used to get timezone value from client's date
 * @return {String} timezoneString
 */
PetParamsHelper.prototype.splitTimezone = function (number, length) {
    var str = '' + number;

    while (str.length < length) {
        str = '0' + str;
    }

    return str;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getTimezone
 * @description It is used to get the timezone in client's browser
 * @return {String} timezone
 */
PetParamsHelper.prototype.getTimezone = function () {
    var offset = new Date().getTimezoneOffset(),
        hours,
        minutes;

    hours = this.splitTimezone(parseInt(Math.abs(offset / 60)), 2);
    minutes = this.splitTimezone(Math.abs(offset % 60), 2);

    offset = (offset < 0 ? '+' : '-');
    offset += hours + ':' + minutes;
    return offset;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getUserAgent
 * @description It is used to detect the user agent of client application
 * @return {String} userAgent
 */
PetParamsHelper.prototype.getUserAgent = function () {
    return encodeURIComponent(navigator.userAgent);
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getDocumentSize
 * @description It is used to detect the document size of client application
 * @return {String} documentSize
 */
PetParamsHelper.prototype.getDocumentSize = function () {
    return document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getFlashVersion
 * @description It is used to detect the flash version in client browser
 * @return {String} flashVersion
 */
PetParamsHelper.prototype.getFlashVersion = function () {
    var y = 'length',
        v = 'name',
        t = 'indexOf',
        m = 'match',
        O = window,
        oa = 'navigator',
        a,
        b,
        c,
        r = '2',
        e;

    if (O[oa].plugins) {
        c = O[oa].plugins;
        for (d = 0; d < c[y] && !b; d++) {
            e = c[d];
            (-1) < e[v][t]('Shockwave Flash') && (b = e.description);
        }
    }

    if (!b) {
        try {
            a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7');
            b = a.GetVariable('$version');
            r = '3';
        } catch (g) {}
    }

    if (!b) {
        try {
            a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
            b = 'WIN 6,0,21,0';
            a.AllowScriptAccess = 'always';
            b = a.GetVariable('$version');
            r = '3';
        } catch (ca) {}
    }

    if (!b) {
        try {
            a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            b = a.GetVariable('$version');
            r = '3';
        } catch (l) {}
    }

    b && (a = b[m](/[\d]+/g)) && (a[y] >= 3) && (b = a[0] + '.' + a[1] + ' r' + a[r]);
    return b || void 0;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name isCookieEnabled
 * @description It is used to detect the cookie is enabled or disabled in client application
 * @return {Boolean}
 */
PetParamsHelper.prototype.isCookieEnabled = function () {
    return navigator.cookieEnabled;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name isJavaEnabled
 * @description It is used to detect the java is enabled or disabled in client application
 * @return {Boolean}
 */
PetParamsHelper.prototype.isJavaEnabled = function () {
    var client = window.navigator;
    if (typeof client.javaEnabled === 'function' && client.javaEnabled()) {
        return true;
    } else {
        return false;
    }
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getTimestamp
 * @description Returns current timestamp of client side app
 * @return {String} timestamp
 */
PetParamsHelper.prototype.getTimestamp = function () {
    return (new Date()).toISOString();
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getParameterByName
 * @description Returns current value by parameter name
 * @return {String} Parameter
 */
PetParamsHelper.prototype.getParameterByName = function (name) {
    var regex;

    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    regex = new RegExp('[\\?&]' + name + '=([^&#]*)'), results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getUtmParam
 * @description It returns the UTM parameters
 * @return {String} Value
 */
PetParamsHelper.prototype.getUtmParam = function (paramName) {
    return this.getParameterByName(paramName);
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getBrowserLanguage
 * @description It returns the Browser Language
 * @return {String} Value
 */
PetParamsHelper.prototype.getBrowserLanguage = function (paramName) {
    return window.navigator.userLanguage || window.navigator.language;
};

/**
 * @module PETracker/helpers/process
 * @name process
 * @description It is used to process the event parameters and send it to tracking system
 */
/**
 * PetProcess
 * @class PetProcess
 */
function PetProcess() {
    // constructor code here
}

/** @function
 * @lends PetProcess.prototype
 * @name event
 * @description It is used to process the event's data and send it to tracking system
 * @requires module:PETracker/helpers/request
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 * @param {Object} additionalParams
 * @param {String} interactionType
 * @param {Object} params
 * @param {Object} input
 * @param {Function} callback
 */
PetProcess.prototype.event = function () {
    // custom modules
    var utilHelper = new PetUtilsHelper(),
        ajax = new PetRequest(),

    // local variables
        sdkParams = utilHelper.clone(arguments[0]),
        sdkErrors = utilHelper.clone(arguments[1]),
        additionalParams = utilHelper.clone(arguments[2]),
        eventType = arguments[3],
        eventParam = utilHelper.clone(arguments[4]),
        eventInput = utilHelper.clone(arguments[5]),
        callback = arguments[6],
        result;

    // merting event parameters and event inputs, setting default values to nullable parameters
    result = utilHelper.merge(eventParam, eventInput);
    result = utilHelper.getDefaultValues(result);

    // merging pageview parameters into SDK parameters
    sdkParams = utilHelper.merge(sdkParams, result);

    //additional parameters are merged to sdkParams if event has any
    if ((typeof additionalParams === 'object') && (Object.keys(additionalParams).length > 0)) {
        sdkParams.additionalValues = additionalParams;
    }

    sdkParams.interactionType = eventType;

    // send the data to tracking system
    ajax.send(sdkParams, sdkErrors, callback);
};

/**
 * @module PETracker/helpers/request
 * @name request
 * @description It is used to send the data to Tracking System
 * @description Prerequsites: Offline-tracking/interval-based processing.
 * @description if user manually sets time interval to process data, it should be greater than or equal to 15 seconds (15000 in ms) else default value will take precedence (60000 in ms)
 */
/**
 * @member {String/Number} time-based/offline tracking.
 */
var petIntervalId = null;

/**
 * PetCookie
 * @class PetRequest
 */
function PetRequest(sdkParams) {
    /**
     * @member {Object} tracking system receiver api URLs
     */
    this.receiver = {
        development: '//devapi.english.com/autobahn',
        test: '//testapi.english.com/autobahn',
        stage: '//stageapi.english.com/autobahn',
        production: '//api.english.com/autobahn',
        defaultUrl: '//devapi.english.com/autobahn'
    };

    this.sdkParams = sdkParams;
}

/** @function
 * @lends PetRequest.prototype
 * @name send
 * @description It is used to create a tracking cookie
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 * @param {Function} callback
 */
PetRequest.prototype.send = function () {
    // custom modules
    var cookieHelper = new PetCookie(),
        userSchema = new PetUserSchema().schema,
        utilsHelper = new PetUtilsHelper(),

    // arguments
        data = utilsHelper.clone(arguments[1]), // Getting parameter list
        errors = null, // Getting errors occurred in SDK
        callback = arguments[3], // Getting user's callback
        method = arguments[4], // Getting method for the Request
        options = arguments[2],

    // local variables
        result,
        xmlhttp,
        receiverUrl,
        cookieName = '__PET',
        cookieValue = cookieHelper.get(cookieName),
        offineEnabled = options && options.offlineEnabled,
        localStorageAvailable = false,
        offline,
        intervalToProcess;

    // marge cookie value with tracker data
    if (cookieValue) {
       // data = utilsHelper.merge(data, JSON.parse(cookieValue));
    } else {
        // Check whether Internal Session ID is present in every request
        // // If not, create cookie and retrieve session ID
        // cookieHelper.create(cookieName, arguments[0].cookiePrefix, arguments[0].cookieDomainName);
        // cookieValue = cookieHelper.get(cookieName);

        // if (cookieValue) {
        //     data = utilsHelper.merge(data, JSON.parse(cookieValue));
        // }
    }

    // if (!flag) {
    //     result = tv4.validateMultiple(data, userSchema, true);
    //     if (!result.valid) {
    //         if (data.debugMode) {
    //             console.error((utilsHelper.getErrorMessages(result.errors)).join(','));
    //             return;
    //         } else {
    //             errors.user = utilHelper.getErrorMessages(result.errors);
    //         }
    //     }
    // }

    if (typeof this.receiver[options.environment] !== 'undefined') {
        receiverUrl = this.receiver[options.environment];
    } else {
        receiverUrl = this.receiver.defaultUrl;
    }

    if (typeof (Storage) === 'undefined') {
        console.log('PETracker: no local storage found.');
    } else {
        localStorageAvailable = true;
        if(offineEnabled){
            console.log(this.sdkParams);
            offline = new PetOffline(this.sdkParams);
        }
    }


    // if ((localStorageAvailable) && (typeof data.offlineSupport !== 'undefined') && (data.offlineSupport)) {
    //     offineEnabled = true;
    // }

    // Tracking Data formation
    result = {
        data: utilsHelper.removeNullParameters(utilsHelper.getDefaultValues(data))
    };

    // grouping with context
    // result.data = utilsHelper.group(result.data);

    // checking sdk schema errors
    // if (Object.keys(errors).length) {
    //     result.errors = errors;
    // }
    // if LS available, enable interval-based data processing

     if (offineEnabled && localStorageAvailable) {
         offline.save(result, options.eventType);

         intervalToProcess = 6000;
         if ((typeof data.intervalToProcess !== 'undefined') && (data.intervalToProcess) && (data.intervalToProcess >= 15000)) {
             intervalToProcess = data.intervalToProcess;
         }

         if (!petIntervalId) { // this checking prevents creating multiple interval IDs
             petIntervalId = setInterval(this.checkNetworkAvailable.bind(this), intervalToProcess);
         }
    }

    // LS not available or it means offline won't work even if enabled.
    if (!offineEnabled || !localStorageAvailable) {
        xmlhttp = this.sendXMLHTTP(receiverUrl + arguments[0], result, data, method);

        // Handling response from Receiver
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                if (typeof callback === 'function') {
                    callback(null,JSON.parse(xmlhttp.responseText));
                }
            }
            else {
                if (typeof callback === 'function') {
                    callback({
                            error: xmlhttp.status
                          });
                }
            }
        };
    }

};

/** @function
 * @lends PetRequest.prototype
 * @name sendXMLHTTP
 * @description It is used to send data to tracking system
 * @param  {String} URL [URL to make XMLHTTPREQUEST call]
 * @param  {Object} eventData [The data to send to external URL]
 * @param  {Object} data [object that contains necessary params (appId, sdkVersion etc.)]
 * @returns {Object} [returns XMLHTTPREQUEST object]
 */
PetRequest.prototype.sendXMLHTTP = function (url, eventData, data, method) {
    method = method || 'POST';
    //Making HTTP Request to Receiver
    var xmlhttp,
        supportedProtocols = ['https:', 'http:'],
        requestProtocol, gseAuthorizationToken = 'Bearer '+'e990da19-16b8-468b-bb4f-ca9668de9ec2';

    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }

    requestProtocol = (supportedProtocols.indexOf(window.location.protocol) > -1) ? window.location.protocol : 'https:';
    xmlhttp.open(method,url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    //xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlhttp.setRequestHeader('PETRACKER-TRACKING-ID', window.trackingID);

    // Setting DEBUG MODE in Header
    if (eventData instanceof Array) {
        if (eventData[0].data.debugMode) {
            xmlhttp.setRequestHeader('Debug-Mode', eventData[0].data.debugMode);
        }
    } else {
        if (data.debugMode) {
            xmlhttp.setRequestHeader('Debug-Mode', data.debugMode);
        }
    }

    xmlhttp.send(JSON.stringify(eventData));
    return xmlhttp;
};

/** @function
 * @lends PetRequest.prototype
 * @name sendXMLHTTP
 * @description It is used to send data to tracking system
 */
PetRequest.prototype.checkNetworkAvailable = function () {
    var offline = new PetOffline(this.sdkParams);
    offline.isNetworkAvailable();
};



/**
 * @module PETracker/helpers/storage
 * @name PetStorage
 * @description It is the wrapper of Local Storage operations
 */
/**
 * Sdk
 * @class PetStorage
 */
function PetStorage() {
    //constructor
}

/** @function
 * @lends PetStorage.prototype
 * @name set
 * @description It stores the data into local storage
 * @param {String} Key
 * @param {String} Value
 */
PetStorage.prototype.set = function (key, value) {
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
};

/** @function
 * @lends PetStorage.prototype
 * @name get
 * @description It get the data from local storage
 * @param {String} Key
 * @returns {Object} data
 */
PetStorage.prototype.get = function (key) {
    var data = localStorage.getItem(key);
    return JSON.parse(data);
};

/** @function
 * @lends PetStorage.prototype
 * @name delete
 * @description It removes the data from local storage
 * @param {String} Key
 */
PetStorage.prototype.delete = function (key) {
    return localStorage.removeItem(key);
};

/**
 * @module PETracker/helpers/utils
 * @name utils
 * @description It have helper functions to manipulate and format the input
 */
/**
 * PetUtils
 * @class PetUtils
 * @requires module:PETracker/helpers/params
 */
function PetUtilsHelper() {
    /**
     * @member ParamsHelper
     */
    this.paramsHelper = new PetParamsHelper();
}

/** @function
 * @lends PetUtils.prototype
 * @name merge
 * @description It is used to merge two objects
 * @param {Object} object1
 * @param {Object} object2
 * @returns {Object}
 */
PetUtilsHelper.prototype.merge = function (object1, object2) {
    if (arguments.length === 2 && (typeof object1 === 'object') && (typeof object2 === 'object')) {
        for (var attribute in object2) {
            object1[attribute] = object2[attribute];
        }

        return object1;
    } else {
        return object1;
    }
};

/** @function
 * @lends PetUtils.prototype
 * @name getUuid
 * @description It is used to generate the UUID for Tracker SDK
 * @returns {String} UUID
 */
PetUtilsHelper.prototype.getUuid = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

/** @function
 * @lends PetUtils.prototype
 * @name getValue
 * @description It is used to detect the value of given parameter
 * @param {String} attribute
 * @returns {String/NULL} value
 */
PetUtilsHelper.prototype.getValue = function (attribute) {
    // custom modules
    var paramHelper = new PetParamsHelper(),

    // parameters
        maximumX,
        maximumY;

    switch (attribute) {
        case 'documentLocation':
            return encodeURIComponent(window.location.href);
        case 'documentHost':
            return window.location.hostname;
        case 'documentPage':
            return window.location.pathname;
        case 'documentTitle':
            return encodeURIComponent(document.title);
        case 'minimumPageXOffset':
            return window.pageXOffset;
        case 'minimumPageYOffset':
            return window.pageYOffset;
        case 'maximumPageXOffset':
            maximumX = window.pageXOffset;
            if (typeof ((document.documentElement).clientWidth)) {
                maximumX = maximumX + (document.documentElement).clientWidth;
            }

            return maximumX;
        case 'maximumPageYOffset':
            maximumY = window.pageYOffset;
            if (typeof ((document.documentElement).clientHeight)) {
                maximumY = maximumY + (document.documentElement).clientHeight;
            }

            return maximumY;
        case 'campaignID':
            return this.paramsHelper.getUtmParam('utm_campaign');
        case 'campaignMedium':
            return this.paramsHelper.getUtmParam('utm_medium');
        case 'campaignSource':
            return this.paramsHelper.getUtmParam('utm_source');
        case 'campaignTerm':
            return this.paramsHelper.getUtmParam('utm_term');
        case 'campaignContent':
            return this.paramsHelper.getUtmParam('utm_content');
        case 'timestamp':
            return (new Date()).toISOString();
        case 'url':
            return document.location.href;
        case 'useragent':
            return paramHelper.getUserAgent();
        case 'documentReferrer':
            return document.referrer;
        default:
            return '';
    }
};

/** @function
 * @lends PetUtils.prototype
 * @name clone
 * @description Returns the clone to input
 * @param {Object} value
 * @returns {Object} value
 */
PetUtilsHelper.prototype.clone = function (value) {
    return JSON.parse(JSON.stringify(value));
};

/** @function
 * @lends PetUtils.prototype
 * @name getInput
 * @description It used to split the inputs into parameter's values and callback
 * @param {Array} Input from app
 * @param {Array} parametersIndex
 * @param {Boolean} hasAdditionalParameters
 * @returns {Object} result
 */
PetUtilsHelper.prototype.getInput = function () {
    // variables
    var result = {},
        input = {},
        additionalParams = {},
        callback,
        paramsIndex = arguments[1],
        hasAdditionalParams = arguments[2],
        i,
        inputArg;

    //Getting user's inputs
    if (typeof arguments[0] !== 'undefined' && arguments[0].length) {
        inputArg = arguments[0];
        if (typeof inputArg[0] !== 'function') {
            for (i = 0; i < inputArg.length; i++) {
                if (typeof inputArg[i] !== 'function' && (typeof inputArg[i] === 'string' || typeof inputArg[i] === 'number' || Array.isArray(inputArg[i]) || !hasAdditionalParams)) {
                    input[paramsIndex[i]] = inputArg[i];
                }

                if (typeof inputArg[i] === 'function') {
                    callback = inputArg[i];
                }

                if (inputArg[i] && hasAdditionalParams && (!!inputArg[i] && inputArg[i].constructor === Object)) {
                    additionalParams = inputArg[i];
                }
            }
        } else if (typeof inputArg[0] === 'function') {
            callback = input[0];
        }
    }

    result = {
        input: input,
        additionalParams: additionalParams,
        callback: callback
    };
    return result;
};

/** @function
 * @lends PetUtils.prototype
 * @name getDefaultValues
 * @description It process the inputs, stores the default value and return the result
 * @param {Object} input
 * @returns {Object} input
 */
PetUtilsHelper.prototype.getDefaultValues = function (input) {
    for (var attribute in input) {
        if (input[attribute] === null || input[attribute] === '') {
            input[attribute] = this.getValue(attribute);
        }

    }

    return input;
};

/** @function
 * @lends PetUtils.prototype
 * @name removeNullParameters
 * @description This method removes the null values from data and return result
 * @param {Object} data
 * @returns {Object} data
 */
PetUtilsHelper.prototype.removeNullParameters = function (data) {
    // property to be removed  if it exits in object
    var list = ['autotracking'],
        attribute;

    if (typeof data === 'object') {
        for (attribute in data) {
            try {
                if (data[attribute] === null || data[attribute] === undefined || data[attribute] === '') {
                    delete data[attribute];
                } else if (typeof data[attribute] === 'object' && Object.keys(data[attribute]).length === 0) {
                    delete data[attribute];
                }

                if (list.indexOf(attribute) !== -1) {
                    delete data[attribute];
                }
            }

            catch (e) {
                //console.log(e);
            }
        }

        return data;
    } else {
        return data;
    }
};

/** @function
 * @lends PetUtils.prototype
 * @name group
 * @description It groups the tracking data
 * @param {Object} data
 * @returns {Object} data
 */
PetUtilsHelper.prototype.group = function (data) {
    // params
    var generalParams = new PetGeneralParams().params,
        userParams = new PetUserParams().params,

    // local variables
        user = {},
        context = {},
        blockList = ['timestamp'],
        userIndex = Object.keys(userParams),
        generalIndex = Object.keys(generalParams),
        i;

    for (i = 0; i < userIndex.length; i++) {
        if (blockList.indexOf(userIndex[i]) === (-1)) {
            if (typeof data[userIndex[i]] !== 'undefined') {
                user[userIndex[i]] = data[userIndex[i]];
                delete data[userIndex[i]];
            }
        }
    }

    for (i = 0; i < generalIndex.length; i++) {
        if (blockList.indexOf(generalIndex[i]) === (-1)) {
            if (typeof data[generalIndex[i]] !== 'undefined') {
                context[generalIndex[i]] = data[generalIndex[i]];
                delete data[generalIndex[i]];
            }
        }
    }

    data.context = context;
    data.user = user;
    return data;
};

/** @function
 * @lends PetUtils.prototype
 * @name getErrorMessages
 * @description This method process the error messages and return the result
 * @param {Object} data
 * @returns {Object} data
 */
PetUtilsHelper.prototype.getErrorMessages = function (data) {
    // local variables
    var resultData = [];

    if (data) {
        data.forEach(function (el, i) {
            resultData.push((el.dataPath).substr(1) + ': ' + el.message);
        });
    }

    return resultData;
};

/** @function
 * @lends PetUtils.prototype
 * @name getFormClassess
 * @description It converts string to array
 * @param {String / Object} data
 * @returns {Array} data
 */
PetUtilsHelper.prototype.getFormClassess = function (data) {
    // local variables
    var classes = arguments[0];

    if (typeof classes === 'string') {
        return classes.split(' ');
    } else if (typeof classes === 'object') {
        return classes;
    } else {
        return [];
    }
};

/**
 * @module PETracker/user/params
 * @name UserParams
 * @description It have the user's parameters list
 */
/**
 * PetUserParams
 * @class PetUserParams
 * @constructs User params
 */
function PetUserParams() {
    /**
     * @member {object}
     */
    this.params = {
        // application user id
        userID: 'anonymous',

        // SSO ID
        userSsoID: '',

        // User ID in that SSO
        userSsoOrigin: '',

        // User's session ID
        internalSessionID: '',

        // User's Language
        userLanguage: '',

        // User's country
        userNationality: '',

        // User's Gender,
        userGender: '',

        // User's firstname
        userFirstName: '',

        // User's lastname
        userLastName: ''
    };
}

/**
 * @module PETracker/user/schema
 * @name UserSchema
 * @description It have the JSON schema for validating the User parameters
 */
/**
 * UserSchema
 * @class PetUserSchema
 * @constucts {Object} schema
 * @description JSON Schema for validating the user data
 */

function PetUserSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'User Parameter Schema',
        id: '/user',
        type: 'object',
        properties: {
            userID: {
                type: ['string', 'number']
            },
            userSsoID: {
                type: ['string', 'number']
            },
            userSsoOrigin: {
                type: 'string'
            },
            internalSessionUD: {
                type: 'string'
            },
            userLanguage: {
                type: 'string'
            },
            userNationality: {
                type: 'string'
            },
            userGender: {
                type: 'string'
            },
            userFirstName: {
                type: 'string'
            },
            userLastName: {
                type: 'string'
            }
        },
        required: ['userID']
    };
}

/**
 * @module PETracker/events/sendMessage
 * @name sendEvent
 * @description It is a generic event to send tracking data
 */
var autobahUrls = {
    messaging: "/collect",
    schema: "/schemas",
    collection: "/collection"
};

/**
 * Sdk
 * @class PetMessage
 * @constructs PetMessage configurations and eventParameters
 */
function PetMessage(sdkParams) {

    this.eventParams = {
        isSendMessage: true,
        interactionType: 'event',
        sdkParams: sdkParams
    };
};

function catchSchemaError(data, sdkParams){
    if(sdkParams.debugMode){
        console.error("Payload has not been sent due to schema valaidation error.",data.error);
    }
    else{
        var ajaxRequest = new PetRequest(sdkParams);
        var url = autobahUrls.collection+"/"+sdkParams.trackingID;
        ajaxRequest.send(url, data, {offlineEnabled: false, environment: sdkParams.environment},false);
    }
};


function autofillParameters(data, schema, sdkParams){
    if(schema.properties){
        for(var key in schema.properties){
            if(sdkParams[key]){
                data[key] = data[key] || sdkParams[key];
            }
        }
        if(Object.keys(schema.properties).indexOf("messageTypeCode") == -1){
            delete data.messageTypeCode;
        }
    }
    return data;
};

function autobahnSchemaCookieValidator(event){
     var cookieFilter = document.cookie.split(';').filter(function(value){
        return value.indexOf(event.namespace+'|'+event.messageTypeCode+'|'+ ((event.messageVersion) ? event.messageVersion : 'latest')) > -1
    });

    if(cookieFilter.length > 0){
        return JSON.parse(cookieFilter[0].split('=')[1]);
    }
    return false;
};

function autobahnValidator(eventParams, event, callback){

    if(event.namespace && event.messageTypeCode){

        if(!eventParams.schemaValidation && !eventParams.autofill && event.messageVersion.toLowerCase() != "latest"){
            if(typeof callback == "function"){
                callback(null, event);
                return;
            }
        }

        var schemaFoundInCookie = autobahnSchemaCookieValidator(event);

        if(schemaFoundInCookie){

            if(event.messageVersion.toLowerCase() == 'latest'){
                event.messageVersion = schemaFoundInCookie.version;
            }

            if(eventParams.autofill){

                event.payload = autofillParameters(event.payload, schemaFoundInCookie.schema, eventParams);    
            }
            else{
                if(Object.keys(schemaFoundInCookie.schema.properties).indexOf("messageTypeCode") == -1){
                    delete event.payload.messageTypeCode;
                }
            }

            if(eventParams.schemaValidation){

                var schemaValidationResult = tv4.validateMultiple(event.payload, schemaFoundInCookie.schema, true);

                if(!schemaValidationResult.valid){
                    event.error = schemaValidationResult;
                    catchSchemaError(event, eventParams);
                    return false;
                }
                
            }

            if(typeof callback == "function"){
                callback(null, event);
            }
            return;
        }
        var urlFormatter = autobahUrls.schema + '/';
        urlFormatter += event.namespace + '/' + event.messageTypeCode+'/'+(event.messageVersion ? event.messageVersion : 'latest');
        var ajax = new PetRequest(eventParams);
        ajax.send(urlFormatter, {}, {offlineEnabled: false,environment: eventParams.environment}, function(err, data){
            if(err && err.error != 200){
                if(typeof callback == "function"){
                    callback(err);
                }
            }
            else if(data && data.code == 200 && data.response){

                var messageVersion = event.messageVersion;

                data = data.response;

                if(messageVersion.toLowerCase() == "latest"){
                    event.messageVersion = data.version;
                }

                if(eventParams.autofill){
                    event.payload = autofillParameters(event.payload, data.schemaDefinition, eventParams);
                }
                else{
                    if(Object.keys(data.schemaDefinition.properties).indexOf("messageTypeCode") == -1){
                        delete event.payload.messageTypeCode;
                    }
                }

                
                var schema = data.schemaDefinition, schemaValidationResult = tv4.validateMultiple(event.payload, schema, true);
                var cookie = new PetCookie();
                cookie.create(event.namespace+"|"+event.messageTypeCode+"|"+ (messageVersion ? messageVersion : 'latest'),'', (eventParams.cookieExpiryTime || 180) * 60 * 1000, {schema:schema, version:data.version}); 
                if(!schemaValidationResult.valid && eventParams.schemaValidation){
                    event.error = schemaValidationResult;
                    catchSchemaError(event, eventParams);
                    return false;
                }
                
                if(typeof callback == "function"){
                    callback(null, event);
                }
            }
            
            
        },"GET");
    }
    else{
        callback({err:"Required Parameter missing Namespace or MessageTypeCode missing."});
    }
};

/** @function
 * @lends PetMessage.prototype
 * @name track
 * @description It is a generic method to track all events
 * @param {Array} Input data from app
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 */
PetMessage.prototype.track = function () {
    // Dependencies
    var dataClone = arguments[1],
        eventUrl = arguments[0],
        options = arguments[2],
        user_callback = arguments[3],
        self = this;
    
    var format_payload = {
        "messageTypeCode": (dataClone && dataClone["messageTypeCode"]),
        "messageVersion": (options && options["messageVersion"])  || this.eventParams.sdkParams["messageVersion"] || "latest",
        "actionType":"create",
        "namespace": (options && options["namespace"])  || this.eventParams.sdkParams["namespace"],
        "payload": dataClone || {}
    }, 
    
    eventData = {
        originatingSystemCode: (options && options["originatingSystemCode"]) || this.eventParams.sdkParams["originatingSystemCode"],
    };

    eventData[eventUrl] = [format_payload];

    if(!format_payload.messageTypeCode){
        console.error("Message Typecode is a required property.");
        return false;
    }

    // if(format_payload && format_payload.payload && format_payload.payload.messageTypeCode){

    //     delete format_payload.payload.messageTypeCode;
    // }
    
    var self = this;
        
    autobahnValidator(this.eventParams.sdkParams,format_payload, function(err, validatedData){
            if(err){
                console.error(err);
            }
            else{
                var ajax = new PetRequest(self.eventParams.sdkParams)
                ,url = autobahUrls.messaging+'/'+eventUrl
                ,data = eventData;
                ajax.send(url, data,{offlineEnabled: self.eventParams.sdkParams.offlineEnabled,environment: self.eventParams.sdkParams.environment, eventType:eventUrl}, user_callback);
            }
    });

   
};

/**
 * @module PETracker/events/message/schema
 * @name MessageSchema
 * @description JSON Schema validating the Message parameters
 */
/**
 * MessagesSchema
 * @class PetMessagesSchema
 * @constucts {Object} schema
 * @description message event Schema
 */

function PetMessageSchema(verb) {
    /**
     * @member {object}
     */
    var index,
        requiredList;
    this.schema = {
        title: 'Send Message Event Parameter Schema',
        id: '/sendMessageSchema',
        type: 'object',
        properties: {
            messageTypeCode: {
                type: 'string'
            },
            originatingSystemCode: {
                type: 'string'
            },
            messageVersion: {
                type: 'string'
            },
            environmentCode: {
                type: 'string'
            },
            transactionDt: {
                type: 'string'
            },
            messageId: {
                type: 'string'
            },
            gaCategory: {
                type: 'string'
            },
            gaAction: {
                type: 'string'
            },
            gaLabel: {
                type: 'string'
            },
            gaValue:{
                type: 'number'
            }
        },
        required: ['messageTypeCode', 'originatingSystemCode', 'messageVersion', 'environmentCode', 'transactionDt', 'messageId']
    };

    switch (verb.toLocaleLowerCase()) {
        case 'loginattempt':
            this.schema.properties = new PetUtilsHelper().merge(this.schema.properties, PetLoginMessageSchema().properties);
            requiredList = PetLoginMessageSchema().required;
            for (index = 0; index < requiredList.length; index++)
                this.schema.required.push(requiredList[index]);
            break;
        default:
            throw new Error('Invalid messageTypeCode');
    }
}

/**
 * @module PETracker/init
 * @name init
 * @description It is used to initialize the Tracker SDK Object in Application
 */
// @member {Object} petWindowObj
var petWindowObj = window;

// Check the PETracker is initialized or not
if (!petWindowObj._petracker) {
    petWindowObj._petracker = 'PETracker';

    // exporting the PETracker Object
    petWindowObj.PETracker = new PetSdk();
}

/**
 * @module PETracker/sdk
 * @name sdk
 * @description It is used to init the Tracker object via PETracker Object
 */
/**
 * Sdk
 * @class PetSdk
 * @constructs PETracker.CONSTANTS
 */
function PetSdk() {
    /**
     * @member {Object} constants
     * @member {Object} utilHelper
     */
    var constants,
        utilHelper;

    constants = new PetAppConstants().get();
    utilHelper = new PetUtilsHelper();

    // Merging the constants into PETracker
    utilHelper.merge(this, constants);

    // Adding URL Format for Schema Validation
    tv4.addFormat('url', function (data, schema) {
        var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        if (regexp.test(data)) {
            return null;
        } else {
            return 'Invalid URL Specificied Here.';
        }
    });
}

/** @function
 * @lends petSdk.prototype
 * @name init
 * @description It is used to verify the app credentials and initialize the tracker events
 * @param {String} appID - Tracking Id of the application
 * @param {Object} config - Customized Tracking configurations
 * @returns {Object} trackerObject
 */
PetSdk.prototype.init = function () {
    // helper modules
    var utilHelper = new PetUtilsHelper(),
        cookieHelper = new PetCookie(),
        callback = arguments[2],
    // local variables
        appData = {
                    trackingID: null
                },
        appSchema = new PetAppSchema().schema,
        appParams = new PetAppParams().params,
        sdkParams = {},
        sdkErrors = {},
        schemaResult = {},
        tracker;
    
    if(typeof arguments[0] != "string")
    {
        console.error("App Id must be a valid string type..");
        return;
    }

    // processing inputs
    if (arguments.length) {
        switch (arguments.length) {
            case 1:
                appData.trackingID = arguments[0];
                break;

            default:
                appData.trackingID = arguments[0];
                appData = utilHelper.merge(appData, arguments[1]);
                break;
        }
    } else {
        console.warn('Please provide credentials for accessing SDK.');
    }

   
    // schema validation
    schemaResult = tv4.validateMultiple(appData, appSchema, true);
    
    if (!schemaResult.valid) {
        if (appData.debugMode) {
            console.error((utilHelper.getErrorMessages(schemaResult.errors)).join(','));
            return;
        } else {
            sdkErrors.init = utilHelper.getErrorMessages(schemaResult.errors);
        }
    }

    // merge app params with sdkparameters
    sdkParams = utilHelper.merge(appParams, appData);

    // create cookie for SDK Tracker
    //cookieHelper.create('__PET', sdkParams.cookiePrefix, sdkParams.cookieDomainName);
    // initialize the tracker object

    //this.tracker = {};
    var self = this;
    //tracker.enableAutoTracking(sdkParams.autotracking);
    //console.log(sdkParams);
    window.trackingID  = arguments[0];
    return utilHelper.merge(self, new PetTracker(sdkParams, sdkErrors));
};

/**
 * @module PETracker/tracker
 * @name tracker
 * @description It is used to trigger the tracking events in Tracker SDK
 */
/**
 * Sdk
 * @class PetTracker
 * @constructs PETracker.sdkParams, PETracker.sdkErrors
 */
function PetTracker() {
    // parameter
    var generalParams = new PetGeneralParams().params,
        userParams = new PetUserParams().params,

    // custom modules
        utilHelper = new PetUtilsHelper();

    // Tracker Properties
    this.sdkParams = arguments[0];
    this.sdkErrors = arguments[1];

    // merging general and user paramters into sdk parameters
    this.sdkParams = utilHelper.merge(this.sdkParams, utilHelper.merge(generalParams, userParams));
}

/** @function
 * @lends PETracker.prototype
 * @name setProperty
 * @description It is used to set the value to a Tracker parameters
 * @param {String} parameterName
 * @param {String} parameterValue
 */
PetTracker.prototype.setProperty = function () {
    var paramName,
        paramValue,
        blocklist = ['clientID', 'trackingID'];

    if (arguments[0] && (typeof arguments[1] !== 'undefined')) {
        paramName = arguments[0];
        paramValue = arguments[1];

        // check the parameter name in the block list
        if (blocklist.indexOf(paramName) > -1) {
            console.warn('Cannot set the mandatory parameter: ' + paramName);
        } else if (paramName.indexOf('cd') === 0 || paramName.indexOf('cm') === 0) {

            // custom dimention and custom metrix check
            if (parseInt(paramName.substr(2)) <= 200 && parseInt(paramName.substr(2)) >= 1) {

                // Setting value
                this.sdkParams[paramName] = {
                    value: paramValue
                };

                // storing oldf data
                if (arguments[2]) {
                    this.sdkParams[paramName].paramName = arguments[2];
                }
            } else {
                console.warn('Please provide valid arguments.');
            }
        } else {
            this.sdkParams[paramName] = paramValue;
        }
    } else {
        console.warn('Provide valid arguments.');
    }
};

/** @function
 * @lends PETracker.prototype
 * @name getProperty
 * @description Returns the value of Tracker SDK Parameters
 * @param {String} parameterName
 * @returns {String/Undefined} parameterValue
 */
PetTracker.prototype.getProperty = function () {
    return this.sdkParams[arguments[0]];
};

/** @function
 * @lends PETracker.prototype
 * @name unsetProperty
 * @description It is used to reset or unset the value of Tracker SDK parameter
 * @param {String} parameterName
 */
PetTracker.prototype.unsetProperty = function () {
    // local variables
    var paramName,

    // parameters list
        appParams = new PetAppParams().params,
        generalParams = new PetGeneralParams().params,

    // custom variables
        utilHelper = new PetUtilsHelper();

    // Check the parameter value
    if (arguments[0]) {
        paramName = arguments[0];
        if (this.sdkParams[paramName]) {
            if (paramName === 'userID') {
                this.sdkParams[paramName] = 'anonymous';
            } else if (paramName === 'environment') {
                this.sdkParams[paramName] = 'production';
            } else if (paramName in appParams) {
                console.warn('Cannot unset the mandatory parameters.');
            } else if (paramName in generalParams) {
                this.sdkParams[paramName] = generalParams[paramName];
            } else {
                delete this.sdkParams[paramName];
            }
        } else {
            console.warn('Given key is not a valid parameter.');
        }
    } else {
        console.error('Parameter cannot be null.');
    }
};

/** @function
 * @lends PETracker.prototype
 * @name getVersion
 * @description Returns Tracker SDK JS version
 * @returns {String} version
 */
PetTracker.prototype.getVersion = function () {
    return this.sdkParams.jsVersion;
};

/** @function
 * @lends PETracker.prototype
 * @name sendPageview
 * @description It is used to trigger pageview event in Tracker SDK
 * @param {String} documentLocation
 * @param {String} documentHost
 * @param {String} documentPage
 * @param {String} documentTitle
 * @param {Object} additionalParams
 * @param {Function} callback
 */
// PetTracker.prototype.sendPageview = function () {
//     /*
//      * @member {Object}
//      */
//     var sdkEvent = new PetPageview();

//     sdkEvent.track(arguments, this.sdkParams, this.sdkErrors);
// };

/** @function
 * @lends PETracker.prototype
 * @name sendEvent
 * @description It is a generic method to send tracking data
 * @param {Object} Message Format
 */
PetTracker.prototype.sendEvent = function () {
    /*
     * @member {Object}
     */
    var sdkEvent = new PetMessage(this.sdkParams);
    sdkEvent.track('events',arguments[0], arguments[1], arguments[2]);
};


/** @function
 * @lends PETracker.prototype
 * @name sendActivity
 * @description It is a generic method to send tracking data
 * @param {Object} Message Format
 */
PetTracker.prototype.sendActivity = function () {
    /*
     * @member {Object}
     */
    var sdkEvent = new PetMessage(this.sdkParams);
    sdkEvent.track('activities',arguments[0], arguments[1], arguments[2]);
};

/** @function
 * @lends PETracker.prototype
 * @name getValueFromCookie
 * @description Returns the value from cookie
 * @param {String} cookieName
 * @param {String} indexName
 * @returns {String} value
 */
PetTracker.prototype.getValueFromCookie = function () {
    var cookieHelper = new PetCookie(),
        cookieData;

    if (arguments.length > 0) {
        // If the cookie have single value
        if (arguments.length === 1) {
            return cookieHelper.get(arguments[0]);
        } else if (arguments.length === 2) {
            try {
                cookieData = cookieHelper.get(arguments[0]);
                cookieData = JSON.parse(cookieData);
                return cookieData[arguments[1]];
            } catch (e) {
                console.error('Incorrect value specified in cookie: ' + arguments[0] + ' , ' + arguments[1]);
                return null;
            }
        } else {
            // Incorrect Arguments
            console.error('Incorrect arguments specified in cookie: ' + arguments);
            return null;
        }
    } else {
        console.error('Please, enter the cookie name');
        return null;
    }
};


})()
})()