import { Page, NavParams, NavController } from 'ionic-angular';
import { DataService } from '../services/data-service';
import { PropertyComponent } from '../components/property/property';
import { FormulaComponent } from '../components/formula/formula';
import { GlobalComponent } from '../components/global/global';
import { FlNavBar } from '../components/bars/nav-bar';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { DetailPage } from '../pages/detail/detail';
import { Property, Formula, Global } from '../types/standard'
@Page({
    templateUrl: 'build/pages/resource-list.html',
    directives:[FlNavBar, PropertyComponent, GlobalComponent, FormulaComponent]
})

export class ResourceListPage {
	resourceType:string;
    args:any;


    constructor(navParams: NavParams
              , public dataService:DataService
              , public nav: NavController) {
        this.resourceType = navParams.get("type") ? navParams.get("type") : "properties";
        this.args = navParams.get("args");
    }

    ngOnInit(){

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
