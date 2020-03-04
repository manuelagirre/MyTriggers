import { LightningElement, api, track } from 'lwc';
import MyTriggerViewBase from 'c/myTriggerViewBase';

/**
 * Show an item
 */
export default class EventCentricView extends MyTriggerViewBase {
    @api
    mdtAsList;

    handleFilterChange(event){
        console.log('EventCentricView handleFilterChange');
        var filter = event.detail;
        console.log(filter.classValue);
        console.log(filter.sobjectsValues);
        console.log(filter.crudValue);
        console.log(filter.timingValue);

        var headers = [{"label":"Trigger Order","key":"-1"}];
        for (var index = 0; index < filter.sobjectsValues.length; index++) {
            headers.push({
                "label" : filter.sobjectsValues[index],
                "key" : filter.sobjectsValues[index]
            });
        }
        console.log('EventCentricView before mapTheData');
        var mapped = this.mapTheData(this.customMDTs, filter, headers);
        console.log(mapped);

        var tableCells = [];
        for (var index = 0; index < mapped.length; index++) {
            tableCells.push(mapped[index]);
        }

        console.log(tableCells);

        var table = this.template.querySelector('c-table-component');
        table.update(headers, tableCells);
    }

    mapTheData(mdtDataAsList, filter, headers) {
        console.log('EventCentricView mapTheData');
        //console.log(mdtDataAsList);
        var mdtData = mdtDataAsList;
        var mapped = [];


        //console.log('SobjectCentricView before possible');
        var possibleOrderNumbers = this.collectAndSortPossibleOrderNumbers(mdtData);

        for (var mdtIndexer = 0; mdtIndexer < mdtData.length; mdtIndexer++) {
            var mdtRow = mdtData[mdtIndexer];
            var clasName = mdtRow.Class__c;
            var triggerEventDML = mdtRow.Event__c.split('_')[1];
            var triggerEventTime = mdtRow.Event__c.split('_')[0];
            var sobject = mdtRow.sObject__c;
            var orderNumber = mdtRow.Order__c;
            
            //console.log(triggerEventTime + ' ' + triggerEventDML + ' ' + sobject + ' ' + clasName);
            if (filter.classValue.includes(clasName)) {
                if (filter.sobjectsValues.includes(sobject)) {
                    if (filter.crudValue === triggerEventDML && filter.timingValue === triggerEventTime) {
                        console.log(triggerEventTime + ' ' + triggerEventDML + ' ' + sobject + ' ' + clasName);
                        var grandParent = mapped[0];
                        if (grandParent == undefined) {
                            mapped.push(
                                this.createTablePiece(triggerEventTime, triggerEventDML)
                            );
                        }
                        
                        var tablePiece = mapped[0].rows[0];
                        console.log(tablePiece);
                        var rowIndex = possibleOrderNumbers.indexOf(orderNumber);
                        console.log(rowIndex);
                        if (tablePiece.elements[rowIndex] == undefined) {
                            tablePiece.elements[rowIndex] = this.createRowElement(rowIndex, orderNumber, filter.sobjectsValues);
                        }
                        var rowElement = tablePiece.elements[rowIndex];
                        var colIndex = filter.sobjectsValues.indexOf(sobject) + 1;
                        console.log(colIndex);
                        rowElement.elements[colIndex] = this.createCellElement(colIndex, mdtRow.Description__c);
                        console.log('EventCentricView mapped data in for cycle');
                        console.log(mapped);
                    }
                }
            }
        }
        console.log('EventCentricView mapped data');
        console.log(mapped);
        return mapped;
    }

    createTablePiece(triggerEventTime, triggerEventDML) {
        return {
            "title" : triggerEventTime,
            "key" : triggerEventTime,
            "rows" : [
                {
                    "title" : triggerEventDML,
                    "key" : triggerEventDML,
                    "isMultipleRows" : "true",
                    "elements" : []
                }
            ]
        }
    }

    createRowElement(rowIndex,orderNumber,sobjectValues) {
        var elements = [{"key":"0","label":orderNumber}];
        for (var i = 0; i < sobjectValues.length; i++) {
            elements.push({"key":(i+1), "label":""});
        }
        return {
            "key" : rowIndex,
            "elements" : elements
        };
    }

    createCellElement(colIndex, description) {
        return {
            "key" : colIndex,
            "label" : description
        };
    }

}