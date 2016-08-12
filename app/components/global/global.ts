import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';
import { IONIC_DIRECTIVES, NavController, App } from 'ionic-angular';
import { Property, Unit } from '../../types/standard';
import { DataService } from '../../services/data-service';
import { UIStateService } from '../../services/ui-state-service';
import { BaseComponent } from '../base-component'
import { BaseResource } from '../base-resource'
import { MathQ } from '../mathquill';
import { MathQValueAccessor } from '../mathquill-accessor';
import { UnitSelector } from '../selectors/unit';
import { UnitValueAccessor } from '../selectors/unit-accessor';
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, numberValidator, createMeasureValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-global',
	templateUrl: 'build/components/global/global.html',
	directives: [IONIC_DIRECTIVES/*, BaseResource*/, MathQ, MathQValueAccessor, UnitSelector, UnitValueAccessor]
})
export class GlobalComponent extends BaseComponent {
	detailPage: any;

	form:FormGroup;

	constructor(dataService: DataService,
	  app: App,
	  nav: NavController,
	  private el: ElementRef, 
	  public uiStateService: UIStateService
	  ) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	@Output('moveToVariable') moveToVariable = new EventEmitter();
	@Input() resource;
	@Input() mode = 'list';
	@Input() index = null;
	@Input() last = null;
	
	ngOnInit() {
		super.ngOnInit();
		if(this.mode == 'edit'){
			this.form = new FormGroup({
				name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)],createUniqueNameValidator(this.dataService, "globals", this.resource)),
				value: new FormControl(this.resource.value, [Validators.required
											, numberValidator]),
				symbol: new FormControl(this.resource.symbol, [Validators.required
											, symbolValidator], createUniqueSymbolValidator(this.dataService, "globals", this.resource)),
				measure: new FormControl(this.resource.measure, [Validators.required
											, createMeasureValidator(false, true)]),
			})
		}

	}

	move(evt){
		this.moveToVariable.emit(this.resource);
	}


}
