import { Component, ElementRef, Input, Output,  ViewChildren, EventEmitter, QueryList } from '@angular/core';
import { Property, Unit } from '../../types/standard';
import { DataService } from '../../services/data-service'
import { UIStateService } from '../../services/ui-state-service'
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';
import { BaseResource } from '../base-resource';
import { FormBuilder, Validators} from '@angular/common';
import { BaseComponent } from '../base-component'
import { UnitComponent } from '../unit/unit'
import { MathQ } from '../mathquill'
import { MathQValueAccessor } from '../mathquill-accessor';
import { DetailPage } from '../../pages/detail/detail';

@Component({
	selector: 'fl-property',
	templateUrl: 'build/components/property/property.html',
	directives: [IONIC_DIRECTIVES, BaseResource, UnitComponent, MathQ, MathQValueAccessor]
})

export class PropertyComponent extends BaseComponent{
	expand: boolean = false;
	form:	 any;
	errorMessage: string;
	detailPage: any;
	constructor(public el: ElementRef,
				 public fb: FormBuilder,
				 dataService: DataService, 
				 nav: NavController,
				 public uiStateService:UIStateService) {
		super(dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	
	@Input() resource;
	@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>;
	@Input() mode = 'list';

	ngOnInit() {
		super.ngOnInit();
		this.form = this.fb.group({
			name: [this.resource.name, Validators.required]
		})
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
}
