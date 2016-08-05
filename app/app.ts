import { Platform, Nav,  MenuController, ionicBootstrap, App, Events, NavController } from 'ionic-angular';
import { Component, ViewChild, enableProdMode } from '@angular/core';
import {StatusBar} from 'ionic-native';

import {ResourceListPage} from './pages/resource-list';
import {DetailPage} from './pages/detail/detail';
import {BaseService} from './services/base-service';
import {MyTokenAuth} from './services/token-auth/auth-service';
import {JwtHttp} from './services/token-auth/jwtHttp';
import {UIStateService} from './services/ui-state-service';
import {DataService} from './services/data-service';
import {MQService} from './services/mq-service';
import {RemoteService} from './services/remote-service';
import {SqlService} from './services/sql-service';
import {PLATFORM_DIRECTIVES} from '@angular/core';
import {disableDeprecatedForms, provideForms, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';

@Component({
  templateUrl: 'build/app.html',
  providers: [  MyTokenAuth, JwtHttp, MQService, BaseService, DataService,RemoteService, SqlService,UIStateService]
})

export class MyApp {
  pages: any[];
   rootPage: any = ResourceListPage;
   //rootPage: any = DetailPage;

   @ViewChild(Nav) private nav: Nav;

   constructor(public app: App
               , public platform: Platform
               , public uiStateService: UIStateService
               , public menu: MenuController) {
     // set up our app
     this.initializeApp();
     // set our app's pages
     this.pages = [
         {title: 'Units and Properties', component: ResourceListPage, params:{type:"properties"} },
         { title: 'Global Constants', component: ResourceListPage, params:{type:"globals"} },
         { title: 'Formulas', component: ResourceListPage, params: { type: "formulas" } }
     ];

     platform.ready().then(() => {
       // The platform is now ready. Note: if this callback fails to fire, follow
       // the Troubleshooting guide for a number of possible solutions:
       //
       // Okay, so the platform is ready and our plugins are available.
       // Here you can do any higher level native things you might need.
       //
       // First, let's hide the keyboard accessory bar (only works natively) since
       // that's a better default:
       //
       // Keyboard.setAccessoryBarVisible(false);
       //
       // For example, we might change the StatusBar color. This one below is
       // good for dark backgrounds and light text:
       // StatusBar.setStyle(StatusBar.LIGHT_CONTENT)
     });
   }

   ngAfterViewInit() {

   }

   initializeApp() {
       this.platform.ready().then(() => {
       // Okay, so the platform is ready and our plugins are available.
       // Here you can do any higher level native things you might need.
       StatusBar.styleDefault();
     });
   }

   openPage(page, params) {
       // close the menu when clicking a link from the menu
       // navigate to the new page if it is not the current page
       this.nav.setRoot(page.component, page.params)
       this.menu.close();
   }
}

enableProdMode(),


ionicBootstrap(MyApp, [
  disableDeprecatedForms(),
  provideForms(),
  {
        provide: PLATFORM_DIRECTIVES,
        useValue: [REACTIVE_FORM_DIRECTIVES],
        multi: true
  } ,
  MyTokenAuth, JwtHttp, MQService, BaseService, DataService
  ])
 

