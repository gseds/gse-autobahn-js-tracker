/**
 * @module PETracker/events/screenview
 * @name sendScreenview
 * @description It is used to send screenview event data to Tracking System.
 */
'use strict';

/**
 * Sdk
 * @class PetScreenview
 * @constructs Screen View event params
 */
function PetScreenview() {
    /**
     * @member {Object} params
     */
    this.params = new PetScreenviewParams().params;
}

/** @function
 * @lends PetScreenview.prototype
 * @name track
 * @description This method collects the data from app, convert that data into specific format and send it to Tracking system
 * @param {Array} Input data from app
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 */
PetScreenview.prototype.track = function () {
    // custom modules
    var utilHelper = new PetUtilsHelper(),
        process = new PetProcess(),

    // variables
        input = {},
        additionalParams,
        callback,
        result,
        schema,
        schemaResult,
        paramsIndex = Object.keys(this.params),
        hasAdditionalParams = true,
        sdkParams,
        sdkErrors;

    // getting sdk params and errors
    sdkParams = utilHelper.clone(arguments[1]);
    sdkErrors = utilHelper.clone(arguments[2]);

    // formatting the inputs with parameters
    result = utilHelper.getInput(arguments[0], paramsIndex, hasAdditionalParams);
    input = result.input;
    additionalParams = result.additionalParams;
    callback = result.callback;

    if (Object.keys(input).length === 1) {
        if (typeof sdkParams.appName !== 'undefined') {
            input.appName = sdkParams.appName;
        }
    }

    // schema validation
    schema = new PetScreenviewSchema().schema;
    schemaResult = tv4.validateMultiple(input, schema, true);
    if (!schemaResult.valid) {
        if (sdkParams.debugMode) {
            console.error((utilHelper.getErrorMessages(schemaResult.errors)).join(','));
            return;
        } else {
            sdkErrors.screenview = utilHelper.getErrorMessages(schemaResult.errors);
        }
    }

    // Process Event Data
    process.event(sdkParams, sdkErrors, additionalParams, 'screenview', this.params, input, callback);
};
