
import { Component, ViewChild, provide } from '@angular/core';
import { App, Events, ionicBootstrap, MenuController, Nav, Platform } from 'ionic-angular';
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
import {SqlCacheService} from './services/sqlcache-service';

import { UserData } from './providers/user-data';
import { AccountPage } from './pages/account/account';
import { LoginPage } from './pages/login/login';
import { SignupPage } from './pages/signup/signup';
import { TabsPage } from './pages/tabs/tabs';
import { TutorialPage } from './pages/tutorial/tutorial';

interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
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
    { title: 'Properties & Units', component: TabsPage, icon: 'calendar' },
    { title: 'Globals', component: TabsPage, index: 1, icon: 'contacts' },
    { title: 'Formulas', component: TabsPage, index: 2, icon: 'map' }
  ];
  loggedInPages: PageObj[] = [
    { title: 'Account', component: AccountPage, icon: 'person' },
    { title: 'Logout', component: TabsPage, icon: 'log-out' }
  ];
  loggedOutPages: PageObj[] = [
    { title: 'Login', component: LoginPage, icon: 'log-in' },
    { title: 'Signup', component: SignupPage, icon: 'person-add' }
  ];
  rootPage: any = TutorialPage;

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    platform: Platform
  ) {
    // Call any initial plugins when ready
    platform.ready().then(() => {
      StatusBar.styleDefault();
      Splashscreen.hide();
    });

    // load the conference data
    //confData.load();

    // decide which menu items should be hidden by current login status stored in local storage
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      this.enableMenu(hasLoggedIn === 'true');
    });

    this.listenToLoginEvents();
  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component);
    }

    if (page.title === 'Logout') {
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
        this.userData.logout();
      }, 1000);
    }
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
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
  UserData,
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
  App
 ], { });

