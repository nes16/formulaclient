
import { Component, ViewChild, provide } from '@angular/core';
import { App, Events, ionicBootstrap, MenuController, Nav, Platform, Modal } from 'ionic-angular';
import { Splashscreen, StatusBar } from 'ionic-native';
import {PLATFORM_DIRECTIVES} from '@angular/core';
import {disableDeprecatedForms, provideForms, REACTIVE_FORM_DIRECTIVES} from '@angular/forms';

import {BaseService} from './services/base-service';
import {MyTokenAuth} from './services/token-auth/auth-service';
import {JwtHttp} from './services/token-auth/jwtHttp';
import {UIStateService} from './services/ui-state-service';
import {DataService} from './services/data-service';
import {MQService} from './services/mq-service';
import {RemoteService} from './services/remote-service';
import {SqlService} from './services/sql-service';
import { SqlCacheService } from './services/sqlcache-service';
import { UserPage } from './pages/user/user';

import { TabsPage } from './pages/tabs/tabs';
import { TutorialPage } from './pages/tutorial/tutorial';
import { ResponsiveState } from 'responsive-directives-angular2';

interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
  params?:any;
}

@Component({
  templateUrl: 'build/app.html'
})
class FormulaApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageObj[] = [
    { title: 'Units', component: TabsPage, icon: 'calendar' },
    { title: 'Globals', component: TabsPage, index: 1, icon: 'contacts' },
    { title: 'Formulas', component: TabsPage, index: 2, icon: 'map' },
    { title: 'Categories', component: TabsPage, index: 4, icon: 'map' },
  ];
  loggedInPages: PageObj[] = [
    { title: 'change Passwrod', component: UserPage, icon: 'person', params:{option:'chpwd'} },
    { title: 'Logout', component: TabsPage, icon: 'log-out' }
  ];
  loggedOutPages: PageObj[] = [
    { title: 'Login', component: UserPage, icon: 'log-in', params:{option:'login'} },
    { title: 'Signup', component: UserPage, icon: 'person-add', params:{option:'signup'} }
  ];

  rootPage: any = TabsPage;

  constructor(
    public apsignup: App,
    public events: Events,
    public menu: MenuController,
    public auth: MyTokenAuth,
    platform: Platform
  ) {
    // Call any initial plugins when ready
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    // decide which menu items should be hidden by current login status stored in local storage
    this.enableMenu(this.auth.userIsAuthenticated());

    this.listenToLoginEvents();
  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component, page.params);
    }

    if (page.title === 'Logout') {
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
        this.auth.logout().subscribe();
      }, 1000);
    }
  }

  
  listenToLoginEvents() {
    this.auth.events.subscribe('auth', (evt) => {
      if(evt.action == 'login' && evt.result == 'success'){
        this.enableMenu(true);
      }
      if(evt.action == 'logout' && evt.result == 'success'){
        this.enableMenu(false);
      }
    });
  }

  enableMenu(loggedIn) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }
}


// Pass the main App component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument, see the docs for
// more ways to configure your app:
// http://ionicframework.com/docs/v2/api/config/Config/
// Place the tabs on the bottom for all platforms
// See the theming docs for the default values:
// http://ionicframework.com/docs/v2/theming/platform-specific-styles/

ionicBootstrap(FormulaApp, [
  disableDeprecatedForms(),
  provideForms(),
  {
        provide: PLATFORM_DIRECTIVES,
        useValue: [REACTIVE_FORM_DIRECTIVES],
        multi: true
  } ,

  provide('ApiEndpoint', {useValue: 'http://formulalab.net/api/v1'}),
  BaseService,
  MyTokenAuth,
  JwtHttp,
  UIStateService,
  DataService,
  MQService,
  RemoteService,
  SqlService,
  SqlCacheService,
  App,
  ResponsiveState
 ], {tabsHideOnSubPages:"true"});

