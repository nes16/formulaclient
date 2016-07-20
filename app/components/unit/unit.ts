import { Component, ElementRef, Input, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
import { FormBuilder, Validators } from '@angular/common';
import { DataService } from '../../services/data-service'
import { UIStateService } from '../../services/ui-state-service'
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';
import { BaseResource } from '../base-resource'
import { BaseComponent } from '../base-component'
import { MathQ } from '../mathquill';
import { MathQValueAccessor } from '../mathquill-accessor';
import { Unit } from '../../types/standard';
import { DetailPage } from '../../pages/detail/detail';


@Component({
	selector: 'fl-unit',
	templateUrl: 'build/components/unit/unit.html',
	directives: [IONIC_DIRECTIVES, BaseResource, MathQ, MathQValueAccessor]
})

export class UnitComponent extends BaseComponent {
	isDefaultUnit: boolean;
	constructor(
				 public el: ElementRef,
				 public fb: FormBuilder,
				 dataService: DataService,
				 nav: NavController,
				 public uiStateService:UIStateService
				 ) {
		super(dataService, nav, uiStateService);
		this.detailPage = DetailPage;

	}
	@Input() resource: Unit;
	@Input() mode = 'list';
	@Input() updateButton: boolean = true;
	ngOnInit() {
		super.ngOnInit();
		this.isDefaultUnit = this.resource.IsDefaultUnit

		this.form = this.fb.group({
			name: [this.resource.name, Validators.required],
			symbol: [this.resource.symbol, Validators.required],
			system: [this.resource.system, Validators.required],
			definition: [this.resource.definition],
			description: [this.resource.description],
			approx: [this.resource.approx],
			factor: [this.resource.factor, Validators.required],
		})
	}

	onEditCmd(evt){
		super.onEditCmd(evt);
	}
	
}
