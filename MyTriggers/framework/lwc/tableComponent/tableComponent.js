import { LightningElement, api, track } from 'lwc';

/**
 * Show an item
 */
export default class TableComponent extends LightningElement {

    @track
    headers = [{"label":"Header","key":"0"}];

    @track
    ghostHeaders = [{"label":"","key":"0"}];

    @track
    rows = [
        {
            "title" : "",
            "key" : "0",
            "rows" : [
                {
                    "title" : "",
                    "key" : "0",
                    "elements" : [
                        {
                            "key" : "0",
                            "elements" : [
                                {
                                    "label" : "",
                                    "key" : "0"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ];

    handleScrollBottom(event){
        var scrollValue = event.detail;

        var triggerSubItems = this.template.querySelectorAll('c-titled-row');
        //console.log("titled row " + triggerSubItems.length);
        for (var index = 0; index < triggerSubItems.length; index++) {
            triggerSubItems[index].scroll(scrollValue);
        }
    }

    @api
    update(headers, rows) {
        console.log("update table");
        //console.log(headers);
        //console.log(rows);

        this.headers = [];
        this.ghostHeaders = [];
        for (var index = 0; index < headers.length; index++) {
            this.headers[index] = {
                "label" : headers[index].label,
                "key" : headers[index].key
            };
            this.ghostHeaders[index] = {
                "label" : "",
                "key" : headers[index].key
            }
            //console.log(this.headers[index]);
        }

        this.rows = [];
        for (var index = 0; index < rows.length; index++) {
            //console.log("dml row " + index + " " + rows[index].title);
            
            if (rows[index] != undefined) {
                var innerRows = [];
                //console.log(rows[index]);
                //console.log(rows[index].rows);
                for (var innerIndex = 0; innerIndex < rows[index].rows.length; innerIndex++) {
                    if (rows[index].rows[innerIndex] != undefined) {
                        //console.log("timing row " + innerIndex + " " + rows[index].rows[innerIndex].title);
                        //console.log(rows[index].rows[innerIndex]);
                        //console.log("elements");
                        //console.log(rows[index].rows[innerIndex].elements);
                        var colElements;
                        if (rows[index].rows[innerIndex].isMultipleRows === "true") {
                            colElements = [];
                            for (var coly = 0; coly < rows[index].rows[innerIndex].elements.length; coly++) {
                                //console.log("inner row " + coly);
                                if (rows[index].rows[innerIndex].elements[coly] != undefined) {
                                    colElements.push(
                                        {
                                            "key" : rows[index].rows[innerIndex].elements[coly].key,
                                            "elements" : rows[index].rows[innerIndex].elements[coly].elements
                                        }
                                    );
                                } else {

                                }
                            }
                        } else {
                            colElements = rows[index].rows[innerIndex].elements;
                        }

                        innerRows.push(
                            {
                                "title" : rows[index].rows[innerIndex].title,
                                "key" : rows[index].rows[innerIndex].key,
                                "isLastRow" : ((((index+1) === rows.length) && ((innerIndex+1) === rows[index].rows.length)) ? "true" : "false"),
                                "isMultipleRows" : rows[index].rows[innerIndex].isMultipleRows,
                                "elements" : colElements
                            }
                        );
                    }
                }

                this.rows.push(
                    {
                        "title" : rows[index].title,
                        "key" : rows[index].key,
                        "rows" : innerRows
                    }
                );
                //console.log(rows[index].rows);
            }
            
        }

        //console.log('data');
        console.log(this.headers);
        console.log(this.rows);
    }

}