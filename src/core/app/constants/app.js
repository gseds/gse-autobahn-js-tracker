/**
 * @module PETracker/app/constants
 * @name AppConstants
 * @description It have the list of constants which are used to describe Application configurations
 */
'use strict';

/**
 * PetAppConstants
 * @class PetAppConstants
 */
function PetAppConstants() {
    this.constants = {};
}

/** @function
 * @lends PetAppConstants.prototype
 * @name environments
 * @description It return the environmental constants
 * @returns {Object} environments
 */
PetAppConstants.prototype.environments = function () {
    var constants = {
        DEVELOPMENT: 'development',
        TEST: 'test',
        STAGE: 'stage',
        PRODUCTION: 'production'
    };
    return constants;
};

/** @function
 * @lends PetAppConstants.prototype
 * @name events
 * @description It return the events constants
 * @returns {Object} events
 */
PetAppConstants.prototype.events = function () {
    var constants = {
        CLICK: 'click',
        FORM_SUBMIT: 'formsubmit',
        LINK_CLICK: 'linkclick',
        PAGE_VIEW: 'pageview',
        SITE_SEARCH: 'sitesearch'
    };
    return constants;
};

/** @function
 * @lends PetAppConstants.prototype
 * @name platforms
 * @description It return the platform constants
 * @returns {Object} platforms
 */
PetAppConstants.prototype.platforms = function () {
    var constants = {
        MOBILE: 'mobile',
        WEB: 'web'
    };
    return constants;
};

/** @function
 * @lends PetAppConstants.prototype
 * @name get
 * @description It return all the app constants
 * @returns {Object} constants
 */
PetAppConstants.prototype.get = function () {
    var constants = {
        ENVIRONMENT: this.environments(),
        EVENTS: this.events(),
        PLATFORM: this.platforms()
    };
    return constants;
};
