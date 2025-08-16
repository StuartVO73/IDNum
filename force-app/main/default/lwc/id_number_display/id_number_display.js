import {LightningElement } from "lwc";

export default class IDNumberDisplay extends LightningElement {
    // Get and validate South African ID Number
    // Inspired by https://gist.github.com/heetbeet/e319701ee9c27888606bea270a0a35bc

    _IDNumStr = "";
    IDComponents = {
        date: "Invalid",
        gender: "Unknown",
        citizenship: "Unknown",
        length: 0,
        checksum: 0
    };

    processdate(yy, mm, dd) {
        // Test if dateStr can be converted into a date
        // Then test if the interpreter hasn't "helpfully" rolled over the month,
        // i.e. 2025/02/29 gets converted to 2025/03/01
        let currCentury = Math.trunc(new Date().getFullYear() / 100);
        let ccyy = currCentury + yy;
        mm = parseInt(mm, 10) - 1;
        this.IDdate = new Date(ccyy, mm, dd);
        if (
            isNaN(this.IDdate)
                ? false
                : parseInt(mm, 10) === this.IDdate.getMonth()
        ) {
            if (this.IDate > Date()) {
                this.IDdate = this.IDdate.setFullYear(
                    this.IDdate.getFullYear() - 100
                );
            }

            this.IDComponents.date =
                this.IDdate.getFullYear() +
                "-" +
                (this.IDdate.getMonth() + 1).toString().padStart(2, "0") +
                "-" +
                this.IDdate.getDate().toString().padStart(2, "0");
            return true;
        }
        this.IDComponents.date = "Invalid2";
        return false;
    }

    get IDNum() {
        return this._IDNumStr;
    }

    invalidLength() {
        this.IDComponents.length = `Invalid length ${this._IDNumStr.length}. Should be 13`;
        this.IDComponents.date = "Invalid";
        this.IDComponents.gender = "Unknown";
    }

    set IDNum(value) {
        // Remove non-digit characters from the input string
        // We couldn't just use a numeric input because it doesn't keep leading zeros
        
        console.log("1: " + this.IDNum + " / " + value);
        this._IDNumStr = value.replaceAll(/[^0-9]/g, "");
        console.log("2: " + this.IDNum+ " / " + this._IDNumStr); 

        
        if (this._IDNumStr.length < 13) {
            this.invalidLength();
        } else if (this._IDNumStr.length === 13) {
            this.processdate(
                this._IDNumStr.substring(0, 2),
                this._IDNumStr.substring(2, 4),
                this._IDNumStr.substring(4, 6)
            );
            this.IDComponents.length = 13;
        } else {
            //this._IDNumStr = this._IDNumStr.substring(0, 13);
        }
        
    }

    handleIDChange(event) {
        this.IDNum = event.target.value;
        
        event.target.setCustomValidity("_");          
        event.target.reportValidity();
    }
}
