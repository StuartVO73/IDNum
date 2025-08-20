import { wire, LightningElement } from 'lwc';
import { publish, subscribe, MessageContext } from 'lightning/messageService';
import IDSELECTEDCHANNEL from "@salesforce/messageChannel/IDNumSelected__c";
import COMPONENTONLINE from "@salesforce/messageChannel/ComponentOnline__c"

const invalidMarker = "Invalid";

export default class Show_id_components extends LightningElement {

    IDComponents = {
        date: "",
        gender: invalidMarker,
        citizenship: invalidMarker,
        length: 0,
        checksumCorrect: false
    };

    // Messaging
    // =========
    subscription = null;

    @wire(MessageContext)
    messageContext;

    subscribeToMessageChannel() {
        this.subscription = subscribe(
            this.messageContext,
            IDSELECTEDCHANNEL,
            (message) => this.handleMessage(message)
        );
    }

    handleMessage(message) {
        this.IDComponents = message;
    }

    // Initialisation Hook
    // ===================

    connectedCallback() {
        this.subscribeToMessageChannel();
        publish(this.messageContext, COMPONENTONLINE, { ComponentName: "showIdComponents" });
    }

}