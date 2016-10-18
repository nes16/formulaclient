import { Component, ViewChild } from '@angular/core';

import { NavParams, Tabs } from 'ionic-angular';

import { ResourceListPage } from '../resource-list';
import { UIStateService } from '../../services/ui-state-service';
import { DetailPage } from '../detail/detail';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = ResourceListPage;
  tab2Root: any = ResourceListPage;
  tab3Root: any = ResourceListPage;
  tab4Root: any = DetailPage;
  tab5Root: any = ResourceListPage;
  param1:any = {type:"properties"};
  param2:any = {type:"globals"};
  param3:any = {type:"formulas"};
  param4:any = {tabs:this};
  param5:any = {type:"categories"};
  mySelectedIndex: number;
  resource:any;

  constructor(navParams: NavParams, public uiStateService:UIStateService) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
    this.uiStateService.tabsPage = this;
  }

  ngOnInit(){
  }

  ngAfterViewInit(){
    this.tabRef.select(this.mySelectedIndex);
  }

  @ViewChild('myTabs') tabRef: Tabs;

  setDetailTab(res:any){
    this.resource = res;
    this.tabRef.select(3);
  }

  setResourcePage(table){
    if(table == "properties" || table == "units"){
      return this.tabRef.select(0)
    }
    if(table == "globals"){
      return this.tabRef.select(1)
    }
    if(table == "formulas"){
      return this.tabRef.select(2)
    }
  }
}
