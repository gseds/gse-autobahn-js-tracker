/**
 * @module PETracker/events/click
 * @name sendClickEvent
 * @description It is used to send event data to Tracking System.
 */
'use strict';

/**
 * Sdk
 * @class PetEvent
 * @constructs Event params
 */
function PetEvent() {
    /**
     * @member {Object} params
     */
    this.params = new PetEventParams().params;
}

/** @function
 * @lends PetEvent.prototype
 * @name track
 * @description This method collects the data from app, convert that data into specific format and send it to Tracking system
 * @param {Array} Input data from app
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 */
PetEvent.prototype.track = function () {
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

    // schema validation
    schema = new PetEventSchema().schema;
    schemaResult = tv4.validateMultiple(input, schema, true);
    if (!schemaResult.valid) {
        if (sdkParams.debugMode) {
            console.error((utilHelper.getErrorMessages(schemaResult.errors)).join(','));
            return;
        } else {
            sdkErrors.event = utilHelper.getErrorMessages(schemaResult.errors);
        }
    }

    // Process Event Data
    process.event(sdkParams, sdkErrors, additionalParams, 'event', this.params, input, callback);
};
