import { LightningElement, api, track } from 'lwc';

/**
 * Show an item
 */
export default class EventCentricFilter extends LightningElement {
    @track valueSobjects = [];
    @track valueClasses = [];
    @track valueBA = '';
    @track valueCRUD = '';
   
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
        this.valueClasses = event.detail.value;
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
        var valueClasses = [];
        for (var i = 0; i < this.valueClasses.length; i++) {
            valueClasses.push(this.valueClasses[i]);
        }

        var valueSobjects = [];
        for (var i = 0; i < this.valueSobjects.length; i++) {
            valueSobjects.push(this.valueSobjects[i]);
        }

        this.dispatchEvent(
            new CustomEvent(
                'filterchange', 
                { 
                    detail: {
                        "classValue" : valueClasses,
                        "sobjectsValues" : valueSobjects,
                        "crudValue" : this.valueCRUD,
                        "timingValue" : this.valueBA
                    }
                }
            )
        );
    }
}