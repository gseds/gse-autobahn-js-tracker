/**
 * @module PETracker/user/params
 * @name UserParams
 * @description It have the user's parameters list
 */
'use strict';

/**
 * PetUserParams
 * @class PetUserParams
 * @constructs User params
 */
function PetUserParams() {
    /**
     * @member {object}
     */
    this.params = {
        // application user id
        userID: 'anonymous',

        // SSO ID
        userSsoID: '',

        // User ID in that SSO
        userSsoOrigin: '',

        // User's session ID
        internalSessionID: '',

        // User's Language
        userLanguage: '',

        // User's country
        userNationality: '',

        // User's Gender,
        userGender: '',

        // User's firstname
        userFirstName: '',

        // User's lastname
        userLastName: ''
    };
}
