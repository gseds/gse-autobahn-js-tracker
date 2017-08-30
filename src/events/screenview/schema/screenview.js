/**
 * @module PETracker/events/screenview/schema
 * @name ScreenviewSchema
 * @description JSON Schema validating the screen view event parameters
 */
'use strict';

/**
 * ScreenviewSchema
 * @class PetScreenviewSchema
 * @constructs {Object} schema
 * @description Screen view event Schema
 */

function PetScreenviewSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'Screen View Event Parameter Schema',
        id: '/screenview',
        type: 'object',
        properties: {
            screenName: {
                type: 'string'
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
        additionalProperties: true,
        required: ['appName', 'screenName']
    };
}
