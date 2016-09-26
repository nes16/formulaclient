import { Component, ElementRef, Renderer, Input, Output, EventEmitter, ViewChild, QueryList } from '@angular/core';
import { Keys } from './keys';
import { IONIC_DIRECTIVES, Modal, NavController } from 'ionic-angular';
import { MQService } from '../services/mq-service';
import { UIStateService } from '../services/ui-state-service';
import { Unit } from '../types/standard';

@Component({
	selector: 'mathq',
	template: `
				<span #mq style="font-size:15pt">x\\cdot5</span>
				`
				,
	directives:[IONIC_DIRECTIVES]
})
export class MathQ {
	mathelem: any;
	listeners: Array<any> = [];
	writing: boolean = false;
	latex: string = "";
	constructor( public el:ElementRef,
				 private renderer: Renderer,
				 private mqService:MQService,
				 private nav: NavController,
				 public uiStateService:UIStateService){
	}

	@Input() editable = false;
	@Output('change') change = new EventEmitter();
	@ViewChild('mq') spanElem;	
	

	ngOnInit() {
	}
	//updATE units set factor="\left(x+459.67\right)\cdot\frac{5}{9}" where id=489
	//select factor from units where id=489
	ngAfterViewInit(){
		var _self = this;
		var MQ = this.mqService.getInterface();
		
		if(this.editable){
			this.mathelem = MQ.MathField(this.spanElem.nativeElement, {
			   spaceBehavesLikeTab: true,
			   substituteTextarea:function() {
			   			var elem = document.createElement('span');
			   			elem.setAttribute("tabindex", "0");
    					return elem;
    				},
			   handlers: {
				   edit: function(mq) {
					   if(!_self.writing)
					   _self.change.emit(mq.latex());
				   }
			   }
			 });
		}else{
			
			this.mathelem = MQ.StaticMath(this.spanElem.nativeElement);
		}
				
		this.writeValue(this.latex);
		this.listeners.push(this.renderer.listen(this.mathelem.el(), 'focusin', (event) => {
			if(this.editable){
				this.mqService.curElem = this.mathelem;
				this.mqService.showKeyboard = true;
				if(this.uiStateService.content){
					this.uiStateService.content.resize();
					this.scrollTo();
				}
			}
    	}));

		this.listeners.push(this.renderer.listen(this.mathelem.el(), 'focusout', (event) => {
			this.mqService.showKeyboard = false;
			if(this.uiStateService.content)
				this.uiStateService.content.resize();
    	}));
	}

	scrollTo() {
	let content = this.uiStateService.Content;
		let dim = content.getDimensions();
		let height = dim.height;
	    //Scroll only if the controll is bottom
	    let y = this.el.nativeElement.closest('.item').offsetTop;
	    if (height < y)
	          content.scrollTo(0, y - 20, 200);
	}

	writeValue(obj: any): void{
		if (this.mathelem && this.mathelem.latex() != obj) {
			this.writing = true;
			this.mathelem.latex(obj);
			this.writing = false;
		}
		else
			this.latex = obj;
	}

	ngDestroy(){
		//Destroy listeners
		this.listeners.map(l => l());
	}
}

