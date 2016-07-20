import { Input, Output, ViewChildren, EventEmitter, QueryList, forwardRef } from '@angular/core';
import { MathQ } from './mathquill';
import { DataService } from '../services/data-service'
import { UIStateService } from '../services/ui-state-service'
import { Unit, States } from '../types/standard';
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';

export class BaseComponent {
	submitButtonName: string;
	form:	 any;
	errorMessage: string;
	expand: boolean = false;
	detailPage: any;
	constructor(public dataService:DataService
				, public nav:NavController
				,public uiStateService:UIStateService = null) {
	}

	@Input() resource;
	//@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>
	@Input() mode = 'list';
	@Input() query;
	@Input() units;
	@Input() onlyProp = false;

	ngOnInit() {
		if(this.resource)
			this.setButtonName(this.resource);
		if(this.dataService[this.resource.getTable()].State == States.CREATED)
			this.dataService[this.resource.getTable()].ole.subscribe()
	}

	setButtonName(resource){
		if(resource.id == null)
		    this.submitButtonName = 'Save';
		else
		    this.submitButtonName = 'Update';
	}
	
	onEditCmd(evt){
		//Save 
		this.resource.enterEdit();
		
		//Load the page
		this.nav.push(this.detailPage, {  'currResource': this.resource })
		evt.stopPropagation();
    	evt.preventDefault();
	}

	onRemoveCmd(evt){
		this.dataService
			.remove(this.resource)
			.subscribe(res=>{},err=>{},()=>{});
		evt.stopPropagation();
    	evt.preventDefault();
	}

	onNewCmd(evt, resource){
		this.nav.push(this.detailPage, {  'currResource': resource })
		if(evt){
			evt.stopPropagation();
	    	evt.preventDefault();
		}
	}

	get Resource(){
		return this.resource;
	}

	onExpandCmd(evt){
		this.expand = !this.expand;
		evt.stopPropagation();
    	evt.preventDefault();
	}

	onDeleteCmd(evt){

	}

	onSelect(evt){
	    if(this.uiStateService.inSelectMode){
	        this.uiStateService.or.next({status:'success', type:'select', resource:this.resource})
	        this.nav.pop();
	    	this.uiStateService.inSelectMode = false;
	    }
	}

	emit(){
		this.uiStateService.or.next({status:'success', type:'edit', resource: this.resource});
		this.nav.pop();
	}

	edit(evt, value){
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(res => {
				this.uiStateService.or.next({status:'success', resource: this.resource});
				//this.nav.pop();
			},err => {

			},()=>{
				this.emit();
			});
	}
}