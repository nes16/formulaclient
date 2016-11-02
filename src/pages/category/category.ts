import { NavParams, NavController, ViewController } from 'ionic-angular';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { BaseResource, Category } from '../../lib/types/standard'


@Component({
    templateUrl: 'category.html',
})

export class CategoryPage implements  OnInit, OnDestroy {
	resourceType:string;
    args:any;
    category:Category;
    uiSubscription:any;
    resources:Array<BaseResource> = new Array<BaseResource>();
    tabsPage;any;
    viewType:string = 'All'
    filter:boolean = true;
    constructor(public navParams: NavParams
              , public dataService:DataService
              , public uiService:UIStateService
              , public nav: NavController
              , public viewController: ViewController) {
        this.tabsPage = uiService.tabsPage;
    }

    ngOnInit(){
            this.category = Category._root;

            this.resources = Category._root.children;

        this.uiSubscription = this.uiService.ole.subscribe(res => {
            if(res.type == UIStateService.event_types.service_error_occurred){
                this.uiService.showErrorModal(this.nav, res.content)
            }
            if(res.type == UIStateService.event_types.syncronize){
              this.dataService.sync(this.dataService['categories']).subscribe(null,null,()=>{
                  this.dataService['categories'].or.next(this.dataService['categories'].resources);
              });
            }
        }, 
        (error) => { 
        })

        this.onErrorCmd(null);
    }


    filterParent(res){
            return res.filter(i => i.parent_id == this.category.id)
    }
    ngOnDestroy(){
        this.uiSubscription.unsubscribe();
    }

    onErrorCmd(evt){
        //Save 
        //var errorInfo = this.dataService['categories'].getDeletedItemErrorInfo();
        //if(errorInfo)
        //    this.uiService.showErrorModal(this.nav, errorInfo)
    }


    onFilterCancel(evt){

    }

    onFilterChange(key){

    }

    clear(evt){
        this.uiService.setCategory(null)
        this.viewController.dismiss();
    }

}
