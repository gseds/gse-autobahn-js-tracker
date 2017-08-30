/**
 * @module PETracker/events/pageview/handler
 * @name autotracking:pageview
 * @description It is used to detect and track the pageview event
 */
'use strict';

/**
 * Sdk
 * @class PetPageviewHandler
 */
function PetPageviewHandler() {
    // constructor code here
}

/** @function
 * @lends PetPageviewHandler.prototype
 * @name track
 * @description It detects and track the page view event
 */
PetPageviewHandler.prototype.track = function () {
    // variables
    var oldLocation = location.href,
        sdk = arguments[0];

    if (typeof angular !== 'undefined') {
        setInterval(function () {
            if (oldLocation !== location.href) {
                sdk.sendPageview();
                oldLocation = location.href;
            }
        }, 1000); // checks every 1 second url changes
    } else if (typeof window.onhashchange !== 'undefined') {
        // enable hanlder
        window.onhashchange = function () {
            sdk.sendPageview();
        };
    }
};
