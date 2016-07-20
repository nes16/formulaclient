import {Component, ElementRef, Input, Output, EventEmitter} from 'angular2/core';
import {DataService} from '../../services/data-service';
import {IONIC_DIRECTIVES, NavController} from 'ionic-angular';
import {BaseResource} from '../base-resource';
import {BaseComponent} from '../base-component'
import {FormulaComponent} from '../formula/formula';
import {Formula} from '../../types/standard'
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
	directives: [IONIC_DIRECTIVES, BaseResource, FormulaComponent, CategoryComponent]
})
export class CategoryComponent extends BaseComponent {
	expand: boolean = false;
	formulas: any = [];
	formulas_cache: any;
	categories: any;
	id: number;
	name: string;
	children: number[];
	leaf:boolean;
	category: any;
	constructor(public dataService: DataService,
		public el: ElementRef,
		nav: NavController
	) {
		super(dataService, nav);
	}


	ngOnInit() {
		super.ngOnInit();
		this.id = this.resource
		this.category = this.cs.find(this.id);
		this.name = this.category[1];
		this.leaf = this.category[2];
		this.children = this.category[3];
		if (this.leaf)
			this.formulas_cache = this.children.map(id => this.formulaService.find(id))
		else
			if (this.expand)
				this.categories = this.children;
			else
				this.categories = [];
	}

	onExpand(evt) {
			this.expand = !this.expand;
			if (!this.expand) {
				this.formulas = [];
				this.categories = [];
			}
			else {
				if (!this.leaf)
					this.categories = this.children;
				else
					this.formulas = this.formulas_cache;
			}
			evt.stopPropagation();
	        evt.preventDefault();
		}
	
}
