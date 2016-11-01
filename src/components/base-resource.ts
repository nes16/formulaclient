import { Component, ElementRef, Input } from '@angular/core';

@Component({
	selector: 'fl-base',
	template: `<div></div>`
})
export class BaseResource {

	constructor(public el:ElementRef){
	}

	@Input() resource = null;	
}