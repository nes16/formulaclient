import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/data-service'
import { UIStateService } from '../../providers/ui-state-service'
import { BaseComponent } from '../base-component'
import { DetailPage } from '../../pages/detail/detail';
import { symbolValidator, createMeasureValidator } from '../validators/custom.validators'

@Component({
	selector: 'fl-var',
	templateUrl: 'variable.html',
})

export class VarComponent extends BaseComponent {
	
	
	form:FormGroup;

	constructor(dataService: DataService,
		app:App,
		nav: NavController,
		public uiStateService: UIStateService

	) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}
	@Input() resource;
	@Input() mode = 'list';
	
	@Output('moveToGlobal') moveToGlobal = new EventEmitter();


	ngOnInit() {
		super.ngOnInit();
		if(this.mode == 'edit'){

			this.form  = new FormGroup({
				name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)]),
				symbol: new FormControl(this.resource.symbol, [Validators.required
															,symbolValidator]),
				measure: new FormControl(this.resource.measure, [Validators.required
															,createMeasureValidator(false,false)])
			})
		}
	}

	edit(evt) {
		this.uiStateService.tabsPage.popVar();
	}

	move(evt){
		this.moveToGlobal.emit(this.resource);
	}

	setButtonName(resource){
		this.submitButtonName = 'Done';
	}
}
