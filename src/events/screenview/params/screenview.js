/**
 * @module PETracker/events/screenview/params
 * @name PetSreenviewParams
 * @description It have the list of parameters which are used for screenview event tracking
 */
'use strict';

/**
 * PageviewParams
 * @class PetScreenviewParams
 * @constructs {Object} parameters
 * @description ScreenView event tracking parameters
 */

function PetScreenviewParams() {
    /**
     * @member {object}
     */
    this.params = {
        // screen name :: active screen name
        screenName: null,

        // application name
        appName: null,

        // application id
        appID: null,

        // application version
        appVersion: null,

        // application installer id
        appInstallerID: null
    };
}
