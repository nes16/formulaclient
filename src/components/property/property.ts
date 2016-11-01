import { Component, ElementRef, Input, ViewChildren, QueryList } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { App, NavController } from 'ionic-angular';
import { DataService } from '../../providers/data-service'
import { UIStateService } from '../../providers/ui-state-service'
import { ResourceListPage } from '../../pages/resource-list'
import { BaseComponent } from '../base-component'
import { UnitComponent } from '../unit/unit'
import { DetailPage } from '../../pages/detail/detail';
import { createUniqueNameValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-property',
	templateUrl: 'property.html',
})

export class PropertyComponent extends BaseComponent{
	expand: boolean = false;
	errorMessage: string;
	detailPage: any;

	
	form:FormGroup;

	constructor(public el: ElementRef,
				 app:App,
				 dataService: DataService, 
				 nav: NavController,
				 public uiStateService:UIStateService) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	
	@Input() resource;
	@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>;
	@Input() mode = 'list';
	@Input() index = null;
	@Input() last = null;
	
	ngOnInit() {
		super.ngOnInit();
		if(this.mode == 'edit'){
		this.form = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
									, Validators.minLength(2)
									, Validators.maxLength(30)], 
									createUniqueNameValidator(this.dataService, this))
			})	
		}
	}

	ngAfterViewInit(){
	//	var a = this.unitForm 
	}
		
	

	onEditCmd(evt) {
		super.onEditCmd(evt);
	}

	showUnits(evt){
		this.nav.push(ResourceListPage, {type:"units", prop:this.resource})
	}

	get diagnostic() { return JSON.stringify(this.resource.getState()) 
						+'\n'+JSON.stringify(this.resource.DefaultUnit.getState())
						+ '\n'+JSON.stringify(this.form.valid);}
}
