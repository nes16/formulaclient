import { Page, NavParams, NavController } from 'ionic-angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data-service';
import { UIStateService } from '../services/ui-state-service';
import { PropertyComponent } from '../components/property/property';
import { UnitComponent } from '../components/unit/unit';
import { FormulaComponent } from '../components/formula/formula';
import { GlobalComponent } from '../components/global/global';
import { FlNavBar } from '../components/bars/nav-bar';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { DetailPage } from '../pages/detail/detail';
import { BaseResource, Property, Formula, Global } from '../types/standard'
import { FavFilterPipe } from '../components/fav-filter'
import { ErrorHandler } from '../types/standard';


@Component({
    templateUrl: 'build/pages/resource-list.html',
    directives:[FlNavBar, PropertyComponent, UnitComponent, GlobalComponent, FormulaComponent],
    pipes:      [FavFilterPipe]
})

export class ResourceListPage implements  OnInit, OnDestroy {
	resourceType:string;
    args:any;
    /*For listing units*/
    prop:Property;
    /*For listing var values*/
    formula:Formula;
    uiSubscription:any;
    resources:Array<BaseResource> = new Array<BaseResource>();
    tabsPage;any;
    viewType:string = 'All'
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
        }, 
        (error) => { 
            ErrorHandler.handle(error, "ResourceListPage::ngOnInit", true);
        })

        this.onErrorCmd(null);
    }

    selectedViewType(type){
        if(type == 'All'){
            this.dataService[this.resourceType].ole.subscribe(res => {
                this.resources = this.filterParent(res)
            },(error) => { 
            ErrorHandler.handle(error, "ResourceListPage::selectedViewType", true);
        })
        }
        else if(type == 'Favourites'){
             this.dataService[this.resourceType].ole.subscribe(res => {
                 this.resources = this.filterParent(res.filter(item => item.Favorite))
             },(error) => { 
            ErrorHandler.handle(error, "ResourceListPage::selectedViewType", true);
        })
        }
        else if(type == 'Library'){
             this.dataService[this.resourceType].ole.subscribe(res => {
                 this.resources = this.filterParent(res.filter(item => this.dataService.isResourceShared(item)))
             },(error) => { 
            ErrorHandler.handle(error, "ResourceListPage::selectedViewType", true);
        })   
        }
    }

    filterParent(res){
        if(this.resourceType == 'units'){
            return res.filter(i => i.property_id == this.prop.id)
        }
        else if(this.resourceType == 'varvals'){
            return res.filter(i => i.formula_id == this.formula.id)
        }
        else
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
                return "Properties";
            case "globals":
                return "Globals";
            case "formulas":
                return "Formulas";
            case "varvals":
                return "Run Formula " + this.formula.name;
            case "units":
                return "Units for " + this.prop.name;
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
                var u = resource.newUnit(true);
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
             default:
                 resource = null;
        }
        if(resource){
            this.tabsPage.setDetailTab(resource);
            //this.nav.push(DetailPage, { currResource: resource })
        }
        evt.stopPropagation();
        evt.preventDefault();
    }

    onFilterCancel(evt){

    }

    onFilterChange(key){

    }

}
