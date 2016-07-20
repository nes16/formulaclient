import {Component, ElementRef, Input, Output, EventEmitter, Query, ViewChildren, QueryList} from '@angular/core';
import { FormBuilder, Validators} from '@angular/common';
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';
import { DataService } from '../../services/data-service'
import { UIStateService } from '../../services/ui-state-service'
import { BaseResource } from '../base-resource'
import { BaseComponent } from '../base-component'
import { MathQ } from '../mathquill';
import { MathQValueAccessor } from '../mathquill-accessor';
import { UnitSelector } from '../selectors/unit';
import { UnitValueAccessor } from '../selectors/unit-accessor';
import { DetailPage } from '../../pages/detail/detail';

@Component({
	selector: 'fl-var',
	templateUrl: 'build/components/variable/variable.html',
	directives: [IONIC_DIRECTIVES, BaseResource, MathQ, MathQValueAccessor, UnitSelector, UnitValueAccessor]
})

export class VarComponent extends BaseComponent {
	

	constructor(dataService: DataService,
		public fb: FormBuilder,
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

		this.form = this.fb.group({
			name: [this.resource.name, Validators.required],
			symbol: [this.resource.symbol, Validators.required],
			measure: [this.resource.Measure, Validators.required],
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
