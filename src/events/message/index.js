/**
 * @module PETracker/events/sendMessage
 * @name sendEvent
 * @description It is a generic event to send tracking data
 */
'use strict';

var autobahUrls = {
    messaging: "AUTOBAHN_MESSAGING_URL",
    schema: "AUTOBAHN_SCHEMA_URL",
    collection: "AUTOBAHN_COLLECTION_URL"
};

/**
 * Sdk
 * @class PetMessage
 * @constructs PetMessage configurations and eventParameters
 */
function PetMessage(sdkParams) {

    this.eventParams = {
        isSendMessage: true,
        interactionType: 'event',
        sdkParams: sdkParams
    };
};

function catchSchemaError(data){
    if(this.trackerObject.sdkParams.debugMode){
        console.error("Payload has not been sent due to schema valaidation error.",data.error);
    }
    else{
        var ajaxRequest = new PetRequest();
        var url = autobahUrls.collection+"/"+this.trackerObject.sdkParams.trackingID;
        ajaxRequest.send(url, data, {offlineEnabled: false, environment: this.trackerObject.sdkParams.environment},false);
    }
};


function autofillParameters(data, schema){
    if(schema.properties){
        for(var key in schema.properties){
            if(this.trackerObject.sdkParams[key]){
                data[key] = data[key] || this.trackerObject.sdkParams[key];
            }
        }
        if(Object.keys(schema.properties).indexOf("messageTypeCode") == -1){
            delete data.messageTypeCode;
        }
    }
    return data;
};

function autobahnSchemaCookieValidator(event){
     var cookieFilter = document.cookie.split(';').filter(function(value){
        return value.indexOf(event.namespace+'|'+event.messageTypeCode+'|'+ ((event.messageVersion) ? event.messageVersion : 'latest')) > -1
    });

    if(cookieFilter.length > 0){
        return JSON.parse(cookieFilter[0].split('=')[1]);
    }
    return false;
};

function autobahnValidator(eventParams, event, callback){
    
    if(event.namespace && event.messageTypeCode){

        if(!eventParams.schemaValidation && !eventParams.autofill){
            if(typeof callback == "function"){
                callback(null, event);
                return;
            }
        }

        var schemaFoundInCookie = autobahnSchemaCookieValidator(event);

        if(schemaFoundInCookie){

            if(eventParams.autofill){

                event.payload = autofillParameters(event.payload, schemaFoundInCookie);    
            }
            else{
                if(Object.keys(schemaFoundInCookie.properties).indexOf("messageTypeCode") == -1){
                    delete event.payload.messageTypeCode;
                }
            }

            if(eventParams.schemaValidation){

                var schemaValidationResult = tv4.validateMultiple(event.payload, schemaFoundInCookie, true);

                if(!schemaValidationResult.valid){
                    event.error = schemaValidationResult;
                    catchSchemaError(event);
                    return false;
                }
                
            }

            if(typeof callback == "function"){
                callback(null, event);
            }
            return;
        }
        var urlFormatter = autobahUrls.schema + '/';
        urlFormatter += event.namespace + '/' + event.messageTypeCode+'/'+(event.messageVersion ? event.messageVersion : 'latest');
        var ajax = new PetRequest(eventParams);
        ajax.send(urlFormatter, {}, {offlineEnabled: false,environment: eventParams.environment}, function(err, data){
            if(err && err.error != 200){
                if(typeof callback == "function"){
                    callback(err);
                }
            }
            else if(data && data.code == 200 && data.response){

                data = data.response;

                if(eventParams.autofill){
                    event.payload = autofillParameters(event.payload, data.schemaDefinition);
                }
                else{
                    if(Object.keys(data.schemaDefinition.properties).indexOf("messageTypeCode") == -1){
                        delete event.payload.messageTypeCode;
                    }
                }

                
                var schema = data.schemaDefinition, schemaValidationResult = tv4.validateMultiple(event.payload, schema, true);
                var cookie = new PetCookie();
                cookie.create(event.namespace+"|"+event.messageTypeCode+"|"+(event.messageVersion? event.messageVersion : 'latest'),'', 180 * 60 * 1000, schema); 
                if(!schemaValidationResult.valid && eventParams.schemaValidation){
                    event.error = schemaValidationResult;
                    catchSchemaError(event);
                    return false;
                }
                
                if(typeof callback == "function"){
                    callback(null, event);
                }
            }
            
            
        },"GET");
    }
    else{
        callback({err:"Required Parameter missing Namespace or MessageTypeCode missing."});
    }
};

/** @function
 * @lends PetMessage.prototype
 * @name track
 * @description It is a generic method to track all events
 * @param {Array} Input data from app
 * @param {Object} sdkParams
 * @param {Object} sdkErrors
 */
PetMessage.prototype.track = function () {
    // Dependencies
    var dataClone = arguments[1],
        eventUrl = arguments[0],
        options = arguments[2],
        user_callback = arguments[3],
        self = this;
    
    var format_payload = {
        "messageTypeCode": (dataClone && dataClone["messageTypeCode"]),
        "messageVersion": (options && options["messageVersion"])  || this.eventParams.sdkParams["messageVersion"],
        "actionType":"create",
        "namespace": (options && options["namespace"])  || this.eventParams.sdkParams["namespace"],
        "payload": dataClone || {}
    }, 
    
    eventData = {
        originatingSystemCode: (options && options["originatingSystemCode"]) || this.eventParams.sdkParams["originatingSystemCode"],
    };

    eventData[eventUrl] = [format_payload];

    if(!format_payload.messageTypeCode){
        console.error("Message Typecode is a required property.");
        return false;
    }

    // if(format_payload && format_payload.payload && format_payload.payload.messageTypeCode){

    //     delete format_payload.payload.messageTypeCode;
    // }
    
    var self = this;
        
    autobahnValidator(this.eventParams.sdkParams,format_payload, function(err, validatedData){
            if(err){
                console.error(err);
            }
            else{
                var ajax = new PetRequest()
                ,url = autobahUrls.messaging+'/'+eventUrl
                ,data = eventData;
                ajax.send(url, data,{offlineEnabled: false,environment: self.eventParams.sdkParams.environment}, user_callback);
            }
    });

   
};
