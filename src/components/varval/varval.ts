import { Component, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, App } from 'ionic-angular';

import { Varval, Variable } from '../../lib/types/standard';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { LatexParserService } from '../../providers/latex-parser-service';
import { BaseComponent } from '../base-component'
import { DetailPage } from '../../pages/detail/detail';

@Component({
	selector: 'fl-varval',
	templateUrl: 'varval.html',
})
export class VarvalComponent extends BaseComponent {
	
	rootNode: any;
	timer: any;
	value: any;
	detailPage: any;
	form:FormGroup;
		

	constructor(dataService: DataService,
			     app: App,
				 nav: NavController,
				 public el: ElementRef,
				 public parser: LatexParserService,
				 public uiStateService: UIStateService
				 ) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}

	//@Input() resource:Formula; 
	@Input() resource;
	//@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>
	@Input() mode = 'list';
	@Input() query;
	@Input() units;
	@Input() onlyProp = false;
	@Input() index = null;
	@Input() last = null;
	@Input() filter:boolean = false;
	
	ngOnInit() {
		super.ngOnInit();
        let vv:Varval = this.resource;

		if(this.mode == 'edit'){
			this.form = new FormGroup({
				name: new FormControl(vv.name, [ Validators.minLength(2)
											, Validators.maxLength(30)]),
                value: new FormControl(vv._result)
            })
            vv._formula.Variables.forEach((v,i) => {
				let fc = new FormControl(vv._values[v.symbol], [Validators.required]) as FormControl;
				this.form.addControl("Var"+i, fc );
				//fc.registerOnChange(this.evaluate);
				// fc.registerOnChange(val => {
				// 	if(this.form.valid)
				// 		vv.evaluate();
				// })
            })

			// this.form.valueChanges.subscribe(r => {
			// 	if(this.form.valid){
			// 		vv.evaluate();
			// 	}
			// })
		}
		
		
	}

	
	evaluate(evt){
		if(evt.srcElement.changeTimeout)
       	 	clearTimeout(evt.srcElement.changeTimeout);
		evt.srcElement.changeTimeout = setTimeout(() => {
			this.resource.evaluate();
        }, 600);
	}

	getVariables():Variable[]{
		let r = this.resource as Varval;
		return r._formula._variables;
	}

	getFormatedValues(){
		return this.resource.variables;
	}
}
