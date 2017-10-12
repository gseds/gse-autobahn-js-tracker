/**
 * @module PETracker/helpers/request
 * @name request
 * @description It is used to send the data to Tracking System
 * @description Prerequsites: Offline-tracking/interval-based processing.
 * @description if user manually sets time interval to process data, it should be greater than or equal to 15 seconds (15000 in ms) else default value will take precedence (60000 in ms)
 */
'use strict';

/**
 * @member {String/Number} time-based/offline tracking.
 */
var petIntervalId = null;

/**
 * PetCookie
 * @class PetRequest
 */
function PetRequest(sdkParams) {
    /**
     * @member {Object} tracking system receiver api URLs
     */
    this.receiver = {
        development: 'DEVELOPMENT_RECEIVER_URL',
        test: 'TEST_RECEIVER_URL',
        stage: 'STAGE_RECEIVER_URL',
        production: 'PRODUCTION_RECEIVER_URL',
        defaultUrl: 'DEFAULT_RECEIVER_URL'
    };

    this.sdkParams = sdkParams;
}

/** @function
 * @lends PetRequest.prototype
 * @name send
 * @description It is used to create a tracking cookie
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 * @param {Function} callback
 */
PetRequest.prototype.send = function () {
    // custom modules
    var cookieHelper = new PetCookie(),
        userSchema = new PetUserSchema().schema,
        utilsHelper = new PetUtilsHelper(),

    // arguments
        data = utilsHelper.clone(arguments[1]), // Getting parameter list
        errors = null, // Getting errors occurred in SDK
        callback = arguments[3], // Getting user's callback
        method = arguments[4], // Getting method for the Request
        options = arguments[2],

    // local variables
        result,
        xmlhttp,
        receiverUrl,
        cookieName = 'SDK_COOKIE_NAME',
        cookieValue = cookieHelper.get(cookieName),
        offineEnabled = options && options.offlineEnabled,
        localStorageAvailable = false,
        offline,
        intervalToProcess;

    // marge cookie value with tracker data
    if (cookieValue) {
       // data = utilsHelper.merge(data, JSON.parse(cookieValue));
    } else {
        // Check whether Internal Session ID is present in every request
        // // If not, create cookie and retrieve session ID
        // cookieHelper.create(cookieName, arguments[0].cookiePrefix, arguments[0].cookieDomainName);
        // cookieValue = cookieHelper.get(cookieName);

        // if (cookieValue) {
        //     data = utilsHelper.merge(data, JSON.parse(cookieValue));
        // }
    }

    // if (!flag) {
    //     result = tv4.validateMultiple(data, userSchema, true);
    //     if (!result.valid) {
    //         if (data.debugMode) {
    //             console.error((utilsHelper.getErrorMessages(result.errors)).join(','));
    //             return;
    //         } else {
    //             errors.user = utilHelper.getErrorMessages(result.errors);
    //         }
    //     }
    // }

    if (typeof this.receiver[options.environment] !== 'undefined') {
        receiverUrl = this.receiver[options.environment];
    } else {
        receiverUrl = this.receiver.defaultUrl;
    }

    if (typeof (Storage) === 'undefined') {
        console.log('PETracker: no local storage found.');
    } else {
        localStorageAvailable = true;
        if(offineEnabled){
            offline = new PetOffline(this.sdkParams);
        }
    }


    // if ((localStorageAvailable) && (typeof data.offlineSupport !== 'undefined') && (data.offlineSupport)) {
    //     offineEnabled = true;
    // }

    // Tracking Data formation
    result = {
        data: utilsHelper.removeNullParameters(utilsHelper.getDefaultValues(data))
    };

    // grouping with context
    // result.data = utilsHelper.group(result.data);

    // checking sdk schema errors
    // if (Object.keys(errors).length) {
    //     result.errors = errors;
    // }
    // if LS available, enable interval-based data processing

     if (offineEnabled && localStorageAvailable) {
         offline.save(result, options.eventType);

         intervalToProcess = TRACKING_TIME_INTERVAL;
         if ((typeof data.intervalToProcess !== 'undefined') && (data.intervalToProcess) && (data.intervalToProcess >= 15000)) {
             intervalToProcess = data.intervalToProcess;
         }

         if (!petIntervalId) { // this checking prevents creating multiple interval IDs
             petIntervalId = setInterval(this.checkNetworkAvailable.bind(this), intervalToProcess);
         }
    }

    // LS not available or it means offline won't work even if enabled.
    if (!offineEnabled || !localStorageAvailable) {
        xmlhttp = this.sendXMLHTTP(receiverUrl + arguments[0], result, data, method);

        // Handling response from Receiver
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
                if (typeof callback === 'function') {
                    callback(null,JSON.parse(xmlhttp.responseText));
                }
            }
            else {
                if (typeof callback === 'function') {
                    callback({
                            error: xmlhttp.status
                          });
                }
            }
        };
    }

};

/** @function
 * @lends PetRequest.prototype
 * @name sendXMLHTTP
 * @description It is used to send data to tracking system
 * @param  {String} URL [URL to make XMLHTTPREQUEST call]
 * @param  {Object} eventData [The data to send to external URL]
 * @param  {Object} data [object that contains necessary params (appId, sdkVersion etc.)]
 * @returns {Object} [returns XMLHTTPREQUEST object]
 */
PetRequest.prototype.sendXMLHTTP = function (url, eventData, data, method) {
    method = method || 'POST';
    //Making HTTP Request to Receiver
    var xmlhttp,
        supportedProtocols = ['https:', 'http:'],
        requestProtocol, gseAuthorizationToken = 'Bearer '+'GSE_AUTHORIZATION_TOKEN';

    if (window.XMLHttpRequest) { // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else { // code for IE6, IE5
        xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
    }

    requestProtocol = (supportedProtocols.indexOf(window.location.protocol) > -1) ? window.location.protocol : 'https:';
    xmlhttp.open(method,url, true);
    xmlhttp.setRequestHeader('Content-Type', 'application/json');
    //xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xmlhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
    xmlhttp.setRequestHeader('PETRACKER-TRACKING-ID', window.trackingID);

    // Setting DEBUG MODE in Header
    if (eventData instanceof Array) {
        if (eventData[0].data.debugMode) {
            xmlhttp.setRequestHeader('Debug-Mode', eventData[0].data.debugMode);
        }
    } else {
        if (data.debugMode) {
            xmlhttp.setRequestHeader('Debug-Mode', data.debugMode);
        }
    }

    xmlhttp.send(JSON.stringify(eventData));
    return xmlhttp;
};

/** @function
 * @lends PetRequest.prototype
 * @name sendXMLHTTP
 * @description It is used to send data to tracking system
 */
PetRequest.prototype.checkNetworkAvailable = function () {
    var offline = new PetOffline(this.sdkParams);
    offline.isNetworkAvailable();
};


