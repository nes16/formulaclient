import {Component, ElementRef, Input, Output, EventEmitter} from '@angular/core';
import {DataService} from '../../services/data-service';
import {UIStateService} from '../../services/ui-state-service';
import {App, IONIC_DIRECTIVES, NavController} from 'ionic-angular';
import {BaseResource} from '../base-resource';
import {BaseComponent} from '../base-component'
import {FormulaComponent} from '../formula/formula';
import {Category} from '../../types/standard'
/*
 * Used to group various resource into category
 *
 *Creating category
 * '+'' from menubar or sub category
 * action list display new resource or category
 *
 *Moving sub category 
 *  Long press to select and more UI into select mode.
 *  Select multiple category already in expanded
 *  Click move from menubar
 *
 *Editing category name
 *  The name of category can be changed in select mode
 *
 *Deleting category
 *  
 *'Others' category
 *  This is virtual category
 *  Uncategoried resources are displayed in this category
 *  
 *Searching category 
 *  In search bar select category from dropdown
 *  to start searching category names.
 *  It is also possible to list only few categories
 *
 */
@Component({
	selector: 'fl-category',
	templateUrl: 'build/components/category/category.html',
	directives: [IONIC_DIRECTIVES, BaseResource,  CategoryComponent]
})
export class CategoryComponent extends BaseComponent {
	expand: boolean = false;
	children:Category[] = [];
	constructor(dataService: DataService,
			     app: App,
				 nav: NavController,
				 public el: ElementRef,
				 public uiStateService: UIStateService
				 ) {
		super(app, dataService, nav, uiStateService);
	}


	ngOnInit() {
		super.ngOnInit();
		if (this.expand)
			this.children = this.resource.children;
		else
			this.children = [];
	}

	onExpand(evt) {
		this.expand = !this.expand;
		if (!this.expand) {
			this.children = [];
		}
		evt.stopPropagation();
		evt.preventDefault();
	}
	
}
