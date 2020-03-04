import {LightningElement, api} from 'lwc';

export default class TogglePicklist extends LightningElement {

    @api
    options;

    @api 
    title;

    value =[];

    handleClick(event) {
        console.log(event.target.value);
        if (event.target.variant === 'neutral') {
            event.target.variant = 'brand';
            this.value.push(event.target.value);
        } else {
            event.target.variant = 'neutral';
            var index = this.value.indexOf(event.target.value);
            this.value.splice(index, 1);
        }
        console.log(this.value);
        this.dispatchEvent(
            new CustomEvent(
                'change', 
                { 
                    detail: {
                        'value' : this.value
                    }
                }
            )
        );
    }
}