import { Component, ElementRef, Input, Output,  ViewChildren, EventEmitter, QueryList } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators} from '@angular/forms';
import { App, IONIC_DIRECTIVES,  NavController } from 'ionic-angular';

import { Property, Unit } from '../../types/standard';
import { DataService } from '../../services/data-service'
import { UIStateService } from '../../services/ui-state-service'
import { BaseResource } from '../base-resource';
import { ResourceListPage } from '../../pages/resource-list'
import { BaseComponent } from '../base-component'
import { UnitComponent } from '../unit/unit'
import { MathQ } from '../mathquill'
import { MathQValueAccessor } from '../mathquill-accessor';
import { DetailPage } from '../../pages/detail/detail';
import { FBError } from '../fb-error';
import { symbolValidator, numberValidator, createMeasureValidator, createUniqueNameValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-property',
	templateUrl: 'build/components/property/property.html',
	directives: [REACTIVE_FORM_DIRECTIVES, IONIC_DIRECTIVES, BaseResource, UnitComponent, MathQ, MathQValueAccessor, FBError]
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
									createUniqueNameValidator(this.dataService, "properties", this.resource))
			})	
		}
	}

	ngAfterViewInit(){
	//	var a = this.unitForm 
	}
		
	onNewCmd(evt, resource) {
		var unit = this.resource.newUnit();
		super.onNewCmd(evt, unit);
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
