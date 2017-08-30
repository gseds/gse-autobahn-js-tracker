/**
 * @module PETracker/events/click/schema
 * @name LoginSchema
 * @description JSON Schema validating the Login Message parameters
 */
'use strict';

/**
 * LoginSchema
 * @class PetLoginMessageSchema
 * @constructs {Object} schema
 * @description Login message Schema
 */

function PetLoginMessageSchema() {
    /**
     * @member {object}
     */
    var schema = {
        properties: {
                personId: {
                    type: 'string'
                },
                personRoleCode: {
                    type: 'string'
                },
                organizationURI: {
                    type: 'string'
                },
                organizationTypeCode: {
                    type: 'string'
                },
                loginDateTime: {
                    type: 'string'
                },
                loginInitiatedByApplicationId: {
                    type: 'string'
                },
                pageUserNavigatedToUri:{
                    type: 'string'
                },
                loginResultCode: {
                    type: 'string'
                },
                loginMessage: {
                    type: 'string'
                },
                sessionId: {
                    type: 'string'
                }
            },
        required: []
    };
    return schema;
}
