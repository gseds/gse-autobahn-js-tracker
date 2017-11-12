/**
 * @module PETracker/app/params
 * @name AppParams
 * @description It have the list of parameters which are used for Initialization
 */
'use strict';

/**
 * AppParams
 * @class PetAppParams
 * @constucts {Object} parameters
 * @description Tracker Initialization parameters
 */

function PetAppParams() {
    /**
     * @member {object}
     */
    this.params = {
        //schemaValidation
        schemaValidation: true,

        //autofill
        autofill: true,

        //debugMode
        debugMode: true,

        originatingSystemCode: 'AutobahnTrackerSDK',

        //cookie rotatory time
        cookieRotatoryTime: 'AUTOBAHN_COOKIE_EXPIRY',

        //cookie expiry time
        cookieExpiryTime: 'AUTOBAHN_COOKIE_ROTATORY',

        // Tracking SDK Version
        sdkVersion: 'SDK_APP_VERSION',

        // Current Tracker JS Version
        jsVersion: 'SDK_CURRENT_VERSION',

        // Application Platform
        appPlatform: 'web',

        // Application URL
        url: null,

        // Application Environment
        environment: 'production',

        // offline Support
        offlineSupport: false,

        // Cookie Domain Name
        cookieDomainName: 'autobahn',

        // Cookie Prefix
        cookiePrefix: 'gse',

        // Interaction Type | Tracking Event Type
        interactionType: null,

        // synchMode
        synchMode: false
    };
}
