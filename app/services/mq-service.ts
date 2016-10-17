import { Injectable } from '@angular/core';
import 'jquery'
import '../lib/mathquill-0.10.1/mathquill'

declare var $: any;
declare var MathQuill: any;

@Injectable()
export class MQService  {
    MQ:any;
    mockProps: any;
    mockUnits:any;
    curElem:any;
    showKeyboard: boolean = false;
    constructor() {
    	this.MQ = MathQuill.getInterface(2); 
    }

    getInterface(){
    	return this.MQ;
    }

	getHtml(latex){
		return this.MQ.StaticMath($('<span>' + latex + '</span>')[0]).html();
	}
}