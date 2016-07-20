import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators} from '@angular/common';
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

@Component({
	selector: 'fl-global',
	templateUrl: 'build/components/global/global.html',
	directives: [IONIC_DIRECTIVES/*, BaseResource*/, MathQ, MathQValueAccessor, UnitSelector, UnitValueAccessor]
})
export class GlobalComponent extends BaseComponent {
	detailPage: any;

	constructor(dataService: DataService,
	  nav: NavController,
	  private el: ElementRef, 
	  public fb: FormBuilder,
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
		this.form = this.fb.group({
			name: [this.resource.name, Validators.required],
			value: [this.resource.value, Validators.required],
			symbol: [this.resource.symbol, Validators.required],
			measure: [this.resource.Measure]
		})
	}

	move(evt){
		this.moveToVariable.emit(this.resource);
	}
}
