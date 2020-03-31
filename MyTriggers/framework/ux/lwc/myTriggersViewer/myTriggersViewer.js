import { LightningElement, track, wire } from 'lwc';
import getMDTRowsApex from '@salesforce/apex/MyTriggers.getAllTriggerHandlerSettings';
import updateMetadata from '@salesforce/apex/CreateUpdateMetadataUtils.updateMdt';
import checkDeployment from '@salesforce/apex/CreateUpdateMetadataUtils.checkMdt';
import getAllSObjects from '@salesforce/apex/CreateUpdateMetadataUtils.getSobjects';

export default class MyTriggersViewer extends LightningElement {

    @wire(getAllSObjects)
    allSobjectOptions;
	
	_currentRecord;
	currentRecordChanged;

	@track
	currentData;
	changedData = new Map();

	currentDeploymentId;

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
		let mdtRaw = this.currentData.data;
		let mapped = new Map();
		for (let index = 0; index < mdtRaw.length; index++) {
			mapped.set(mdtRaw[index].Id, mdtRaw[index]);
		}
		return mapped;
	}

	get mdt() {
		console.log("myTriggerViewer@mdt");
		
		if (this.currentData) {
			console.log("should not refreshData");
			console.log(this.currentData);
			for (let index = 0; index < this.currentData.data.length; index++) {
				let mdtRow = this.currentData.data[index];
				console.log(mdtRow);
				if (this.changedData.get(mdtRow.Id)) {
					this.currentData.data[index].isChanged = true;
				} else {
					this.currentData.data[index].isChanged = false;
				}
			}
		} else {
			console.log("refreshData");
			this.currentData = {};
			this.refreshData();
		}
		/*if (this.mdtFromApex.data) {
			for (let index = 0; index < fromApex.data.length; index++) {
				let mdtRow = fromApex.data[index];
				if (this.changedData.get(mdtRow.Id)) {
					fromApex.data[index].isChanged = true;
				} else {
					fromApex.data[index].isChanged = false;
				}
			}
			console.log(JSON.stringify(fromApex));
			return fromApex;
		} else {
			return this.mdtFromApex;
		}*/
		console.log(this.currentData);
		return this.currentData;
	}

	get sobjectOptions() {
		console.log("MyTriggersViewer get sobjectOptions");
		return this.allSobjectOptions.data;
	}

    handleCellDblClick(event) {
		console.log("MyTriggersViewer@handleCellDblClick");
		console.log(event.detail);		
		console.log(this.changedData.get(event.detail));
		console.log(this.allSobjectOptions);
		if (this.changedData.get(event.detail)) {
			this._currentRecord = this.changedData.get(event.detail);
		} else {
			this._currentRecord = this.mdtById.get(event.detail);
		}
		this.modalWindow.show();
	}

	handleMetadataChange(event) {
		console.log("MyTriggersViewer@handleMetadataChange");
		this.currentRecordChanged = JSON.parse(JSON.stringify(event.detail));
		console.log(this.currentRecordChanged);
	}

	handleOkClick(event) {
		console.log("MyTriggersViewer@handleOkClick");
		if (this.currentRecordChanged != null) {
			this.changedData.set(this.currentRecordChanged.Id, this.currentRecordChanged);
		}
		this._currentRecord = null;
		console.log(this.changedData);
		console.log("ok clicked");
	}

	handleSaveChangedClick(event) {
		console.log("MyTriggersViewer@handleSaveChangedClick");

		console.log(this.changedData);

		let toUpdate = [];
		this.changedData.forEach(function(value){
			toUpdate.push(value);
		});
		console.log(toUpdate);
		updateMetadata(
			{ 
				metadataAsString: JSON.stringify(toUpdate)
			}
		).then(result => {
			this.currentDeploymentId = result;
			setTimeout(
				() => {
					this.asyncCheckDeployment();
				}, 
				2000
			);
            console.log(result); 
        })
        .catch(error => {
            console.log(error);
        });
	}

	asyncCheckDeployment() {
		console.log("asyncCheckDeployment");
		checkDeployment(
			{
				deploymentId : this.currentDeploymentId
			}
		).then(
			result => {
				if (result.isSuccess && result.isDeployed) {
					console.log(result);
					this.changedData = new Map();
					this.refreshData();
				} else if (result.isSuccess && !result.isDeployed){
					setTimeout(
						() => {
							this.asyncCheckDeployment();
						}, 
						1000
					);
				} else {
					console.log(result);
				}
				
			}
		).catch(
			error => {
				console.log(error);
			}
		);
	}

	refreshData() {
		getMDTRowsApex()
		.then(
			result => {
				console.log("refreshData -> getMDTRowsApex -> result");
				this.currentData = {"data" : JSON.parse(JSON.stringify(result))};
				
			}
		).catch(
			error => {
				console.log(error);
			}
		);
	}
}