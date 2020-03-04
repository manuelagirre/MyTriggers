import {LightningElement, wire, api} from 'lwc';
import getMDTRowsApex from '@salesforce/apex/MyTriggers.getAllTriggerHandlerSettings';

export default class MyTriggerViewBase extends LightningElement {

    @wire(getMDTRowsApex)
    mdtFromApex;

    get customMDTs(){
        console.log(this.mdtFromApex.data);
        if (this.mdtFromApex.data != undefined) {
            return this.mdtFromApex.data;
        } else {
            return [];
        }
    }

    get filterOptions() {
        var optionsTiming = [];
        var includedTiming = [];

        var optionsDml = [];
        var includedDmls = [];

        var optionsSobject = [];
        var includedSobjects = [];

        var optionsClasses = [];
        var includedClasses = [];

        for (var i = 0; i < this.customMDTs.length; i++) {

            var mdtRow = this.customMDTs[i];
            var clasName = mdtRow.Class__c;
            var triggerEventDML = mdtRow.Event__c.split('_')[1];
            var triggerEventTime = mdtRow.Event__c.split('_')[0];
            var sobject = mdtRow.sObject__c;

            if (includedTiming.indexOf(triggerEventTime) < 0) {
                includedTiming.push(triggerEventTime);
                optionsTiming.push({
                    label: triggerEventTime, value: triggerEventTime
                });
            }

            if (includedDmls.indexOf(triggerEventDML) < 0) {
                includedDmls.push(triggerEventDML);
                optionsDml.push({
                    label: triggerEventDML, value: triggerEventDML
                });
            }

            if (includedSobjects.indexOf(sobject) < 0) {
                includedSobjects.push(sobject);
                optionsSobject.push({
                    label: sobject, value: sobject
                });
            }

            if (includedClasses.indexOf(clasName) < 0) {
                includedClasses.push(clasName);
                optionsClasses.push({
                    label: clasName, value: clasName
                });
            }
        }

        var result = {
            "optionTiming" : optionsTiming,
            "optionDml" : optionsDml,
            "optionSobject" : optionsSobject,
            "optionClass" : optionsClasses
        };

        return result;
    }

    get possibleDMLs() {
        return ['INSERT', 'UPDATE', 'DELETE', 'UNDELETE'];
    }

    get possibleTimings() {
        return  ['BEFORE', 'AFTER'];
    }

    collectAndSortPossibleOrderNumbers(mdtData) {
        var possibleOrderNumbers = [];
        for (var mdtIndexer = 0; mdtIndexer < mdtData.length; mdtIndexer++) {
            var mdtRow = mdtData[mdtIndexer];
            var orderNumber = mdtRow.Order__c;
            //console.log(orderNumber);
            if (!possibleOrderNumbers.includes(orderNumber)) {
                possibleOrderNumbers.push(orderNumber);
            }
        }
        possibleOrderNumbers.sort();
        return possibleOrderNumbers;
    }
}