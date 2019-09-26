import { LightningElement, api, track } from 'lwc';

/**
 * Show an item
 */
export default class SobjectCentricView extends LightningElement {
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
        console.log('SobjectCentricView handleFilterChange');
        var filter = event.detail;
        console.log(filter.classValue);
        console.log(filter.sobjectsValues);
        console.log(filter.crudValue);
        console.log(filter.timingValue);

        var headers = [];
        for (var index = 0; index < filter.classValue.length; index++) {
            headers.push({
                "label" : filter.classValue[index],
                "key" : filter.classValue[index]
            });
        }
        var mapped = this.mapTheData(this.getCustomMDTs(), filter, headers);

        var tableCells = [];
        for (var index = 0; index < mapped.length; index++) {
            tableCells.push(mapped[index]);
        }

        console.log(tableCells);

        var table = this.template.querySelector('c-table-component');
        table.update(headers, tableCells);
    }

    mapTheData(mdtDataAsList, filter, headers) {
        console.log('SobjectCentricView mapTheData');
        //console.log(mdtDataAsList);
        var mdtData = mdtDataAsList;
        var mapped = [];

        var possibleDMLs = ['INSERT', 'UPDATE', 'DELETE', 'UNDELETE'];
        var possibleTimings = ['BEFORE', 'AFTER'];

        //console.log('SobjectCentricView before possible');
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
        //console.log(possibleOrderNumbers);

        for (var mdtIndexer = 0; mdtIndexer < mdtData.length; mdtIndexer++) {
            var mdtRow = mdtData[mdtIndexer];
            var clasName = mdtRow.Class__c;
            var triggerEventDML = mdtRow.Event__c.split('_')[1];
            var triggerEventTime = mdtRow.Event__c.split('_')[0];
            var sobject = mdtRow.sObject__c;
            var orderNumber = mdtRow.Order__c;
            
            //console.log(clasName + ' ' + triggerEventDML + ' ' + triggerEventTime + ' ' + sobject);
            if (sobject === filter.sobjectsValues) {
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

                        if (filter.classValue.includes(clasName)) {

                            var parent = grandParent.rows[possibleTimings.indexOf(triggerEventTime)];
                            if (parent == undefined) {
                                grandParent.rows[possibleTimings.indexOf(triggerEventTime)] = {
                                    "title" : triggerEventTime,
                                    "key" : triggerEventTime,
                                    "isLastRow" : "false",
                                    "isMultipleRows" : "true",
                                    "elements" : []
                                };
                                parent = grandParent.rows[possibleTimings.indexOf(triggerEventTime)];
                            }

                            var rowIndex = possibleOrderNumbers.indexOf(orderNumber);
                            //console.log(rowIndex);

                            if (parent.elements[rowIndex] == undefined) {
                                parent.elements[rowIndex] = {
                                    "key" : rowIndex,
                                    "elements" : []
                                };
                            }

                            var rowElement = parent.elements[rowIndex];
                            rowElement.elements[filter.classValue.indexOf(clasName)] = {
                                "label" : mdtRow.Description__c,
                                "key" : filter.classValue.indexOf(clasName)
                            };
                        
                        }

                    }

                }
            }
            
        }
        //console.log('mapped before');
        //console.log(mapped);

        //console.log('mapped after');

        for (var dmlIndex = 0; dmlIndex < mapped.length; dmlIndex++) {
            var dmlElement = mapped[dmlIndex];
            //console.log(dmlElement);
            for (var timingIndex = 0; timingIndex < dmlElement.rows.length; timingIndex++){
                var timingElement = dmlElement.rows[timingIndex];

                if (timingElement != undefined) {
                    //console.log(timingElement);
                    for (var rowy = 0; rowy < possibleOrderNumbers.length; rowy++) {
                        var rowElement = timingElement.elements[rowy];

                        if (rowElement != undefined) {
                            //console.log(rowElement);
                            for (var coly = 0; coly < headers.length; coly++) {
                                if (rowElement.elements[coly] == undefined) {
                                    rowElement.elements[coly] = {
                                        "label" : "",
                                        "key" : coly
                                    };
                                }
                            }

                        }
                    }
                }

            }

        }
        //console.log(mapped);
        return mapped;
    }

    getCustomMDTs(){
        return this.mdtAsList;
    }

}