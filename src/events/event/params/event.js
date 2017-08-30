/**
 * @module PETracker/events/event/params
 * @name PetEventParams
 * @description It have the list of parameters which are used for event tracking
 */
'use strict';

/**
 * Event Params
 * @class PetEventParams
 * @constructs {Object} parameters
 * @description Event tracking parameters
 */

function PetEventParams() {
    /**
     * @member {object}
     */
    this.params = {
        // category of event
        eventCategory: null,

        // action of event: click, mouse move, scroll
        eventAction: null,

        // label of the DOM element
        eventLabel: null,

        // value for the event
        eventValue: null
    };
}
