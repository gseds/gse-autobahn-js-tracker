/**
 * @name TrackerSDK JS Configurations
 * @description This file have the configurations for compling the Tracker SDK Source files
 * @returns {Object}
 */

'use strict';

// Configuration for Tracker Javascript SDK

module.exports = {
    // name of LS variable holding offline event data
    localStorage: {
        name: 'LOCAL_STORAGE_NAME'
    },

    // offline tracking parameters
    offline: {
        remoteFileUrl: 'REMOTE_FILE_URL',
        trackingInterval: 'TRACKING_TIME_INTERVAL'
    },

    // Receiver URLs Here
    receiver: {
        environment: {
            development: 'RECEIVER_URL_HERE',
            test: 'RECEIVER_URL_HERE',
            stage: 'RECEIVER_URL_HERE',
            production: 'RECEIVER_URL_HERE'
        },
        defaultUrl: 'RECEIVER_URL_HERE'
    },

    // cookie configuration
    cookie: {
        name: 'SDK_COOKIE_NAME_HERE',
        expiry: 1051200 // SDK_COOKIE_EXPIRY_TIME in minutes
    },

    // tracking event configurations
    tracking: {
        allowOLDFEventsOnly: false // 'ALLOW_OLDF_EVENTS_ONLY'
    }
};
