/**
 * @module PETracker/events/message/schema
 * @name MessageSchema
 * @description JSON Schema validating the Message parameters
 */
'use strict';

/**
 * MessagesSchema
 * @class PetMessagesSchema
 * @constucts {Object} schema
 * @description message event Schema
 */

function PetMessageSchema(verb) {
    /**
     * @member {object}
     */
    var index,
        requiredList;
    this.schema = {
        title: 'Send Message Event Parameter Schema',
        id: '/sendMessageSchema',
        type: 'object',
        properties: {
            messageTypeCode: {
                type: 'string'
            },
            originatingSystemCode: {
                type: 'string'
            },
            messageVersion: {
                type: 'string'
            },
            environmentCode: {
                type: 'string'
            },
            transactionDt: {
                type: 'string'
            },
            messageId: {
                type: 'string'
            },
            gaCategory: {
                type: 'string'
            },
            gaAction: {
                type: 'string'
            },
            gaLabel: {
                type: 'string'
            },
            gaValue:{
                type: 'number'
            }
        },
        required: ['messageTypeCode', 'originatingSystemCode', 'messageVersion', 'environmentCode', 'transactionDt', 'messageId']
    };

    switch (verb.toLocaleLowerCase()) {
        case 'loginattempt':
            this.schema.properties = new PetUtilsHelper().merge(this.schema.properties, PetLoginMessageSchema().properties);
            requiredList = PetLoginMessageSchema().required;
            for (index = 0; index < requiredList.length; index++)
                this.schema.required.push(requiredList[index]);
            break;
        default:
            throw new Error('Invalid messageTypeCode');
    }
}
