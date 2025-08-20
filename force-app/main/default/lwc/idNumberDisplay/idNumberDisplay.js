import { wire, LightningElement } from "lwc";
import { subscribe, publish, MessageContext } from 'lightning/messageService';
import IDSELECTEDCHANNEL from "@salesforce/messageChannel/IDNumSelected__c"
import COMPONENTONLINE from "@salesforce/messageChannel/ComponentOnline__c";
import updateReferenceCount from "@salesforce/apex/IDNumberUtils.AddIDNumber";
//import { objToString } from "c/utils";

// Used to test if the ID number contains only digits
const nonDigitRe = /[^0-9]/;

const invalidMarker = "Invalid";

export default class IDNumberDisplay extends LightningElement {
    /*
     Get and validate South African ID Number
     The format is described in https://d7.westerncape.gov.za/general-publication/decoding-your-south-african-id-number-0
     The Luhn checksum code comes from https://medium.com/@sahasuraj420/know-how-to-decode-sa-id-number-before-becoming-south-african-citizen-8cc60bcf6566
     The rest is mine.
    */

     //The underlying ID Number, used by the getter/setter
    _IDNumStr = "";

    // Name of currently active sub-componet, e.g. "showIdComponents" or "showHolidays"
    componentName;

    // The individual fields of the ID Number
    IDComponents = {
        date: "",
        gender: invalidMarker,
        citizenship: invalidMarker,
        length: 0,
        checksumCorrect: false
    };

    // Used to control the enabled/disabled status of the buttons
    validID = false;

    // Display all the reasons why a given entry is not a valid ID Number
    get errorMessage() {
        let fullErrorMessage = [];

        if (nonDigitRe.test(this.IDNum))
            fullErrorMessage.push("Number must not contain any non-digit characters");

        if (this.IDComponents.length !== 13)
            fullErrorMessage.push("Number must be exactly 13 digits long");

        if (this.IDComponents.length >= 6 && this.IDComponents.date === invalidMarker)
            fullErrorMessage.push(
                "Invalid first 6 digits. Must be date in YYMMDD format"
            );

        if (this.IDComponents.length >= 11 && this.IDComponents.citizenship === invalidMarker) {
            fullErrorMessage.push(
                "Invalid citizenship code: Must be 0 or 1"
            );
        }

        if (this.IDComponents.length === 13 && !this.IDComponents.checksumCorrect) {
            fullErrorMessage.push(
                "Invalid checksum digit."
            );
        }

        return fullErrorMessage.join(". ");
    }

    // Process date field of ID Number
    // Return true if the date is valid, false otherwise
    processdate(yy, mm, dd) {

        // By default, use the current century
        let currCentury = Math.trunc(new Date().getFullYear() / 100);
        let ccyy = currCentury + yy;
        mm = parseInt(mm, 10) - 1;
        let idDate = new Date(ccyy, mm, dd);

        // Test if dateStr can be converted into a date
        // Then test if the interpreter hasn't "helpfully" rolled over the month,
        // i.e. 2025/02/29 gets converted to 2025/03/01
        if (isNaN(idDate) ? false : parseInt(mm, 10) === idDate.getMonth()) {
            // "Normalise" date - Make best guess as to the correct century
            if (idDate > new Date()) {
                idDate = new Date(idDate.setFullYear(idDate.getFullYear() - 100));
            }

            this.IDComponents.date =
                idDate.getFullYear() + "-" +
                (idDate.getMonth() + 1).toString().padStart(2, "0") + "-" +
                idDate.getDate().toString().padStart(2, "0");

            return true;
        }
        this.IDComponents.date = invalidMarker;
        return false;
    }

    // Getter for _IDNumStr
    get IDNum() {
        return this._IDNumStr;
    }

    // Setter for _IDNumStr
    // Performs all the validation and decomposition of the ID Number
    set IDNum(value) {
        this._IDNumStr = value;

        this.IDComponents.length = value.length;

        this.validID = true;

        if (value.length >= 6) {
            this.processdate(
                this._IDNumStr.substring(0, 2),
                this._IDNumStr.substring(2, 4),
                this._IDNumStr.substring(4, 6)
            );
        } else {
            this.validID = false;
            this.IDComponents.date = invalidMarker;
        }

        if (value.length >= 10) {
            this.IDComponents.gender = value.substring(6, 10) < 5000 ? "Female" : "Male";
        } else {
            this.validID = false;
            this.IDComponents.gender = invalidMarker;
        }

        if (value.length >= 11) {
            switch (value.substring(10, 11)) {
                case "0":
                    this.IDComponents.citizenship = "SA Citizen";
                    break;
                case "1":
                    this.IDComponents.citizenship = "Permanent resident";
                    break;
                default:
                    this.validID = false;
                    this.IDComponents.citizenship = invalidMarker;

            }
        } else {
            this.validID = false;
            this.IDComponents.citizenship = invalidMarker;
        }

        if (value.length === 13) {
            this.IDComponents.checksumCorrect = this.getChecksum(value);
            this.validID = this.IDComponents.checksumCorrect;

        } else {
            this.validID = false;
            this.IDComponents.checksumCorrect = false;
        }
    }

