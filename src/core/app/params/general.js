/**
 * @module PETracker/app/params/general
 * @name GeneralParams
 * @description It have the list of parameters which are used for getting client's contextual information
 */
'use strict';

/**
 * GeneralParams
 * @class PetGeneralParams
 * @constucts {Object} parameters
 * @description Client's contextual parameters
 */
function PetGeneralParams() {
    // custom modules
    var paramHelper = new PetParamsHelper();

    /**
     * @member {object}
     */
    this.params = {
        // Client contextual information
        // Screen color Depth
        screenDepth: paramHelper.getScreenDepth(),

        // View Port
        viewPort: paramHelper.getViewPort(),

        // Screen Resolution
        screenResolution: paramHelper.getScreenResolution(),

        // Document Encoding type
        documentEncoding: paramHelper.getDocumentEncode(),

        // Timezone
        timezone: paramHelper.getTimezone(),

        // User Agent
        useragent: paramHelper.getUserAgent(),

        // Cookie Enabled
        isCookieEnabled: paramHelper.isCookieEnabled(),

        // Document Size
        documentSize: paramHelper.getDocumentSize(),

        // Java Enabled
        isJavaEnabled: paramHelper.isJavaEnabled(),

        // Flash player version
        flashPlayerVersion: paramHelper.getFlashVersion(),

        // Pdf Plugin Status
        pdfPluginStatus: null,

        // Quick Time Plugin status
        qtPluginStatus: null,

        // Realplayer Plugin status
        realpPluginStatus: null,

        // Windows Media Player Plugin status
        wmaPluginStatus: null,

        // Director Plugin status
        directorPluginStatus: null,

        // Google gears plugin status
        googlegearPluginStatus: null,

        // IP Addres
        userIP: null,

        // Longitude and Latitude
        latitudeLogitude: null,

        // Browser Language
        browserLanguage: paramHelper.getBrowserLanguage(),

        // Document Referrer
        documentReferrer: null,

        // Dynamic parameters (This will be computed when the request is send)
        // Current Timestamp
        timestamp: null,

        // Campaign Source
        campaignSource: null,

        // Campaign Medium
        campaignMedium: null,

        // Campaign ID
        campaignID: null,

        // Campaign Terms
        campaignTerm: null,

        // Campaign Contents
        campaignContent: null
    };
}
