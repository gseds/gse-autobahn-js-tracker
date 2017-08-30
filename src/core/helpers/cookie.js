/**
 * @module PETracker/helpers/cookie
 * @name cookie
 * @description It is used to handle Tracking Cookie functionalities
 */
'use strict';

/**
 * PetCookie
 * @class PetCookie
 */
function PetCookie() {
    // constructor code here
}

/** @function
 * @lends PetCookie.prototype
 * @name create
 * @description It is used to create a tracking cookie
 * @param {String} cookieName
 * @param {String} cookiePrefix
 */
PetCookie.prototype.create = function () {
    var utilHeper = new PetUtilsHelper(),
        expiry = (SDK_COOKIE_EXPIRY * 60 * 1000),
        cookieName,
        cookiePrefix,
        cookieValue,
        expireTime,
        currentDate = new Date(),
        expires;

    if (!this.get(arguments[0])) {
        cookieName = arguments[0];
        cookiePrefix = arguments[1];
        currentDate.setTime(currentDate.getTime()+(arguments[2]*60*1000)),
        cookieValue = arguments[3];

        expires = 'expires=' + currentDate.toUTCString();

        // cookie creation
        document.cookie = cookiePrefix + cookieName + '=' + JSON.stringify(cookieValue) + ';path=/';
    }
};

/** @function
 * @lends PetUtils.prototype
 * @name get
 * @description It is used to get the value from cookie
 * @param {String} cookieName
 */
PetCookie.prototype.get = function () {
    var cookieName = arguments[0] + '=',
        cookies = document.cookie.split(';'),
        cookie,
        i;

    for (i = 0; i < cookies.length; i++) {
        cookie = cookies[i];
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1);
        }

        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }

    return '';
};

/** @function
 * @lends PetUtils.prototype
 * @name pageviewIndex
 * @description It is used to get & set the index value for pageview.
 * @param {String} action => get/setTime
 * @param {String} userId
 */
PetCookie.prototype.pageviewIndex = function (userId) {
    var cookieName = 'SDK_COOKIE_NAME' + '_pv', // pv denotes the pageview
        cookie = this.get(cookieName),
        expiry = (SDK_COOKIE_EXPIRY * 60 * 1000),
        currentDate = new Date(),
        expires,
        cookieValue,
        resultIndex;

    currentDate.setTime(currentDate.getTime() + expiry);
    expires = 'expires=' + currentDate.toUTCString();

    if (cookie) {
        cookieValue = JSON.parse(cookie);
    } else {
        cookieValue = {
            index: 1
        };
    }

    if (userId === cookieValue.userID) {
        cookieValue.index++;
        resultIndex = cookieValue.index;
        document.cookie = cookieName + '=' + JSON.stringify(cookieValue) + ';' + expires + ';path=/';
    } else {
        cookieValue = {
            userID: userId,
            index: 1
        };
        resultIndex = cookieValue.index;
        document.cookie = cookieName + '=' + JSON.stringify(cookieValue) + ';' + expires + ';path=/';
    }

    return resultIndex;
};
