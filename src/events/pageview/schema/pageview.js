/**
 * @module PETracker/events/pageview/schema
 * @name PageviewSchema
 * @description JSON Schema validating the pageview parameters
 */
'use strict';

/**
 * PageviewSchema
 * @class PetPageviewSchema
 * @constructs {Object} schema
 * @description Pageview Schema
 */

function PetPageviewSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'Pageview Parameter Schema',
        id: '/pageview',
        type: 'object',
        properties: {
            documentLocation: {
                type: 'string',
                format: 'url'
            },
            documentHost: {
                type: 'string'
            },
            documentPage: {
                type: 'string'
            },
            documentTitle: {
                type: 'string'
            }
        },
        required: [],
        additionalProperties: true
    };
}
