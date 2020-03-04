import { LightningElement, api, track } from 'lwc';
import MyTriggerViewBase from 'c/myTriggerViewBase';

/**
 * Show an item
 */
export default class BusinessCentricView extends MyTriggerViewBase {
    @api
    mdtAsList;

    @api
    isCard;
    
    handleFilterChange(event){
        var filter = event.detail;
        console.log(filter.classValue);
        console.log(filter.sobjectsValues);
        console.log(filter.crudValue);
        console.log(filter.timingValue);

        var headers = [];
        for (var index = 0; index < filter.sobjectsValues.length; index++) {
            headers.push({
                "label" : filter.sobjectsValues[index],
                "key" : filter.sobjectsValues[index]
            });
        }
        var mapped = this.mapTheData(this.customMDTs, filter);

        var tableCells = [];
        for (var index = 0; index < mapped.length; index++) {
            tableCells.push(mapped[index]);
        }

        console.log(tableCells);

        var table = this.template.querySelector('c-table-component');
        table.update(headers, tableCells);
    }

    mapTheData(mdtDataAsList, filter) {
        var mdtData = mdtDataAsList;
        var mapped = [];

        for (var mdtIndexer = 0; mdtIndexer < mdtData.length; mdtIndexer++) {
            var mdtRow = mdtData[mdtIndexer];
            var clasName = mdtRow.Class__c;
            var triggerEventDML = mdtRow.Event__c.split('_')[1];
            var triggerEventTime = mdtRow.Event__c.split('_')[0];
            var sobject = mdtRow.sObject__c;

            var eventDMLOrderNumber = this.possibleDMLs.indexOf(triggerEventDML);
            var eventTimingOrderNumber = this.possibleTimings.indexOf(triggerEventTime);

            //console.log(clasName + ' ' + triggerEventDML + ' ' + triggerEventTime + ' ' + sobject);
            if (clasName === filter.classValue) {
                if (filter.crudValue.includes(triggerEventDML)) {

                    var grandParent = mapped[eventDMLOrderNumber];
                    if (grandParent == undefined) {
                        mapped[eventDMLOrderNumber] = this.createGrandParentElement(triggerEventDML);
                        grandParent = mapped[eventDMLOrderNumber];
                    }

                    if (filter.timingValue.includes(triggerEventTime)) {

                        var parent = grandParent.rows[eventTimingOrderNumber];
                        if (parent == undefined) {
                            grandParent.rows[eventTimingOrderNumber] = this.createGrandParentRow(triggerEventTime);
                            parent = grandParent.rows[eventTimingOrderNumber];
                        }

                        parent.elements[filter.sobjectsValues.indexOf(sobject)] = 
                            this.createCellElement(mdtRow.Description__c, filter.sobjectsValues.indexOf(sobject));

                    }

                }
            }
            
        }

        return mapped;
    }

    createGrandParentElement(triggerEventDML){
        return {
            "title" : triggerEventDML,
            "key" : triggerEventDML,
            "rows" : []
        };
    }

    createGrandParentRow(triggerEventTime) {
        return {
            "title" : triggerEventTime,
            "key" : triggerEventTime,
            "isLastRow" : "false",
            "elements" : []
        };
    }

    createCellElement(description, key) {
        return {
            "label" : description,//mdtRow.Description__c,
            "key" : key//filter.sobjectsValues.indexOf(sobject)
        };
    }
}