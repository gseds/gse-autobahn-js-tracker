/**
 * @module PETracker/helpers/offline
 * @name PetOffline
 * @description It handles offline data processing
 */
'use strict';

/**
 * Sdk
 * @class PetOffline
 * @constructs offline configurations
 */
function PetOffline(sdkParams) {
    this.eventStorageName = 'EVENT_LOCAL_STORAGE_NAME';
    this.activitiesStorageName = 'ACTIVITIES_LOCAL_STORAGE_NAME';
    this.getSize = new PetGetDataSize();
    this.store = new PetStorage();
    this.ajax = new PetRequest();
    this.receiver = {
        development: 'DEVELOPMENT_RECEIVER_URL',
        test: 'TEST_RECEIVER_URL',
        stage: 'STAGE_RECEIVER_URL',
        production: 'PRODUCTION_RECEIVER_URL',
        defaultUrl: 'DEFAULT_RECEIVER_URL'
    };
    this.sdkParams = sdkParams;
    this.peEventData = null;
}

/** @function
 * @lends PetOffline.prototype
 * @name save
 * @description it stores the data into local storage
 * @param {Object} data
 */
PetOffline.prototype.save = function (data, type) {
    if (data) {

        var storageName = (type == 'events') ? this.eventStorageName : this.activitiesStorageName;

        this.peEventData = this.store.get(storageName);

        if (!this.peEventData) {
            this.peEventData = [data];
        } else {
            this.peEventData.push(data);
        }

        this.store.set(storageName, this.peEventData);
    }
};

/** @function
 * @lends PetOffline.prototype
 * @name checkData
 * @description Check the data in local storage
 */
PetOffline.prototype.checkData = function () {
    // local variables
    var recordsChunkLimit,
        i,
        indexStart,
        indexEnd,
        dataArr,
        j,
        sdkData;

    this.peEventData = this.store.get(this.eventStorageName),
    this.peActivityData = this.store.get(this.activitiesStorageName);

    if (this.peEventData) {

        recordsChunkLimit = this.getAllowedDataChunk(this.peEventData);
        i = 0;

        while (i < this.peEventData.length) {
            dataArr = [];
            for (j = 0; j < recordsChunkLimit; j++) {

                if (i >= this.peEventData.length) {
                    break;
                }

                dataArr.push(this.peEventData[i]);
                ++i;

                if (j === 0) {
                    indexStart = i - 1;
                }
            }

            sdkData = dataArr;

            indexEnd = i - 1;
            this.send(indexStart, indexEnd, sdkData, "events");
        }
    }

    if (this.peActivityData) {

        recordsChunkLimit = this.getAllowedDataChunk(this.peActivityData);
        i = 0;

        while (i < this.peActivityData.length) {
            dataArr = [];
            for (j = 0; j < recordsChunkLimit; j++) {

                if (i >= this.peActivityData.length) {
                    break;
                }

                dataArr.push(this.peActivityData[i]);
                ++i;

                if (j === 0) {
                    indexStart = i - 1;
                }
            }

            sdkData = dataArr;

            indexEnd = i - 1;
            this.send(indexStart, indexEnd, sdkData, "activities");
        }
    }
};

/** @function
 * @lends PetOffline.prototype
 * @name send
 * @description It sends the data from local storage to tracking system
 * @param {Number} indexStart
 * @param {Number} indexEnd
 * @param {Object} sdkData
 */
PetOffline.prototype.send = function (indexStart, indexEnd, sdkData, type) {
    // local variables
    var receiverUrl,
        self = this,
        data,
        xmlhttp;

    if (typeof this.receiver[this.sdkParams.environment] !== 'undefined') {
        receiverUrl = this.receiver[this.sdkParams.environment];
    } else {
        receiverUrl = this.receiver.defaultUrl;
    }

    receiverUrl += "/collect/bulk/"+type;

    data = {
        trackingID: sdkData[0].data.trackingID,
        sdkVersion: sdkData[0].data.sdkVersion
    };

    xmlhttp = this.ajax.sendXMLHTTP(receiverUrl, sdkData, data);

    // Handling response from Receiver
    xmlhttp.onreadystatechange = function () {
        var localStorageName  = type == "events" ? self.eventStorageName : self.activitiesStorageName;
        if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {

            var peEventsData = self.store.get(localStorageName);

            if (peEventsData) {
                if (peEventsData.length >= ++indexEnd) {
                    // delete all processed data from local storage.
                    self.store.delete(localStorageName);
                }
            }
        }
    };
};

/** @function
 * @lends PetOffline.prototype
 * @name getAllowedDataChunk
 * @description It sends the data from local storage to tracking system
 * @param {Object} sdkData
 */
PetOffline.prototype.getAllowedDataChunk = function (peEventData) {
    // default bulk data chunk's size limit for processing.
    var recordsChunkLimit,
        sizeAllowed,
        tempSizeCheck,
        x;

    recordsChunkLimit = 10,
    sizeAllowed = false;

    while (!sizeAllowed) {
        tempSizeCheck = [];

        for (x = 0; x < recordsChunkLimit; x++) {
            tempSizeCheck.push(peEventData[x]);
        }

        if (this.getSize.convertBytesToMB(this.getSize.roughSizeOfObject(tempSizeCheck)) > 0.80) {
            // decrease records limit by 10 until allowed chunk (greater than 1 MB) is formed.
            recordsChunkLimit = recordsChunkLimit - 10;

            if (recordsChunkLimit < 10) {
                recordsChunkLimit = 5;
                sizeAllowed = true;
            }
        } else {
            sizeAllowed = true;
        }
    }

    return recordsChunkLimit;
};

/** @function
 * @lends PetOffline.prototype
 * @name isNetworkAvailable
 * @description It checks if active network connection is available, invokes checking local storage if connection is active
 */
PetOffline.prototype.isNetworkAvailable = function () {
    // local variables
    var self = this,
        xhr = new XMLHttpRequest();

    if ('withCredentials' in xhr) {
        // Most browsers.
        xhr.open('GET', 'REMOTE_FILE_URL' + '?ping=' + Math.round(Math.random() * 10000), true);
    } else {
        //IE6, IE5
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
        xhr.open('GET', 'REMOTE_FILE_URL' + '?ping=' + Math.round(Math.random() * 10000), true);
    }

    xhr.send();
    xhr.onreadystatechange = function () {
        if ((xhr.readyState === 4) && (xhr.status === 200)) {
            self.checkData();
        }
    };
};
