/**
 * @module PETracker/events/pageview
 * @name sendPageview
 * @description It is used to send pageview data to Tracking System.
 */
'use strict';

/**
 * Sdk
 * @class PetPageview
 * @constructs Pageview params
 */
function PetPageview() {
    /**
     * @member {Object} params
     */
    this.params = new PetPageviewParams().params;
}

/** @function
 * @lends PetPageview.prototype
 * @name track
 * @description This method collects the data from app, convert that data into specific format and send it to Tracking system
 * @param {Array} Input data from app
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 */
PetPageview.prototype.track = function () {
    // custom modules
    var utilHelper = new PetUtilsHelper(),
        process = new PetProcess(),
        cookieHelper = new PetCookie(),

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
    input = utilHelper.removeNullParameters(result.input);
    additionalParams = result.additionalParams;
    callback = result.callback;

    // schema validation
    schema = new PetPageviewSchema().schema;
    schemaResult = tv4.validateMultiple(input, schema, true);
    if (!schemaResult.valid) {
        if (sdkParams.debugMode) {
            console.error((utilHelper.getErrorMessages(schemaResult.errors)).join(','));
            return;
        } else {
            sdkErrors.pageview = utilHelper.getErrorMessages(schemaResult.errors);
        }
    }

    // Process Event Data
    sdkParams.pageviewIndex = cookieHelper.pageviewIndex(sdkParams.userID);
    process.event(sdkParams, sdkErrors, additionalParams, 'pageview', this.params, input, callback);
};