    getChecksum(idNum) {
        let arr = [...idNum];   // We have converted the string into array
        let sum = 0;            // This variable will consists of sum after step 3
        let n = arr.length;
        for (let i = 0; i < n; i++) {
            arr[i] = parseInt(arr[i], 10);  // converting from character to int
        }
        for (let i = 1; i < n; i = i + 2) {   // execution of step 1
            let v = arr[n - 1 - i] * 2;
            if (v > 9) { arr[n - 1 - i] = v - 9; }
            else { arr[n - 1 - i] = v; }
        }
        for (let i = 0; i < n; i++) {    //calculating the step
            sum = sum + arr[i];
        }
        return sum % 10 === 0;
    }


    // Messaging
    // =========

    @wire(MessageContext)
    messageContext;

    // This channel is used by newly-enabled components 
    // to signal that they are online
    subscribeToMessageChannelComponentOnline() {
        this.subscription = subscribe(
            this.messageContext,
            COMPONENTONLINE,
            (message) => this.handleMessage(message)
        );
    }


    // Once component is online, send the ID number to it
    handleMessage(message) {
        this.componentName = message.ComponentName
        this.sendMessage();
    }

    // Send ID number to all subscribed LWCs
    sendMessage() {
        let payload = {};
        switch (this.componentName) {
            case "showIdComponents":
                publish(this.messageContext, IDSELECTEDCHANNEL, this.IDComponents);
                break;
            case "showHolidays":
                payload.date = this.IDComponents.date;
                payload.gender = this.IDComponents.gender;
                payload.citizenship = this.IDComponents.citizenshipe;
                payload.checksumCorrect = this.IDComponents.checksumCorrect;
                payload.RequestType = this.holidayRequestType;
                payload.headerText = this.headerText;
                publish(this.messageContext, IDSELECTEDCHANNEL, payload);
                break;
            default:
            //Ignore
        }
    }


    // Event Handlers
    // ==============

    showComponents = false;
    showHolidays = false;
    holidayRequestType = "";
    headerText = "";

    // Track changes to ID Number input, and display error messages
    handleIDChange(event) {
        this.IDNum = event.target.value;
        event.target.setCustomValidity(this.errorMessage);
        event.target.reportValidity();
        this.showComponents = false;
        this.showHolidays = false;
    }

    // Display LWC that shows ID Number components 
    handleClickComponents() {
        this.showComponents = true;
        this.showHolidays = false;
        if (this.componentName) this.sendMessage();
        this.updateSF();
    };

    // Display LWC that shows holidays in birth year of ID Number 
    handleClickHolidaysInBirthYear() {
        this.showComponents = false;
        this.showHolidays = true;
        this.holidayRequestType = "ShowHolidaysInYear";
        this.headerText = "Holidays in year of your birth";
        if (this.componentName) this.sendMessage();
        this.updateSF();
    }
 
    // Display LWC that shows holidays on birth date of ID Number 
    handleClickHolidaysOnBirthday() {
        this.showComponents = false;
        this.showHolidays = true;
        this.holidayRequestType = "ShowHolidaysOnDay";
        this.headerText = "Holidays on your birthday";
        if (this.componentName) this.sendMessage();
        this.updateSF();
    }


    // Update Salesforce
    // =================

    // Call Apex to update count of references to this ID number
    async updateSF() {
        let payload = {
            IDNumber: this.IDNum,
            birthdate: this.IDComponents.date,
            gender: this.IDComponents.gender,
            citizen: this.IDComponents.citizenship === "SA Citizen",
        };


        try {
            await updateReferenceCount(payload);
            this.error = undefined;
        } catch (error) {
            this.error = error;
            this.result = undefined;
        }
    }

    // Initialisation Hook
    // ===================

    connectedCallback() {
        this.subscribeToMessageChannelComponentOnline();
    }

    renderedCallback() {
        this.template.querySelector("lightning-input")?.focus();
    }


}