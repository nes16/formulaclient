import { NavParams, NavController } from 'ionic-angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../providers/data-service';
import { UIStateService } from '../providers/ui-state-service';
import { DetailPage } from '../pages/detail/detail';
import { BaseResource, Property, Formula, Global, Category } from '../lib/types/standard'
import { ErrorHandler } from '../lib/types/standard';


@Component({
    templateUrl: 'resource-list.html',
})

export class ResourceListPage implements  OnInit, OnDestroy {
	resourceType:string;
    args:any;
    /*For listing units*/
    prop:Property;
    /*For listing var values*/
    formula:Formula;
    category:Category;
    uiSubscription:any;
    resources:Array<BaseResource> = new Array<BaseResource>();
    tabsPage;any;
    viewType:string = 'All'
    detailPage:any = DetailPage;
    constructor(public navParams: NavParams
              , public dataService:DataService
              , public uiService:UIStateService
              , public nav: NavController) {
        // this.resourceType = navParams.get("type") || "properties";
        this.tabsPage = uiService.tabsPage;
        // if(this.resourceType == "units"){
        //     this.prop = navParams.get("prop")
        // }
        // this.args = navParams.get("args");
    }

    ngOnInit(){
        this.resourceType = this.navParams.get("type") ? this.navParams.get("type") : "properties";
        if(this.resourceType == "units"){
            this.prop = this.navParams.get("prop")
        }
        if(this.resourceType == "categories"){
            this.category = Category._root;
        }

        if(this.resourceType == 'varvals'){
            this.formula = this.navParams.get("formula");
        }
        
        this.args = this.navParams.get("args");
        this.uiService.sharedTab = false;
        
        this.selectedViewType(this.viewType);

        this.uiSubscription = this.uiService.ole.subscribe(res => {
            if(res.type == UIStateService.event_types.service_error_occurred){
                this.uiService.showErrorModal(this.nav, res.content)
            }
            if(res.type == UIStateService.event_types.syncronize){
              this.dataService.sync(this.dataService[this.resourceType]).subscribe(null,null,()=>{
                  this.dataService[this.resourceType].or.next(this.dataService[this.resourceType].resources);
              });
            }
            if(res.type == UIStateService.event_types.category){
                this.selectedViewType(this.viewType);              
            }
        }, 
        (error) => { 
            ErrorHandler.handle(error, "ResourceListPage::ngOnInit", true);
        })

        this.onErrorCmd(null);
    }

    selectedViewType(type){
        if(type == 'All'){
            this.dataService[this.resourceType].ole.subscribe(res => {
                this.resources = this.filterCategoryAndParent(res);
            },(error) => { 
            ErrorHandler.handle(error, "ResourceListPage::selectedViewType", true);
        })
        }
        else if(type == 'Favourites'){
             this.dataService[this.resourceType].ole.subscribe(res => {
                 this.resources = this.filterCategoryAndParent(res.filter(item => item.Favorite))
             },(error) => { 
            ErrorHandler.handle(error, "ResourceListPage::selectedViewType", true);
        })
        }
        else if(type == 'Library'){
             this.dataService[this.resourceType].ole.subscribe(res => {
                 this.resources = this.filterCategoryAndParent(res.filter(item => this.dataService.isResourceShared(item)))
             },(error) => { 
            ErrorHandler.handle(error, "ResourceListPage::selectedViewType", true);
        })   
        }
    }

    filterCategoryAndParent(res){
        let res1 = this.filterParent(res);
        if(this.resourceType == 'categories')
            return res1; 
        
        if(this.uiService.category != null){
                        return res1.filter(i => {return i.crs  && this.uiService.category.isSubCategory(i.crs._category)}
            )
        }
        return res1;
    }

    filterParent(res){
        if(this.resourceType == 'units'){
            return res.filter(i => i.property_id == this.prop.id)
        }
        else if(this.resourceType == 'varvals'){
            return res.filter(i => i.formula_id == this.formula.id)
        }
        else if(this.resourceType == 'categories'){
            return res.filter(i => i.parent_id == this.category.id)
        }
            return res;
    }
    ngOnDestroy(){
        this.uiSubscription.unsubscribe();
    }

    onErrorCmd(evt){
        //Save 
        //var errorInfo = this.dataService[this.resourceType].getDeletedItemErrorInfo();
        //if(errorInfo)
        //    this.uiService.showErrorModal(this.nav, errorInfo)
    }

    get Title(){
    	switch(this.resourceType){
            case "properties":
                return "Units";
            case "globals":
                return "Globals";
            case "formulas":
                return "Formulas";
            case "varvals":
                return "Run Formula " + this.formula.name;
            case "units":
                return "Units " + this.prop.name;
            case "categories":
                return "Categories";
            default:
                return null;
        }	
    }


//Events
    onNewCmd(evt){
        var resource;
        switch(this.resourceType){
            case "properties":
                resource = new Property();
                resource.newUnit(true);
                break;
            case "units":
                resource = this.prop.newUnit();
                break;
            case "globals":
                resource = new Global();
                break;
            case "formulas":
                resource = new Formula();
                break;
            case "varvals":
                resource = this.formula.newVarval();
                break;
            case "categories":
                resource = Category._root.addCategory("New Category");
                break;
             default:
                 resource = null;
        }
        if(resource){
            this.tabsPage.setDetailTab(resource);
        }
        evt.stopPropagation();
        evt.preventDefault();
    }

    onFilterCancel(evt){

    }

    onFilterChange(key){

    }

    ngAfterViewInit(){
    }

    ionViewDidEnter() {
        this.selectedViewType(this.viewType);
    }
}
