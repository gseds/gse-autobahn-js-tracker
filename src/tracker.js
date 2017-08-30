/**
 * @module PETracker/tracker
 * @name tracker
 * @description It is used to trigger the tracking events in Tracker SDK
 */
'use strict';

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

