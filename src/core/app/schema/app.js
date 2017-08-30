/**
 * @module PETracker/app/schema
 * @name AppSchema
 * @description It have the JSON schema for validating the App parameters
 */
'use strict';

/**
 * AppSchema
 * @class PetAppSchema
 * @constucts {Object} schema
 * @description JSON Schema for validating the PETracker.init arguments and it's types
 */

function PetAppSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'App Parameter Schema',
        id: '/app',
        type: 'object',
        properties: {
            originatingSystemCode:{
                type: 'string'
            },
            namespace: {
                type: 'string'
            },
            messageVersion: {
                type: 'string'
            },
            trackingID: {
                type: 'string'
            },
            app: {
                type: 'string'
            },
            sdkVersion: {
                type: 'string'
            },
            appPlatform: {
                type: 'string',
                enum: ['web', 'mobile']
            },
            url: {
                type: 'string',
                format: 'url'
            },
            cookieDomainName: {
                type: 'string'
            },
            cookiePrefix: {
                type: 'string'
            },
            environment: {
                type: 'string',
                enum: ['development', 'test', 'stage', 'production']
            },
            autotracking: {
                type: 'array'
            },
            appName: {
                type: 'string'
            },
            appID: {
                type: ['string', 'number']
            },
            appVersion: {
                type: ['string', 'number']
            },
            appInstallerID: {
                type: 'string'
            }
        },
        required: ['trackingID'],
        additionalProperties: true
    };
}
