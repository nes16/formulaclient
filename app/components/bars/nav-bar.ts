import {Component, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {IONIC_DIRECTIVES, NavController, App} from 'ionic-angular';
import {MoreOptions} from '../../pages/more-options/more-options';
import {UIStateService} from '../../services/ui-state-service';
import { PopoverController, PopoverOptions } from 'ionic-angular';
import { CategoryFilterPage } from '../../pages/category/category'

@Component({
	selector: 'fl-nav-bar',
	templateUrl: 'build/components/bars/nav-bar.html',
	directives: [IONIC_DIRECTIVES]
})
export class FlNavBar {
	searchQuery:string = "";
	searchBar: boolean = false;
	searchDelay: number = 2000;
	
	constructor(public app: App
			    , public el: ElementRef
				, public nav: NavController
				, public uiStateService:UIStateService
				, public popoverCtrl: PopoverController) {

	}
	//left
	@Input() switchButton;
	//right
	@Input() menuButton;
	@Input() addButton;
	@Input() searchButton;
	@Input() moreButton;
	@Input() filterButton;
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
	    let opts = this.popoverCtrl.create(MoreOptions)
	     opts.present({ev:evt});
	}

	add(evt){
		this.onAdd.emit(evt)
	}

	get Online(){
		return this.uiStateService.IsOnline;
	}

	sync(evt){
		this.uiStateService.fireSync();
	}

	filter(evt){
		let opts = this.popoverCtrl.create(CategoryFilterPage)
	     opts.present({ev:evt});
	}
}