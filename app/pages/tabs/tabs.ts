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
  resources = [];
  oldResource:any;

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
    if(res){
      this.resources.push(res);
      if(DetailPage.root)
        DetailPage.root.nav.push(DetailPage, {currResource:res})
    }
    this.tabRef.select(3);
  }


  clearDetailTab(){
    let resource = this.resources.pop();
    this.setResourcePage(resource.getTable());
    if(DetailPage.root){
      if(this.resources.length)
    	  DetailPage.root.nav.pop();
      else
        DetailPage.root = null;
    }
  }
	
  emit(resource) {
		var type = UIStateService.event_types.resource_save_complete;
		this.uiStateService.or.next({ status: 'success', type: type, resource: resource });
		this.uiStateService.inSelectMode = false;
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
