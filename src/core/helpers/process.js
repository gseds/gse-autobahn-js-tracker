/**
 * @module PETracker/helpers/process
 * @name process
 * @description It is used to process the event parameters and send it to tracking system
 */
'use strict';

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
