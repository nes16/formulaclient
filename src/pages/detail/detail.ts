import { Component, ViewChild } from '@angular/core';
import { App, NavController, NavParams, Content } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { UIStateService } from '../../providers/ui-state-service';
import { MQService } from '../../providers/mq-service'

@Component({
    templateUrl: 'detail.html',
})

export class DetailPage {
    currResource: any;
    type: string;
    title:string;
    master: any;
    tabsPage:any;
    navMode:boolean = false;
    static root:DetailPage = null;
    constructor(public app:App, public nav: NavController, navParams: NavParams, public dataService: DataService, public uiStateService: UIStateService, public mq:MQService) {
        this.tabsPage = uiStateService.tabsPage;
        this.currResource = navParams.get('currResource');
        if(this.currResource){
            this.setTitle();
        }
    }

    @ViewChild(Content) content: Content;

    
    
    ngOnInit() {
        this.uiStateService.Content = this.content;
    }

    setDetail(){
        DetailPage.root = this; 
        this.currResource = this.tabsPage.resources[0];
        if(this.currResource)
            this.setTitle();
    }

    setTitle(){

        this.type = this.currResource.getTable();
        if(this.type == 'properties')
            this.title = 'Property - ' + this.currResource.name;
        else if(this.type == 'units')
            this.title = 'Unit - ' + this.currResource.name;
        else if (this.type == 'globals')
            this.title = 'Global - ' + this.currResource.name;
        else if (this.type == 'variables')
            this.title = 'Variable - ' + this.currResource.name;
        else if (this.type == 'formulas')
            this.title = 'Formula - ' + this.currResource.name;
        else if (this.type == 'varvals')
            this.title = 'Run Formula - ' + this.currResource.name;
        else if (this.type == 'varvals')
            this.title = 'Run Formula - ' + this.currResource.name;
        else if (this.type == 'categories')
            this.title = 'category';
        else
            throw("Invalid type detail page");
    }

    onClose(evt){
        this.tabsPage.clearDetailTab();
    }
   
    ionViewDidEnter() {
        if(!DetailPage.root)
            this.setDetail();
    }
}