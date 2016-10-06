import { Component } from '@angular/core';
import { App, Page, NavController, NavParams, Alert, ActionSheet, Content } from 'ionic-angular';
import { Property, Unit, Formula } from '../../types/standard';
import { forwardRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/data-service';
import { UIStateService } from '../../services/ui-state-service';
import { PropertyComponent } from '../../components/property/property';
import { UnitComponent } from '../../components/unit/unit';
import { GlobalComponent } from '../../components/global/global';
import { FormulaComponent } from '../../components/formula/formula';
import { VarvalComponent } from '../../components/varval/varval';
import { VarComponent } from '../../components/variable/variable';
import { MathKeypad } from '../../components/keys/keypad';
import { FlNavBar } from '../../components/bars/nav-bar';
import { Observer } from 'rxjs/Observer';
import {MQService} from '../../services/mq-service'

@Component({
    //templateUrl: 'build/pages/unit/unit-test.html',
    templateUrl: 'build/pages/detail/detail.html',
    directives: [GlobalComponent, FormulaComponent
    , forwardRef(() => UnitComponent), forwardRef(() => PropertyComponent), VarComponent, VarvalComponent, FlNavBar, MathKeypad]
    
})

export class DetailPage {
    currResource: any;
    type: string;
    title:string;
    master: any;
    tabsPage:any;
    navMode:boolean = false;
    constructor(public app:App, public nav: NavController, navParams: NavParams, public dataService: DataService, public uiStateService: UIStateService, public mq:MQService) {
        this.tabsPage = uiStateService.tabsPage;
        this.currResource = navParams.get('currResource');
        if(this.currResource)
            this.navMode =true;
    }

    @ViewChild(Content) content: Content;

    
    enterNew(evt){
        this.nav.push(DetailPage, evt );
    }

    ngOnInit() {
        if(this.currResource)
            this.setDetail(true);
    }

    ngAfterViewInit(){
        if(!this.currResource)
            this.setDetail()
    }

    setDetail(init:boolean = false){
        this.uiStateService.Content = this.content;
        if(!this.tabsPage.resource)
            return;
        if(!this.navMode)
            this.currResource = this.tabsPage.resource;
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
    }
   
    ionViewDidEnter() {
        this.app.setTitle('Edit');
        this.setDetail();
    }
}