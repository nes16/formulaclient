import { Component } from '@angular/core';

import { NavParams } from 'ionic-angular';

import { ResourceListPage } from '../resource-list';


@Component({
  templateUrl: 'build/pages/tabs/tabs.html'
})
export class TabsPage {
  // set the root pages for each tab
  tab1Root: any = ResourceListPage;
  tab2Root: any = ResourceListPage;
  tab3Root: any = ResourceListPage;
  param1:any ={type:"properties"};
  param2:any ={type:"globals"};
  param3:any ={type:"formulas"};
  mySelectedIndex: number;

  constructor(navParams: NavParams) {
    this.mySelectedIndex = navParams.data.tabIndex || 0;
  }
}
