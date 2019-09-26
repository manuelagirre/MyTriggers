import { LightningElement, api, track } from 'lwc';

/**
 * Show an item
 */
export default class Child extends LightningElement {
    @api
    mdtAsList;

    get filterOptions() {
        var optionsTiming = [];
        var includedTiming = [];

        var optionsDml = [];
        var includedDmls = [];

        var optionsSobject = [];
        var includedSobjects = [];

        var optionsClasses = [];
        var includedClasses = [];

        for (var i = 0; i < this.mdtAsList.length; i++) {

            var mdtRow = this.mdtAsList[i];
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
        var mapped = this.mapTheData(this.getCustomMDTs(), filter);

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

        var possibleDMLs = ['INSERT', 'UPDATE', 'DELETE', 'UNDELETE'];
        var possibleTimings = ['BEFORE', 'AFTER'];

        for (var mdtIndexer = 0; mdtIndexer < mdtData.length; mdtIndexer++) {
            var mdtRow = mdtData[mdtIndexer];
            var clasName = mdtRow.Class__c;
            var triggerEventDML = mdtRow.Event__c.split('_')[1];
            var triggerEventTime = mdtRow.Event__c.split('_')[0];
            var sobject = mdtRow.sObject__c;
            
            //console.log(clasName + ' ' + triggerEventDML + ' ' + triggerEventTime + ' ' + sobject);
            if (clasName === filter.classValue) {
                if (filter.crudValue.includes(triggerEventDML)) {

                    var grandParent = mapped[possibleDMLs.indexOf(triggerEventDML)];
                    if (grandParent == undefined) {
                        mapped[possibleDMLs.indexOf(triggerEventDML)] = {
                            "title" : triggerEventDML,
                            "key" : triggerEventDML,
                            "rows" : []
                        };
                        grandParent = mapped[possibleDMLs.indexOf(triggerEventDML)];
                    }

                    if (filter.timingValue.includes(triggerEventTime)) {

                        var parent = grandParent.rows[possibleTimings.indexOf(triggerEventTime)];
                        if (parent == undefined) {
                            grandParent.rows[possibleTimings.indexOf(triggerEventTime)] = {
                                "title" : triggerEventTime,
                                "key" : triggerEventTime,
                                "isLastRow" : "false",
                                "elements" : []
                            };
                            parent = grandParent.rows[possibleTimings.indexOf(triggerEventTime)];
                        }

                        parent.elements[filter.sobjectsValues.indexOf(sobject)] = {
                            "label" : mdtRow.Description__c,
                            "key" : filter.sobjectsValues.indexOf(sobject)
                        };

                    }

                }
            }
            
        }

        return mapped;
    }

    getCustomMDTs(){
        return this.mdtAsList;
    }
}
