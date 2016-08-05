import {Component, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {IONIC_DIRECTIVES, Modal, ModalOptions, NavController, App} from 'ionic-angular';
import {MoreOptions} from '../../pages/more-options/more-options';
import {AllModals} from '../../pages/all-modals/all-modals';
import {UIStateService} from '../../services/ui-state-service';

@Component({
	selector: 'fl-nav-bar',
	templateUrl: 'build/components/bars/nav-bar.html',
	directives: [IONIC_DIRECTIVES]
})
export class FlNavBar {
	searchQuery:string = "";
	searchBar: boolean = false;
	searchDelay: number = 2000;
	viewType:string = 'All'
	a:ModalOptions;
	constructor(public app: App
			    , public el: ElementRef
				, public nav: NavController
				, public uiStateService:UIStateService) {

	}
	//left
	@Input() switchButton;
	//right
	@Input() menuButton;
	@Input() addButton;
	@Input() searchButton;
	@Input() moreButton;
	@Input() title;
	@Output('onFilterChange') onFilterChange = new EventEmitter();
	@Output('onFilterCancel') onFilterCancel = new EventEmitter();
	@Output('onAdd') onAdd = new EventEmitter();  

	search(){
		if (this.searchBar)
		 	this.searchBar = false;
		else
			this.searchBar = true;
	}

	onCancel(){
		this.onFilterCancel.emit(null);
	}

	onInput(evt) {
		this.onFilterChange.emit(this.searchQuery);
	}



	more(evt){
	    let moreOptions = new Modal(this.app, MoreOptions, { 'authenticated': this.uiStateService.authenticated }, this.a);

	     moreOptions.onDidDismiss(data => {
	       let modals = new Modal(this.app, AllModals, data, this.a);
	       modals.present();
	     });
	     moreOptions.present();
	  }

	refresh(evt){
		let v = this.nav.getActive();
		let ct = v.componentType;
		this.nav.pop();
		//this._templateCompiler.clearCache();
		this.nav.push(ct);
	}

	add(evt){
		this.onAdd.emit(evt)
	}

	get Online(){
		return this.uiStateService.IsOnline;
	}

	switchState(evt){
		this.uiStateService.IsOnline = !this.uiStateService.IsOnline
	}
}