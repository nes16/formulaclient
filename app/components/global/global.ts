import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';
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
import { symbolValidator, numberValidator, createMeasureValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-global',
	templateUrl: 'build/components/global/global.html',
	directives: [IONIC_DIRECTIVES/*, BaseResource*/, MathQ, MathQValueAccessor, UnitSelector, UnitValueAccessor]
})
export class GlobalComponent extends BaseComponent {
	detailPage: any;

	form:FormGroup;

	constructor(dataService: DataService,
	  nav: NavController,
	  private el: ElementRef, 
	  public uiStateService: UIStateService
	  ) {
		super(dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	@Output('moveToVariable') moveToVariable = new EventEmitter();
	@Input() resource;
	@Input() mode = 'list';
	
	ngOnInit() {
		super.ngOnInit();
		this.form = new FormGroup({
			name: new FormControl(this.resource.name, [Validators.required
										, Validators.minLength(5)
										, Validators.maxLength(30)]),
			value: new FormControl(this.resource.value, [Validators.required
										, numberValidator]),
			symbol: new FormControl(this.resource.symbol, [Validators.required
										, symbolValidator]),
			measure: new FormControl(this.resource.measure, [Validators.required
										, createMeasureValidator(false, true)]),
		})
	}

	move(evt){
		this.moveToVariable.emit(this.resource);
	}
}
