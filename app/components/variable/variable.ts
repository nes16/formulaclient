import {Component, ElementRef, Input, Output, EventEmitter, Query, ViewChildren, QueryList} from '@angular/core';
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';

import { DataService } from '../../services/data-service'
import { UIStateService } from '../../services/ui-state-service'
import { BaseResource } from '../base-resource'
import { BaseComponent } from '../base-component'
import { MathQ } from '../mathquill';
import { MathQValueAccessor } from '../mathquill-accessor';
import { UnitSelector } from '../selectors/unit';
import { UnitValueAccessor } from '../selectors/unit-accessor';
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, createMeasureValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-var',
	templateUrl: 'build/components/variable/variable.html',
	directives: [IONIC_DIRECTIVES, BaseResource, MathQ, MathQValueAccessor, UnitSelector, UnitValueAccessor]
})

export class VarComponent extends BaseComponent {
	
	
	form:FormGroup;

	constructor(dataService: DataService,
		nav: NavController,
		public uiStateService: UIStateService

	) {
		super(dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	@Input() resource;
	@Input() mode = 'list';
	
	@Output('moveToGlobal') moveToGlobal = new EventEmitter();


	ngOnInit() {
		super.ngOnInit();
		this.form  = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
										, Validators.minLength(5)
										, Validators.maxLength(30)]),
			symbol: new FormControl(this.resource.symbol, [Validators.required
														,symbolValidator]),
			measure: new FormControl(this.resource.measure, [Validators.required
														,createMeasureValidator(false,false)])
		})
	}

	edit(evt, value) {
		this.nav.pop();
	}

	move(evt){
		this.moveToGlobal.emit(this.resource);
	}

	setButtonName(resource){
		this.submitButtonName = 'Done';
	}
}
