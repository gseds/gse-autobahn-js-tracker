/**
 * @module PETracker/events/pageview/params
 * @name PageviewParams
 * @description It have the list of parameters which are used for Pageview tracking
 */
'use strict';

/**
 * PageviewParams
 * @class PetPageviewParams
 * @constructs {Object} parameters
 * @description Pageview tracking parameters
 */

function PetPageviewParams() {
    /**
     * @member {object}
     */
    this.params = {
        // Document Location ex: http://www.example.com/home
        documentLocation: null,

        // Document Hostname ex: www.example.com
        documentHost: null,

        // Document page ex: /home
        documentPage: null,

        // Document Title.
        documentTitle: null
    };
}
