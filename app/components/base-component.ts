import { Input, Output, ViewChildren, EventEmitter, QueryList, forwardRef } from '@angular/core';
import { MathQ } from './mathquill';
import { DataService } from '../services/data-service'
import { UIStateService } from '../services/ui-state-service'
import { Unit, States } from '../types/standard';
import { IONIC_DIRECTIVES, Modal, NavController, ActionSheet, App } from 'ionic-angular';
import { AllModals } from '../pages/all-modals/all-modals';

export class BaseComponent {
	submitButtonName: string;
	form:	 any;
	errorMessage: string;
	expand: boolean = false;
	detailPage: any;
	
	
	constructor(public app:App,
				public dataService:DataService
				, public nav:NavController
				,public uiStateService:UIStateService = null) {

	}



	@Input() resource;
	//@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>
	@Input() mode = 'list';
	@Input() query;
	@Input() units;
	@Input() onlyProp = false;
	@Input() index = null;
	@Input() last = null;

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
	}
	
	onErrorCmd(evt){
		//Save 
		var error_messages = this.resource.getErrorMessages();
		this.uiStateService.showErrorModal(this.nav, error_messages);
	}

	onRemoveCmd(evt){
		this.dataService
			.removeItem(this.resource)
			.subscribe(res=>{},err=>{},()=>{});
	}

	onNewCmd(evt, resource){
		if(this.dataService.checkOnlineAndErrors(this.resource)){
			this.nav.push(this.detailPage, {  'currResource': resource })
			if(evt){
				evt.stopPropagation();
		    	evt.preventDefault();
			}
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

	showUnits(evt){

	}

	onShare(evt){
		if(this.resource.shared)
			return;
		this.resource.shared = true;
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(res => {

			},err => {

			},()=>{
				this.emit();
			});
	}

	onUnshare(evt){
		if(!this.resource.shared)
			return;
		this.resource.shared = false;
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(res => {

			},err => {

			},()=>{
				this.emit();
			});
	}

	onSelect(evt):boolean{
	    if(this.uiStateService.inSelectMode){
	    	var type = UIStateService.event_types.resource_selected; 
	        this.uiStateService.or.next({status:'success', type:type, resource:this.resource})
	        this.nav.pop();
	    	this.uiStateService.inSelectMode = false;
	    	return true;
	    }
	    return false;
	}

	emit(){
	    var type = UIStateService.event_types.resource_save_complete; 
		this.uiStateService.or.next({status:'success', type:type, resource: this.resource});
		this.nav.pop();
	}

	edit(evt, value){
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(res => {

			},err => {

			},()=>{
				this.emit();
			});
	}
	
	
	presentActionSheet(evt) {
	  if(this.onSelect(evt)) //If in select mode this will be handled by the above function
	  	return;
	  var errorButton = {
	      	text: 'Errors',
	        role: 'destructive',
	        handler: () => {
				this.onErrorCmd(evt);          
	        }	
	  }
	  var newButton = {
	        text: 'Units',
	        handler: () => {
	          this.showUnits(evt);
	        }
	      }

	  var shareButton = {
	        text: 'Share',
	        handler: () => {
	          this.onShare(evt);
	        }
	      }

	  var unshareButton = {
	        text: 'Unshare',
	        handler: () => {
	          this.onUnshare(evt);
	        }
	      }

	  var actionSheetItems = {
	    title: 'Select item command',
	    buttons: [
	      {
	        text: 'Edit',
	        handler: () => {
	          this.onEditCmd(evt);
	        }
	      },
	      {
	        text: 'Delete',
	        role: 'destructive',
	        handler: () => {
				this.onRemoveCmd(evt);          
	        }
	      },
	      {
	        text: 'Cancel',
	        role: 'cancel',
	        handler: () => {
	          console.log('Cancel clicked');
	        }
	      }
	    ]
	  };

	  if(this.resource.hasError() == true){
	  	actionSheetItems.buttons.splice(0, 0, errorButton);
	  }
	  if(this.resource.getTable() == 'properties')
	  	actionSheetItems.buttons.splice(1, 0, newButton) 

	  if(this.uiStateService.authenticated){
		  if(!this.resource.shared && this.resource.user_id)
		  	actionSheetItems.buttons.splice(0, 0, shareButton)
		  else if(this.resource.user_id)
		  	actionSheetItems.buttons.splice(0, 0, unshareButton)
	  }
	  let actionSheet = new ActionSheet(this.app, actionSheetItems);

	  actionSheet.present();
	}

	error(cname){
		var str = '';
		var keys=Object.keys(this.form.controls);
		keys.forEach(i => {
			str = str + this.form.controls[i].status +":" + JSON.stringify(this.form.controls[i].errors) + '\n'	
		})
		return str;
	}

	elementChanged(input){
        let field = input.inputControl.name;
        this[field + "Changed"] = true;
    }

    
}