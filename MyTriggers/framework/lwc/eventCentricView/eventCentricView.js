import { LightningElement, api, track } from 'lwc';

/**
 * Show an item
 */
export default class EventCentricView extends LightningElement {
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
        console.log('EventCentricView handleFilterChange');
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
        console.log('EventCentricView mapTheData');
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
            
            //console.log(triggerEventTime + ' ' + triggerEventDML + ' ' + sobject + ' ' + clasName);
            if (filter.classValue.includes(clasName)) {
                if (filter.sobjectsValues.includes(sobject)) {
                    if (filter.crudValue === triggerEventDML && filter.timingValue === triggerEventTime) {
                        console.log(triggerEventTime + ' ' + triggerEventDML + ' ' + sobject + ' ' + clasName);
                        var grandParent = mapped[0];
                        if (grandParent == undefined) {
                            mapped.push(
                                {
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
                            );
                        }
                        
                        var tablePiece = mapped[0].rows[0];
                        console.log(tablePiece);
                        var rowIndex = possibleOrderNumbers.indexOf(orderNumber);
                        console.log(rowIndex);
                        if (tablePiece.elements[rowIndex] == undefined) {
                            tablePiece.elements[rowIndex] = {
                                "key" : rowIndex,
                                "elements" : []
                            };
                        }
                        var rowElement = tablePiece.elements[rowIndex];
                        var colIndex = filter.sobjectsValues.indexOf(sobject);
                        console.log(colIndex);
                        rowElement.elements[colIndex] = {
                            "key" : colIndex,
                            "label" : mdtRow.Description__c
                        };
                    }
                }
                /*if (filter.crudValue.includes(triggerEventDML)) {

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

                }*/
            }
            
        }
        //console.log('mapped before');
        //console.log(mapped);

        //console.log('mapped after');

        console.log(mapped);
        return mapped;
    }

    getCustomMDTs(){
        return this.mdtAsList;
    }

    /*mapTheDataforTimingAndCRUD(timing, crud) {
        var triggerEventContainer = this.mappedMDTData.get(timing + "_" + crud);//"BEFORE_INSERT");
        var rows;
        if (triggerEventContainer !== undefined) {
            rows = triggerEventContainer.mdtRows;
            for (var rowindex = 0; rowindex < rows.length; rowindex++) {
                for (var colindex = 0; colindex < this.valueSobjects.length; colindex++) {
                    //console.log(rowindex + ' ' + colindex);
                    if (rows[rowindex].innerArray[colindex] === undefined) {
                        rows[rowindex].innerArray[colindex] = {
                            "key" : rowindex + '_' + colindex,
                            "className" : ""
                        }
                    }
                }
            }
        } else {
            rows = [];
        }
        //console.log(rows);
        return rows;
    }

    mapTheData(mdtDataAsList) {
        var mdtData = mdtDataAsList;
        var mapped = new Map();
        var rowsArray = [];
        for (var mdtIndexer = 0; mdtIndexer < mdtData.length; mdtIndexer++) {
            var mdtRow = mdtData[mdtIndexer];
            var sobject = mdtRow.sObject__c;
            var triggerEvent = mdtRow.Event__c;
            var clasName = mdtRow.Class__c;
            var orderNumber = mdtRow.Order__c;
            var description = mdtRow.Description__c;
            if (this.valueClasses.includes(clasName) && 
                this.valueSobjects.includes(sobject)) {
                //console.log(clasName + ' ' + triggerEvent + ' ' + sobject);
                if (!mapped.has(triggerEvent)) {
                    mapped.set(triggerEvent, {
                        "rowsArray" : [],
                        "mdtRows" : []
                    });
                }
                var triggerEventContainer = mapped.get(triggerEvent);

                if (!triggerEventContainer.rowsArray.includes(orderNumber)) {
                    triggerEventContainer.rowsArray.push(orderNumber);
                    //console.log('rowsArray.indexOf(orderNumber)');
                    //console.log(triggerEventContainer.rowsArray.indexOf(orderNumber));
                    var rowIndex = triggerEventContainer.rowsArray.indexOf(orderNumber);
                    triggerEventContainer.mdtRows[
                        rowIndex
                    ] = {
                        "isTheFirstRow" : rowIndex == 0,
                        "key" : rowIndex,
                        "order" : orderNumber,
                        "innerArray" : []
                    };
                    //console.log('rowsArray');
                    //console.log(triggerEventContainer.rowsArray);
                    //console.log('triggerEventArray');
                    //console.log(triggerEventContainer);
                }

                var mdtRow = triggerEventContainer.mdtRows[
                    triggerEventContainer.rowsArray.indexOf(orderNumber)
                ];
                //console.log('mdtRow');
                //console.log(mdtRow);
                //console.log('valueClasses.indexOf(clasName)');
                //console.log(this.valueClasses.indexOf(clasName));

                mdtRow.innerArray[this.valueSobjects.indexOf(sobject)] = {
                    "key" : this.valueSobjects.indexOf(sobject),
                    "className" : description
                };

            
            }
        }
        //console.log('mapped');
        //console.log(mapped);
        return mapped;
    }*/

}