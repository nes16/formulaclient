import { Component, ElementRef, Input, Output, EventEmitter } from '@angular/core';
import { NavController, App } from 'ionic-angular';
import { MoreOptionsPage } from '../../pages/more-options/more-options';
import { UIStateService } from '../../providers/ui-state-service';
import { PopoverController } from 'ionic-angular';
import { CategoryPage } from '../../pages/category/category'

@Component({
	selector: 'fl-nav-bar',
	templateUrl: 'fl-nav-bar.html',
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
	@Input() closeButton = false;
	@Input() title;
	@Output('onFilterChange') onFilterChange = new EventEmitter();
	@Output('onFilterCancel') onFilterCancel = new EventEmitter();
	@Output('onAdd') onAdd = new EventEmitter();  
	@Output('onClose') onClose = new EventEmitter();  

	search(evt){
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
	    let opts = this.popoverCtrl.create(MoreOptionsPage)
	     opts.present({ev:evt});
	}

	add(evt){
		this.onAdd.emit(evt)
	}

	close(evt){
		this.onClose.emit(evt);
	}

	get Online(){
		return this.uiStateService.IsOnline;
	}

	sync(evt){
		this.uiStateService.fireSync();
	}

	filter(evt){
		let opts = this.popoverCtrl.create(CategoryPage)
	     opts.present({ev:evt});
	}
}