import { LightningElement, api, track } from 'lwc';
import MyTriggerViewBase from 'c/myTriggerViewBase';

/**
 * Show an item
 */
export default class BusinessCentricView extends MyTriggerViewBase {

    @track metadata = [];

    @api
    set customMetadata(value) {
        if (value.data) {
            this.metadata = value.data;
            this.options = this.calculateOptions();
            this.currentFilter = this.calculateDefaultFilter();
        }
    }

    get customMetadata(){
        return this.metadata;
    }

    get rows(){
        let mapped = this.mapTheData(this.metadata, this.currentFilter);

        let tableCells = [];
        for (var index = 0; index < mapped.length; index++) {
            tableCells.push(mapped[index]);
        }
        return tableCells;
    }

    get headers() {
        let headers = [];
        //let filterOpt = this.filterOptions;
        if (this.currentFilter.sobjectsValues) {
            for (let index = 0; index < this.currentFilter.sobjectsValues.length; index++) {
                headers.push({
                    "label" : this.currentFilter.sobjectsValues[index],
                    "key" : this.currentFilter.sobjectsValues[index],
                    "size" : 2
                });
            }
        }
        return headers;
    }

    calculateDefaultFilter() {
        let opt = this.options;
        
        let valueSobjects = [];
        for (var i = 0; i < opt.optionSobject.length; i++) {
            valueSobjects.push(opt.optionSobject[i].value);
        }
        var crudValues = [];
        for (var i = 0; i < opt.optionDml.length; i++) {
            crudValues.push(opt.optionDml[i].value);
        }

        var timingValues = [];
        for (var i = 0; i < opt.optionTiming.length; i++) {
            timingValues.push(opt.optionTiming[i].value);
        }
        return {
            "classValue" : opt.optionClass[0].value,
            "sobjectsValues" : valueSobjects,
            "crudValue" : crudValues,
            "timingValue" : timingValues
        };
    }

    handleFilterChange(event){
        console.log("BusinessCentricView handleFilterChange");
        let filter = event.detail;
        this.currentFilter = filter;

        let headers = [];
        for (var index = 0; index < this.currentFilter.sobjectsValues.length; index++) {
            headers.push({
                "label" : filter.sobjectsValues[index],
                "key" : filter.sobjectsValues[index],
                "size" : 2
            });
        }
        console.log(headers);
        var mapped = this.mapTheData(this.metadata, filter);

        var tableCells = [];
        for (var index = 0; index < mapped.length; index++) {
            tableCells.push(mapped[index]);
        }

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
            "label" : description,
            "key" : key,
            "size" : 2
        };
    }
}