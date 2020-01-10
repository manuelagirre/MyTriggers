import { LightningElement, api, track } from 'lwc';

/**
 * Show an item
 */
export default class BusinessCentricFilter extends LightningElement {

    @track valueBA = []; 
    @track valueCRUD = []; 
    @track valueSobjects = [];
    @track classValue = '';

    @api filterOptions;

    get optionsBA() {
        return this.filterOptions.optionTiming;
    }

    get optionsCRUD() {
        return this.filterOptions.optionDml;
    }

    get optionsSobjects() {
        return this.filterOptions.optionSobject;
    }
    get optionsClasses() {
        return this.filterOptions.optionClass;
    }

    handleClassChange(event) {
        this.classValue = event.detail.value;
        this.dispatchFilterChange();
    }

    handleDMLTypeChange(event) {
        this.valueCRUD = event.detail.value;
        this.dispatchFilterChange();
    }

    handleDMLTimingChange(event) {
        this.valueBA = event.detail.value;
        this.dispatchFilterChange();
    }

    handleSobjectChange(event) {
        this.valueSobjects = event.detail.value;
        this.dispatchFilterChange();
    }

    dispatchFilterChange() {
        var sobjectValues = [];
        for (var i = 0; i < this.valueSobjects.length; i++) {
            sobjectValues.push(this.valueSobjects[i]);
        }

        var crudValues = [];
        for (var i = 0; i < this.valueCRUD.length; i++) {
            crudValues.push(this.valueCRUD[i]);
        }

        var timingValues = [];
        for (var i = 0; i < this.valueBA.length; i++) {
            timingValues.push(this.valueBA[i]);
        }

        this.dispatchEvent(
            new CustomEvent(
                'filterchange', 
                { 
                    detail: {
                        "classValue" : this.classValue,
                        "sobjectsValues" : sobjectValues,
                        "crudValue" : crudValues,
                        "timingValue" : timingValues
                    }
                }
            )
        );
    }
}