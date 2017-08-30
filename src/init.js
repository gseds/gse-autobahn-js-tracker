/**
 * @module PETracker/init
 * @name init
 * @description It is used to initialize the Tracker SDK Object in Application
 */
'use strict';

// @member {Object} petWindowObj
var petWindowObj = window;

// Check the PETracker is initialized or not
if (!petWindowObj._petracker) {
    petWindowObj._petracker = 'PETracker';

    // exporting the PETracker Object
    petWindowObj.PETracker = new PetSdk();
}
