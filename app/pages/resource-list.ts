import { Page, NavParams, NavController } from 'ionic-angular';
import { Component } from '@angular/core';
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
import { Property, Formula, Global } from '../types/standard'
@Component({
    templateUrl: 'build/pages/resource-list.html',
    directives:[FlNavBar, PropertyComponent, UnitComponent, GlobalComponent, FormulaComponent]
})

export class ResourceListPage {
	resourceType:string;
    args:any;
    prop:Property;
    constructor(public navParams: NavParams
              , public dataService:DataService
              , public uiStateService:UIStateService
              , public nav: NavController) {
        this.resourceType = navParams.get("type") ? navParams.get("type") : "properties";
        if(this.resourceType == "units"){
            this.prop = navParams.get("prop")
        }
        this.args = navParams.get("args");
    }

    ngOnInit(){
        this.resourceType = this.navParams.get("type") ? this.navParams.get("type") : "properties";
        if(this.resourceType == "units"){
            this.prop = this.navParams.get("prop")
        }
        this.args = this.navParams.get("args");

        this.uiStateService.ole.subscribe(res => {
            if(res.type == UIStateService.event_types.service_error_occurred){
                this.uiStateService.showErrorModal(this.nav, res.content)
            }
        })

        this.onErrorCmd(null);
    }

    onErrorCmd(evt){
        //Save 
        var errorInfo = this.dataService[this.resourceType].getDeletedItemErrorInfo();
        if(errorInfo)
            this.uiStateService.showErrorModal(this.nav, errorInfo)
    }

    get Title(){
    	switch(this.resourceType){
            case "properties":
                return "Properties";
            case "globals":
                return "Globals";
            case "formulas":
                return "Formulas";
            default:
                return null;
        }	
    }


//Events
    onNewCmd(evt){
        var resource;
        switch(this.resourceType){
            case "properties":
                resource = new Property({});
                var u = resource.newUnit(true);
                break;
            case "units":
                resource = this.prop.newUnit();
                break;
            case "globals":
                resource = new Global({});
                break;
            case "formulas":
                resource = new Formula({});
                break;
             default:
                 resource = null;
        }
        if(resource){
            this.nav.push(DetailPage, { currResource: resource })
        }
        evt.stopPropagation();
        evt.preventDefault();
    }

    onFilterCancel(evt){

    }

    onFilterChange(key){

    }

}
