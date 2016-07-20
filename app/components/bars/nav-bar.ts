import {Component, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {IONIC_DIRECTIVES, Modal, NavController, IonicApp} from 'ionic-angular';
import {MoreOptions} from '../../pages/more-options/more-options';
import {AllModals} from '../../pages/all-modals/all-modals';
import {UIStateService} from '../../services/ui-state-service';
/*
 *nav bar
 *Mode:
 *Normal
 *Search
 *Edit
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */
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
	constructor(public el: ElementRef
				, public app: IonicApp
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
	    let moreOptions = Modal.create(MoreOptions, { 'authenticated': this.uiStateService.authenticated });
	    let nav = this.app.getComponent('nav');

	     moreOptions.onDismiss(data => {
	       let modals = Modal.create(AllModals, data);
	       nav.present(modals);
	     });
	     nav.present(moreOptions);
	  }

	refresh(evt){
		let nav = this.app.getComponent('nav');
		let v = nav.getActive();
		let ct = v.componentType;
		nav.pop();
		//this._templateCompiler.clearCache();
		nav.push(ct);
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