import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators} from '@angular/common';
import { IONIC_DIRECTIVES, NavController } from 'ionic-angular';
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
				, UnitValueAccessor],
	providers: [LatexParserService]

	
})
export class FormulaComponent extends BaseComponent {
	
	rootNode: any;
	timer: any;
	value: any;
	detailPage: any;

	constructor(dataService: DataService,
				 nav: NavController,
				 public el: ElementRef,
				 public fb: FormBuilder,
				 private parser: LatexParserService,
				 public uiStateService: UIStateService
				 ) {
		super(dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}

	//@Input() resource:Formula; 

	ngOnInit() {
		super.ngOnInit();
		let controls = {
			name: [this.resource.name, Validators.required],
			symbol: [this.resource.symbol, Validators.required],
			latex: [this.resource.latex, Validators.required],
			measure:[this.resource.Measure, Validators.required]
		}
		
		this.form = this.fb.group(controls)
		this.form.controls['latex'].valueChanges
			.subscribe(
			(value: string) => {
				this.value = value;
				clearTimeout(this.timer);
				this.timer = setTimeout(() => {
					this.value = value;
					this.updateVariables(this.value);
				}, Math.round(2000));
			    })
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
		var subscribtion =
		this.uiStateService.ole.subscribe(i => {
						if(i.type == "edit"){
							if(i.status == 'success'){
								var fg = new FG({});
								[fg.Global, fg.Formula] = [i.resource, this.resource];
								this.resource.Globals.push(fg);
							}
							subscribtion.unsubscribe();
						}
					},err=>{
						console.log('Error unable to save global constant')
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
