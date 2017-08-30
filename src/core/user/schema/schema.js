/**
 * @module PETracker/user/schema
 * @name UserSchema
 * @description It have the JSON schema for validating the User parameters
 */
'use strict';

/**
 * UserSchema
 * @class PetUserSchema
 * @constucts {Object} schema
 * @description JSON Schema for validating the user data
 */

function PetUserSchema() {
    /**
     * @member {object}
     */
    this.schema = {
        title: 'User Parameter Schema',
        id: '/user',
        type: 'object',
        properties: {
            userID: {
                type: ['string', 'number']
            },
            userSsoID: {
                type: ['string', 'number']
            },
            userSsoOrigin: {
                type: 'string'
            },
            internalSessionUD: {
                type: 'string'
            },
            userLanguage: {
                type: 'string'
            },
            userNationality: {
                type: 'string'
            },
            userGender: {
                type: 'string'
            },
            userFirstName: {
                type: 'string'
            },
            userLastName: {
                type: 'string'
            }
        },
        required: ['userID']
    };
}
