import {LightningElement, api} from 'lwc';

export default class CellComponent extends LightningElement {

	@api
	label;

	@api
	value;

	handleDblClickOnCell(event) {
		console.log("RowComponent@handleDblClickOnCell");
		this.dispatchEvent(
            new CustomEvent(
                'celldblclick', 
                { 
                    detail: this.value,
					bubbles: true,
					composed: true
                }
            )
        );
	}

}