/**
 * @module PETracker/sdk
 * @name sdk
 * @description It is used to init the Tracker object via PETracker Object
 */
'use strict';

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
        tracker,
        self = this;

    if (typeof arguments[0] !== 'string') {
        console.error('App Id must be a valid string type..');
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
    } else
        console.warn('Please provide credentials for accessing SDK.');

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
    window.trackingID = arguments[0];
    return utilHelper.merge(self, new PetTracker(sdkParams, sdkErrors));
};
