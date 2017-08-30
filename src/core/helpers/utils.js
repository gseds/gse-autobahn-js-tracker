/**
 * @module PETracker/helpers/utils
 * @name utils
 * @description It have helper functions to manipulate and format the input
 */
'use strict';

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
