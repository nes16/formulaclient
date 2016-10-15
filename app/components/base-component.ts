import { Input, Output, ViewChildren, EventEmitter, QueryList, forwardRef } from '@angular/core';
import { MathQ } from './mathquill';
import { DataService } from '../services/data-service'
import { UIStateService } from '../services/ui-state-service'
import { ResourceCollection, Unit, States, Favorite, Formula } from '../types/standard';
import { IONIC_DIRECTIVES, Modal, NavController, ActionSheet, App } from 'ionic-angular';
import { ErrorHandler } from '../types/standard';
import { ResourceListPage } from '../pages/resource-list'
import { Observable } from 'rxjs/Observable';

export class BaseComponent {
	submitButtonName: string;
	form: any;
	errorMessage: string;
	expand: boolean = false;
	detailPage: any;
	tabsPage:any;


	constructor(public app: App,
		public dataService: DataService
		, public nav: NavController
		, public uiStateService: UIStateService = null
		) {
			 this.tabsPage = uiStateService.tabsPage;

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
		if (this.resource)
			this.setButtonName(this.resource);
		if (this.dataService[this.resource.getTable()].State == States.CREATED)
			this.dataService[this.resource.getTable()].ole
				.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::ngOnInit", true);
				}, () => { })
	}

	setButtonName(resource) {
		if (resource.id == null)
			this.submitButtonName = 'Save';
		else
			this.submitButtonName = 'Update';
	}

	onEditCmd(evt) {
		//Save 
		this.resource.enterEdit();

		//Load the page
		this.openDetailsTab(this.resource);
	}

	onErrorCmd(evt) {
		//Save 
		var error_messages = this.resource.getErrorMessages();
		this.uiStateService.showErrorModal(this.nav, error_messages);
	}

	onRemoveCmd(evt) {
		this.dataService
			.removeItem(this.resource)
			.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onRemoveCmd", true);
				}, () => { })
	}

	onNewCmd(evt, resource) {
		if (this.dataService.checkOnlineAndErrors(this.resource)) {
			this.nav.push(this.detailPage, { 'currResource': resource })
			if (evt) {
				evt.stopPropagation();
				evt.preventDefault();
			}
		}
	}

	get Resource() {
		return this.resource;
	}

	onExpandCmd(evt) {
		this.expand = !this.expand;
		evt.stopPropagation();
		evt.preventDefault();
	}

	onDeleteCmd(evt) {

	}

	showChildren(evt) {

	}

	onFavorite(evt) {
		if (this.resource.Favorite)
			return this.onUnfavorite(evt);
		let f = this.resource.makeFavorite()
		this.dataService
			.saveItemRecursive(f)
			.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onFavorite", true);
				}, () => { })
	}

	onUnfavorite(evt) {
		let f = this.resource.Favorite;
		if (!f)
			return;
		this.dataService
			.removeItem(f)
			.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onUnfavorite", true);
				}, () => { })
	}

	onShare(evt) {
		if (this.resource.shared)
			return;
		this.resource.shared = true;
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onShare", true);
				}, () => { })
	}

	onUnshare(evt) {
		if (!this.resource.shared)
			return;
		this.resource.shared = false;
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onUnshare", true);
				}, () => { })
	}

	onSelect(evt): boolean {
		if (this.uiStateService.inSelectMode) {
			var type = UIStateService.event_types.resource_selected;
			this.uiStateService.or.next({ status: 'success', type: type, resource: this.resource })
			this.nav.pop();
			this.uiStateService.inSelectMode = false;
			return true;
		}
		return false;
	}
	
	emit() {
		var type = UIStateService.event_types.resource_save_complete;
		this.uiStateService.or.next({ status: 'success', type: type, resource: this.resource });
		this.nav.pop();
	}

	edit(evt) {
		this.dataService
			.saveItemRecursive(this.resource)
			.subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::edit", true);
				}, () => { })
	}

	onHistory(evt){
		this.nav.push(ResourceListPage, { type:'varvals', formula: this.resource })
	}

	onRun(evt){
		let val = (this.resource as Formula).newVarval();
		this.openDetailsTab(val)
	}

	onCategory(){
		var type = UIStateService.event_types.resource_selected;
		var subscribtion = this.uiStateService.ole.subscribe(sel => {
			let oles:Observable<any>[] = [];
			if(sel.type == type)
			{
				if(sel.status == 'success'){
					if(this.resource.crs)
						oles.push(this.dataService.removeItem(this.resource.crs));
					let cr = this.resource.setCategory(sel.resource);
					oles.push(this.dataService.saveItemRecursive(cr))
					Observable.from(oles).map(i => i).concatAll().subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onCategory", true);
				}, () => { })
				}
				subscribtion.unsubscribe();
			}
		}, error=>{
			ErrorHandler.handle(error, "Basecomponent::onCategory", true);
		}, ()=>{
			console.log('Subscribtion completed in onCategory')
		});
		this.uiStateService.inSelectMode = true;
		this.nav.push(ResourceListPage, { type:'categories'});
	}

	onRemoveCategory(){
		if(this.resource.crs)
			this.dataService.removeItem(this.resource.crs).subscribe(
				res => {

				}, err => {
					ErrorHandler.handle(err, "BaseComponent::onRemoveCategory", true);
				}, () => { })
	}

	openDetailsTab(res){
		if(res.getTable() == 'variables')
			this.nav.push(this.detailPage, { 'currResource': this.resource })
		else		
			this.tabsPage.setDetailTab(res);
	}

	onClick(evt) {
		if(this.resource.getTable() == 'variables')
			return this.onEditCmd(evt);
		if(this.resource.getTable() == 'categories' && this.filter == true){
			this.dismissView().then(res => {
				this.uiStateService.category = this.resource;
				return;
			})
			return;
		}
	
		if (this.onSelect(evt)) //If in select mode this will be handled by the above function
			return;
		var errorButton = {
			text: 'Errors',
			role: 'destructive',
			handler: () => {
				this.onErrorCmd(evt);
			}
		}
		var newButton = {
			text: 'Units',
			handler: () => {
				this.showChildren(evt);
			}
		}

		var shareButton = {
			text: 'Share',
			handler: () => {
				this.onShare(evt);
			}
		}

		var unshareButton = {
			text: 'Unshare',
			handler: () => {
				this.onUnshare(evt);
			}
		}

		var fav = "Favorite";
		if (this.resource.Favorite)
			fav = "Unfavorite";


		var runButton = {
			text: 'Run',
			handler: () => {
				this.onRun(evt);
			}
		}
		
		var catButton = {
					text: "Set Category",
					handler: () => {
						this.onCategory();
					}
				};

		var unCatButton = {
					text: "Remove Category",
					handler: () => {
						this.onRemoveCategory();
					}
				};
				

		var actionSheetItems = {
			title: 'Select item command',
			buttons: [
				{
					text: 'Edit',
					handler: () => {
						this.onEditCmd(evt);
					}
				},
				{
					text: 'Delete',
					role: 'destructive',
					handler: () => {
						this.onRemoveCmd(evt);
					}
				},
				
				{
					text: 'Cancel',
					role: 'cancel',
					handler: () => {
						console.log('Cancel clicked');
					}
				},
				{
					text: fav,
					handler: () => {
						this.onFavorite(evt);
					}
				}
			]
		};

		if (this.resource.hasError() == true) {
			actionSheetItems.buttons.splice(0, 0, errorButton);
		}
		if (this.resource.getTable() == 'properties')
			actionSheetItems.buttons.splice(1, 0, newButton)

		if (this.uiStateService.authenticated) {
			if (!this.resource.shared && this.resource.user_id)
				actionSheetItems.buttons.splice(0, 0, shareButton)
			else if (this.resource.user_id)
				actionSheetItems.buttons.splice(0, 0, unshareButton)
		}
		if (this.resource.getTable() == 'formulas'){
			actionSheetItems.buttons.splice(0,0,runButton);
		}
		if(this.resource.getTable() != 'categories'){
			actionSheetItems.buttons.splice(0,0,catButton);
		}
		if(this.resource.crs && this.resource.getTable() != 'categories'){
			actionSheetItems.buttons.splice(0,1,unCatButton);
		}
		
		let actionSheet = new ActionSheet(this.app, actionSheetItems);

		actionSheet.present();
	}

	error(cname) {
		var str = '';
		var keys = Object.keys(this.form.controls);
		keys.forEach(i => {
			str = str + this.form.controls[i].status + ":" + JSON.stringify(this.form.controls[i].errors) + '\n'
		})
		return str;
	}

	elementChanged(input) {
        let field = input.inputControl.name;
        this[field + "Changed"] = true;
    }

	dismissView(){
		return null;
	}
}