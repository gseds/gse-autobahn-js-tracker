/**
 * @module PETracker/helpers/params
 * @name params
 * @description It is used to detect the default values and client's contextual information
 */
'use strict';

/**
 * PetParamsHelper
 * @class PetParamsHelper
 */
function PetParamsHelper() {
    // constructor code here
}

/** @function
 * @lends PetParamsHelper.prototype
 * @name getScreenDepth
 * @description It is used to get the screen depth of client's browser
 * @return {String} screenDepth
 */
PetParamsHelper.prototype.getScreenDepth = function () {
    return window.screen.colorDepth + '-bits';
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getViewPort
 * @description It is used to get the viewport of client's browser
 * @return {String} viewport
 */
PetParamsHelper.prototype.getViewPort = function () {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
        height = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    return width + 'x' + height;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getScreenResolution
 * @description It is used to get the screen resolution of client's browser
 * @return {String} screenResolution
 */
PetParamsHelper.prototype.getScreenResolution = function () {
    var clientScreen = window.screen;
    return clientScreen.width + 'x' + clientScreen.height;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getDocumentEncode
 * @description It is used to get the type of document encode in client's browser
 * @return {String} documentEncode
 */
PetParamsHelper.prototype.getDocumentEncode = function () {
    return document.characterSet;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name splitTimezone
 * @description It is used to get timezone value from client's date
 * @return {String} timezoneString
 */
PetParamsHelper.prototype.splitTimezone = function (number, length) {
    var str = '' + number;

    while (str.length < length) {
        str = '0' + str;
    }

    return str;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getTimezone
 * @description It is used to get the timezone in client's browser
 * @return {String} timezone
 */
PetParamsHelper.prototype.getTimezone = function () {
    var offset = new Date().getTimezoneOffset(),
        hours,
        minutes;

    hours = this.splitTimezone(parseInt(Math.abs(offset / 60)), 2);
    minutes = this.splitTimezone(Math.abs(offset % 60), 2);

    offset = (offset < 0 ? '+' : '-');
    offset += hours + ':' + minutes;
    return offset;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getUserAgent
 * @description It is used to detect the user agent of client application
 * @return {String} userAgent
 */
PetParamsHelper.prototype.getUserAgent = function () {
    return encodeURIComponent(navigator.userAgent);
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getDocumentSize
 * @description It is used to detect the document size of client application
 * @return {String} documentSize
 */
PetParamsHelper.prototype.getDocumentSize = function () {
    return document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getFlashVersion
 * @description It is used to detect the flash version in client browser
 * @return {String} flashVersion
 */
PetParamsHelper.prototype.getFlashVersion = function () {
    var y = 'length',
        v = 'name',
        t = 'indexOf',
        m = 'match',
        O = window,
        oa = 'navigator',
        a,
        b,
        c,
        r = '2',
        e;

    if (O[oa].plugins) {
        c = O[oa].plugins;
        for (d = 0; d < c[y] && !b; d++) {
            e = c[d];
            (-1) < e[v][t]('Shockwave Flash') && (b = e.description);
        }
    }

    if (!b) {
        try {
            a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.7');
            b = a.GetVariable('$version');
            r = '3';
        } catch (g) {}
    }

    if (!b) {
        try {
            a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash.6');
            b = 'WIN 6,0,21,0';
            a.AllowScriptAccess = 'always';
            b = a.GetVariable('$version');
            r = '3';
        } catch (ca) {}
    }

    if (!b) {
        try {
            a = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
            b = a.GetVariable('$version');
            r = '3';
        } catch (l) {}
    }

    b && (a = b[m](/[\d]+/g)) && (a[y] >= 3) && (b = a[0] + '.' + a[1] + ' r' + a[r]);
    return b || void 0;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name isCookieEnabled
 * @description It is used to detect the cookie is enabled or disabled in client application
 * @return {Boolean}
 */
PetParamsHelper.prototype.isCookieEnabled = function () {
    return navigator.cookieEnabled;
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name isJavaEnabled
 * @description It is used to detect the java is enabled or disabled in client application
 * @return {Boolean}
 */
PetParamsHelper.prototype.isJavaEnabled = function () {
    var client = window.navigator;
    if (typeof client.javaEnabled === 'function' && client.javaEnabled()) {
        return true;
    } else {
        return false;
    }
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getTimestamp
 * @description Returns current timestamp of client side app
 * @return {String} timestamp
 */
PetParamsHelper.prototype.getTimestamp = function () {
    return (new Date()).toISOString();
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getParameterByName
 * @description Returns current value by parameter name
 * @return {String} Parameter
 */
PetParamsHelper.prototype.getParameterByName = function (name) {
    var regex;

    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    regex = new RegExp('[\\?&]' + name + '=([^&#]*)'), results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getUtmParam
 * @description It returns the UTM parameters
 * @return {String} Value
 */
PetParamsHelper.prototype.getUtmParam = function (paramName) {
    return this.getParameterByName(paramName);
};

/** @function
 * @lends PetParamsHelper.prototype
 * @name getBrowserLanguage
 * @description It returns the Browser Language
 * @return {String} Value
 */
PetParamsHelper.prototype.getBrowserLanguage = function (paramName) {
    return window.navigator.userLanguage || window.navigator.language;
};
