import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';
import { IONIC_DIRECTIVES, NavController, App } from 'ionic-angular';

import { Formula, Property, Unit, Variable, Global, Measure , FG} from '../../types/standard';
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
	selector: 'fl-formula',
	templateUrl: 'build/components/formula/formula.html',
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
export class FormulaComponent extends BaseComponent {
	
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
		if(this.mode == 'edit'){
			this.form = new FormGroup({
				name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)],createUniqueNameValidator(this.dataService, "formulas", this.resource)),
				symbol: new FormControl(this.resource.symbol, [Validators.required
											,symbolValidator], createUniqueSymbolValidator(this.dataService, "formulas", this.resource)),
				latex: new FormControl(this.resource.latex, [Validators.required
											,createFormulaValidator(this.resource)]),
				measure: new FormControl(this.resource.Measure, [Validators.required
											,createMeasureValidator(false, false)])
			})
		}
	}

	moveToVariable(global:FG){
		var [symbol, index] = [global.Global.symbol
								  ,this.resource.Globals.indexOf(global)]
		var v = this.resource.Variables.find(i => i.symbol == symbol);
		if(v)
			v.deleted = null;
		else
			this.resource.Variables.push(new Variable({symbol: symbol}))

		this.resource.Globals.splice(index, 1)
	}

	moveToGlobal(var1:Variable){
		var [symbol, index] = [var1.symbol, this.resource.Variables.indexOf(var1)];
		this.resource.Variables.splice(index, 1);
		var g1 = this.resource.Globals.find(g => g.Global.symbol == symbol);
		if(g1){
			g1.deleted = null;
		}
		else{
			var g = this.dataService.globals.getItem("symbol", symbol) as Global;
			if(g){
				var fg = new FG({})
				[fg.Global, fg.Formula] = [g, this.resource];
				this.resource.Globals.push(fg);
			}
			else{
				this.createGlobal({name:var1.name, symbol:symbol})		
			}
			
		}
	}

	createGlobal(state){
		var g = new Global(state);
		var type = UIStateService.event_types.resource_save_complete;
		var subscribtion =
		this.uiStateService.ole.subscribe(i => {
						if(i.type == type){
							if(i.status == 'success'){
								var fg = new FG({});
								[fg.Global, fg.Formula] = [i.resource, this.resource];
								this.resource.Globals.push(fg);
							}
							subscribtion.unsubscribe();
						}
					},err=>{
						ErrorHandler.handle(err, "FormulaComponent::onRemoveCmd", true);
					},()=>{
					   console.log('The subscription completed')
					})

		this.nav.push(this.detailPage, {'currResource': g })
	}

	undeleted(list){
		return list.filter(i => i.deleted != "true");
	}


	updateVariables(latex) {
	    try {
			this.rootNode = this.parser.parse(latex);
			this.parser.getVarNodes(this.rootNode, this.resource, this.dataService.globals);
	    } catch (e) {
	        this.rootNode = null;
	        //throw (e);
	    }


	}

	edit(evt, value){
		//Ser formula reference in child object		
		this.resource.Globals.forEach(fg => fg.Formula = this.resource);
		this.resource.Variables.forEach(v => v.Formula = this.resource);

		//remove new deleted items
		this.resource.Globals = 
		this.resource.Globals.filter(fg => !(fg.deleted && !fg.id))

		this.resource.Variables = 
		this.resource.Variables.filter(v => !(v.deleted && !v.id))

		super.edit(evt, value);
	}

}
