import { Component, ElementRef, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { App, NavController, ViewController } from 'ionic-angular';
import { BaseComponent } from '../base-component'
import { Category } from '../../lib/types/standard'
import { DetailPage } from '../../pages/detail/detail';
import { createUniqueNameValidator } from '../validators/custom.validators'

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
	templateUrl: 'category.html',
})
export class CategoryComponent extends BaseComponent {
	expand: boolean = false;
	children:Category[] = [];
	detailPage: any;
	add:boolean =false;
	childResource:Category = null;
	childForm:FormGroup;
	constructor(dataService: DataService,
			     app: App,
				 nav: NavController,
				 public el: ElementRef,
				 public uiStateService: UIStateService,
				 public viewController: ViewController
				 ) {
		super(app, dataService, nav, uiStateService);
		this.detailPage = DetailPage;
	}

	
	@Input() resource;
	//@ViewChildren(UnitComponent) unitForm: QueryList<UnitComponent>
	@Input() mode = 'list';
	@Input() query;
	@Input() units;
	@Input() onlyProp = false;
	@Input() index = null;
	@Input() last = null;
	@Input() filter:boolean = false;
	
	ngOnInit() {
		super.ngOnInit();
		if (this.expand)
			this.children = this.resource.children;
		else
			this.children = [];
		if(this.mode == 'edit'){
			this.form = new FormGroup({
				name: new FormControl(this.resource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)],createUniqueNameValidator(this.dataService, this.resource)),
			})
		}		
	}

	onExpand(evt) {
		this.expand = !this.expand;
		if (!this.expand) 
			this.children = [];
		else
			this.children = this.resource.children;

		evt.stopPropagation();
		evt.preventDefault();
	}

	onAddCategory(evt){
		evt.stopPropagation();
		evt.preventDefault();
		this.add = true;
		let r = this.resource as Category
		this.childResource = r.addCategory("New child category");

		if(!this.childForm)
		this.childForm = new FormGroup({
				name: new FormControl(this.childResource.name, [Validators.required
											, Validators.minLength(2)
											, Validators.maxLength(30)],createUniqueNameValidator(this.dataService,  this)),
			})
	}

	onAddSubmit(evt){
		let valid = this.childForm && this.childForm.valid 
		if(!valid)
			return;
		this.dataService.saveItemRecursive(this.childResource)
		.subscribe(res => {
			this.add = false;
			this.childResource = null;
		})
	}

	getPrefix():number{
		return this.resource.getPrefix();
	}

	getIndentedName():number{
		return this.resource.name;
	}

	getStyle(){
		let styles ={
			'padding-left' : this.getPrefix() + "px"
		}

		return styles;
	}

	dismissView(){
		return this.viewController.dismiss();
	}
	
}
