import { Component, ViewChild } from '@angular/core';

import { NavParams, Tabs } from 'ionic-angular';

import { ResourceListPage } from '../resource-list';
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
  param1:any ={type:"properties", tabs:this};
  param2:any ={type:"globals", tabs:this};
  param3:any ={type:"formulas", tabs:this};
  param4:any = {tabs:this}
  mySelectedIndex: number;
  resource:any;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }

  @ViewChild('myTabs') tabRef: Tabs;

  setDetailTab(res:any){
    this.resource = res;
    this.tabRef.select(3);
  }

}
