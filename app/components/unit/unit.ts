import { Component, ElementRef, Input, Output, EventEmitter, ViewChildren, QueryList} from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../services/data-service'
import { UIStateService } from '../../services/ui-state-service'
import { IONIC_DIRECTIVES, NavController, App } from 'ionic-angular';
import { BaseResource } from '../base-resource'
import { BaseComponent } from '../base-component'
import { MathQ } from '../mathquill';
import { MathQValueAccessor } from '../mathquill-accessor';
import { Unit } from '../../types/standard';
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, factorValidator, createUniqueNameValidator, createUniqueSymbolValidator} from '../validators/custom.validators'
import { FBError } from '../fb-error';

@Component({
	selector: 'fl-unit',
	templateUrl: 'build/components/unit/unit.html',
	directives: [IONIC_DIRECTIVES, BaseResource, MathQ, MathQValueAccessor, FBError]
})

export class UnitComponent extends BaseComponent {
	isDefaultUnit: boolean;

	form:FormGroup;
	systems= ["SI", "Others"];

	constructor(
				 public el: ElementRef,
				 app: App,
				 dataService: DataService,
				 nav: NavController,
				 public uiStateService:UIStateService
				 ) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	@Input() resource: Unit;
	@Input() mode = 'list';
	@Input() updateButton: boolean = true;
	ngOnInit() {
		super.ngOnInit();
		this.isDefaultUnit = this.resource.IsDefaultUnit
		if(this.resource.system = "SI")
			this.resource.system=this.systems[0];
		else
			this.resource.system=this.systems[1];
		if(this.mode == 'edit'){
			this.form = new FormGroup({
				name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]
											, createUniqueNameValidator(this.dataService, "units", this.resource)),
				description: new FormControl(this.resource.description, [Validators.minLength(2)
												, Validators.maxLength(50)]),
				symbol: new FormControl(this.resource.symbol, [Validators.required, symbolValidator],createUniqueSymbolValidator(this.dataService, "units", this.resource)),
				factor: new FormControl(this.resource.factor, [Validators.required
											, factorValidator]),
				approx: new FormControl(this.resource.approx)
			
			})
		}
	}

	onEditCmd(evt){
		super.onEditCmd(evt);
	}


	get diagnostic() { return JSON.stringify(this.form.valid) }
	
}
