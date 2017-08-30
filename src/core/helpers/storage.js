/**
 * @module PETracker/helpers/storage
 * @name PetStorage
 * @description It is the wrapper of Local Storage operations
 */
'use strict';

/**
 * Sdk
 * @class PetStorage
 */
function PetStorage() {
    //constructor
}

/** @function
 * @lends PetStorage.prototype
 * @name set
 * @description It stores the data into local storage
 * @param {String} Key
 * @param {String} Value
 */
PetStorage.prototype.set = function (key, value) {
    value = JSON.stringify(value);
    localStorage.setItem(key, value);
};

/** @function
 * @lends PetStorage.prototype
 * @name get
 * @description It get the data from local storage
 * @param {String} Key
 * @returns {Object} data
 */
PetStorage.prototype.get = function (key) {
    var data = localStorage.getItem(key);
    return JSON.parse(data);
};

/** @function
 * @lends PetStorage.prototype
 * @name delete
 * @description It removes the data from local storage
 * @param {String} Key
 */
PetStorage.prototype.delete = function (key) {
    return localStorage.removeItem(key);
};
