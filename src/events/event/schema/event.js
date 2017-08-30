/**
 * @module PETracker/events/event/schema
 * @name EventSchema
 * @description JSON Schema validating the event parameters
 */
'use strict';

/**
 * EventSchema
 * @class PetEventSchema
 * @constructs {Object} schema
 * @description Event Schema
 */

function PetEventSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'Event Parameter Schema',
        id: '/event',
        type: 'object',
        properties: {
            eventCategory: {
                type: 'string'
            },
            eventAction: {
                type: 'string'
            },
            eventLabel: {
                type: 'string'
            },
            eventValue: {
                type: 'integer'
            }
        },
        additionalProperties: true,
        required: ['eventCategory', 'eventAction']
    };
}
