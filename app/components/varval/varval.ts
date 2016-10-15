import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';
import { IONIC_DIRECTIVES, NavController, App } from 'ionic-angular';

import { Formula, Property, Unit, Variable, Global, Measure , FG, Varval, ValueU} from '../../types/standard';
import { DataService } from '../../services/data-service';
import { UIStateService } from '../../services/ui-state-service';
import { LatexParserService } from '../../services/latex-parser-service';
import { BaseResource } from '../base-resource'
import { BaseComponent } from '../base-component'
import { MathQ } from '../mathquill';
import { MathQValueAccessor } from '../mathquill-accessor';
import { VarComponent } from '../variable/variable';
import { GlobalComponent } from '../global/global';
import { UnitSelector } from '../selectors/unit';
import { UnitValueAccessor } from '../selectors/unit-accessor';
import { DetailPage } from '../../pages/detail/detail';
import { Observable } from 'rxjs/Observable';
import { symbolValidator, createMeasureValidator, createFormulaValidator,  createUniqueNameValidator, createUniqueSymbolValidator  } from '../validators/custom.validators'
import { FBError } from '../fb-error';
import { ErrorHandler } from '../../types/standard';

@Component({
	selector: 'fl-varval',
	templateUrl: 'build/components/varval/varval.html',
	directives: [IONIC_DIRECTIVES
				, BaseResource
				, MathQ
				, VarComponent
				, GlobalComponent
				, MathQValueAccessor
				, UnitSelector
				, UnitValueAccessor
				, FBError],
	providers: [LatexParserService]

	
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
				 private parser: LatexParserService,
				 public uiStateService: UIStateService
				 ) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}

	//@Input() resource:Formula; 

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
                this.form.addControl("Var"+i,  new FormControl(vv._values[v.symbol], [Validators.required]))
            })

			this.form.valueChanges.subscribe(r => {
				if(this.form.valid){
					vv.evaluate();
				}
			})
		}
		
		
	}

	
	evaluate(){

	}

	getVariables(){
		let r = this.resource as Varval;
		return r._formula._variables;
	}

	getFormatedValues(){
		return this.resource.variables;
	}
}
