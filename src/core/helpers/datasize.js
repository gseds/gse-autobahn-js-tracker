/**
 * @module PETracker/helpers/datasize
 * @name PetGetDataSize
 * @description It handles offline data size
 */
'use strict';

/**
 * Sdk
 * @class PetGetDataSize
 */
function PetGetDataSize() {
    //constructor
}

/** @function
 * @lends PetGetDataSize.prototype
 * @name roughSizeOfObject
 * @description Calculate the size of the data object
 * @param {Object} data
 * @returns {Number} Value
 */
PetGetDataSize.prototype.roughSizeOfObject = function (object) {
    var objectList = [],
        stack = [object],
        bytes = 0,
        value,
        i;

    while (stack.length) {
        value = stack.pop();

        if (typeof value === 'boolean') {
            bytes += 4;
        } else if (typeof value === 'string') {
            bytes += value.length * 2;
        } else if (typeof value === 'number') {
            bytes += 8;
        } else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
            objectList.push(value);
            for (i in value) {
                stack.push(value[i]);
            }
        }
    }

    return bytes;
};

/** @function
 * @lends PetGetDataSize.prototype
 * @name bytesToSize
 * @description converts bytes to data size in appropriate bytes(KB|MB|GB|TB)
 * @param {Number} bytes
 * @returns {Integer} Value
 */
PetGetDataSize.prototype.bytesToSize = function (bytes) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'],
        i;
    if (bytes === 0) {
        return 'n/a';
    }

    i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

/** @function
 * @lends PetGetDataSize.prototype
 * @name convertBytesToMB
 * @description converts bytes to MB
 * @param {Number} bytes
 * @returns {Integer} Value
 */
PetGetDataSize.prototype.convertBytesToMB = function (num) {
    return (num / 1048576 * 100000) / 100000;
};
