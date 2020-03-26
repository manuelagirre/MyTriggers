import { LightningElement, track, wire } from 'lwc';
import getMDTRowsApex from '@salesforce/apex/MyTriggers.getAllTriggerHandlerSettings';

export default class MyTriggersViewer extends LightningElement {

    @wire(getMDTRowsApex)
    mdtFromApex;


	_currentRecord;

	get modalWindow() {
		return this.template.querySelector("c-modal-window");
	}
	
	get modalButtons(){
		return [
			{
				"label": "OK",
				"click": function(){
					this.dispatchEvent(
						new CustomEvent(
							'okclick', 
							{ 
								bubbles: true,
								composed: true
							}
						)
					);
					this.close();
				},
				"class":"slds-button slds-button_brand"
			},
			{
				"label": "Cancel",
				"click": function(){
					this.close();
				},
				"class":"slds-button slds-button_neutral"
			}
		];
	}

	get currentRecord() {
		return this._currentRecord;
	}

	get mdtById() {
		let mdtRaw = this.mdtFromApex.data;
		let mapped = new Map();
		for (let index = 0; index < mdtRaw.length; index++) {
			mapped.set(mdtRaw[index].Id, mdtRaw[index]);
		}
		return mapped;
	}

    handleCellDblClick(event) {
		console.log("MyTriggersViewer@handleCellDblClick");
		console.log(event.detail);		

		this._currentRecord = this.mdtById.get(event.detail);
		this.modalWindow.show();
	}

	handleMetadataChange(event) {
		console.log(JSON.stringify(event.detail));
	}

	handleOkClick(event) {
		console.log("ok clicked");
	}
}