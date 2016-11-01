import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { BaseComponent } from '../base-component'
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, numberValidator, createMeasureValidator, createUniqueNameValidator, createUniqueSymbolValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-global',
	templateUrl: 'global.html',
})
export class GlobalComponent extends BaseComponent {
	detailPage: any;

	form:FormGroup;

	constructor(dataService: DataService,
	  app: App,
	  nav: NavController,
	  public el: ElementRef, 
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
											, Validators.maxLength(30)],createUniqueNameValidator(this.dataService, this)),
				value: new FormControl(this.resource.value, [Validators.required
											, numberValidator]),
				symbol: new FormControl(this.resource.symbol, [Validators.required
											, symbolValidator], createUniqueSymbolValidator(this.dataService,  this)),
				measure: new FormControl(this.resource.Measure, [createMeasureValidator(false, true)]),
			})
		}

	}

	move(evt){
		this.moveToVariable.emit(this.resource);
	}


}
