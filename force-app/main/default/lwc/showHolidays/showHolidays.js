import { wire, LightningElement } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import IDSELECTEDCHANNEL from "@salesforce/messageChannel/IDNumSelected__c";
import COMPONENTONLINE from "@salesforce/messageChannel/ComponentOnline__c"
import getHolidays from "@salesforce/apex/CalendarificCallout.GetHolidays"
//import { objToString } from 'c/utils';

const columns = [
    { label: 'Date', fieldName: 'isoDate' },
    { label: 'Name', fieldName: 'name' },
    { label: 'Type', fieldName: 'primaryType' }
];

export default class ShowHolidays extends LightningElement {

    columns = columns;

    data = [];

    error;

    // Messaging
    // =========

    subscription = null;

    @wire(MessageContext)
    messageContext;

    headerText = "Empty";

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            IDSELECTEDCHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        this.headerText = message.headerText;
        let payload = {};
        let dateComponents = message.date.split("-");
        switch (message.RequestType) {
            case 'ShowHolidaysInYear':
                payload = {
                    country: "ZA",
                    year: parseInt(dateComponents[0], 10)
                };
                break;
            case 'ShowHolidaysInMonth':
                payload = {
                    country: "ZA",
                    year: parseInt(dateComponents[0], 10),
                    month: parseInt(dateComponents[1], 10),
                };
                break;
            case 'ShowHolidaysOnDay':
                payload = {
                    country: "ZA",
                    year: parseInt(dateComponents[0], 10),
                    month: parseInt(dateComponents[1], 10),
                    day: parseInt(dateComponents[2], 10)
                };
                break;
            default:
                //ignore
        }
        this.getData(payload);
    }

    async getData(payload) {
        try {
            this.data = await getHolidays(payload);
            this.error = undefined;
        } catch (error) {
            this.error = error;
            this.data = undefined;
        }
    }


    connectedCallback() {
        this.subscribeToMessageChannel();
        publish(this.messageContext, COMPONENTONLINE, { ComponentName: "showHolidays" });
    }

}