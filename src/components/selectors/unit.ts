import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { ViewController, NavController } from 'ionic-angular';

import { DataService } from '../../providers/data-service'
import { UIStateService } from '../../providers/ui-state-service'
import { Measure } from '../../lib/types/standard';
import { ErrorHandler } from '../../lib/types/standard';


@Component({
	selector: 'fl-unit-sel',
	//<input  type="text" class="mathelem" id="mathelem"/>
	template: `
	<template [ngIf]="mode != 'edit'">
		<mathq *ngIf="latex?.length" [(ngModel)]="latex">Test</mathq>
		<span  *ngIf="name?.length">{{name}}</span>
	</template>
	
	<div *ngIf="mode == 'edit'" type="input" (click)="select()">
		<mathq *ngIf="latex?.length" [(ngModel)]="latex"></mathq>
		<span *ngIf="name?.length">{{name}}</span>
		<button ion-button small clear  type="input" (click)="clear($event)"><ion-icon icon-small name="close"></ion-icon>
		</button>
	</div>
	`
	,
})
export class UnitSelector {
	name: string ="None";
	latex: string = "";
	errorMessage: string;

	constructor(public el: ElementRef,
		public viewCtrl: ViewController,
		public dataService: DataService,
		public nav: NavController, 
		public uiStateService: UIStateService) {

	}

	@Input() measure;
	@Input() mode;
	@Output('change') change = new EventEmitter();

	ngOnInit() {
		if (this.measure)
			this._writeValue(this.measure);
	}


	writeValue(obj: any) {
		this._writeValue(obj);
	}
	_writeValue(obj: any): void {
		if(obj){
			this.latex = obj.Latex;//TODO:Fix design issue
			this.name = obj.Name;
		}
	}

	clear(evt){
		this.name = "None";
		this.latex = "";
		evt.stopPropagation();
        evt.preventDefault();
		this.change.emit(new Measure(null)) 
	}

	select() {
		var type = UIStateService.event_types.resource_selected;
		var subscribtion = this.uiStateService.ole.subscribe(sel => {
			if(sel.type == type)
			{
				if(sel.status == 'success'){
					var measure = new Measure(sel.resource)
					this.writeValue(measure); 
					this.change.emit(measure) 
				}
				subscribtion.unsubscribe();
			}
		}, error=>{
			ErrorHandler.handle(error, "UnitSelector::select", true);
		}, ()=>{
			console.log('Subscribtion completed in select')
		});
		this.uiStateService.inSelectMode = true;
		this.uiStateService.tabsPage.setResourcePage("properties");
	}
}

