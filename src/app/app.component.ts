import { Component, ViewChild } from '@angular/core';
import { App, Events, MenuController, Nav, Platform } from 'ionic-angular';
import { Splashscreen, StatusBar } from 'ionic-native';

import { UserPage } from '../pages/user/user';
import { TabsPage } from '../pages/tabs/tabs';
// import { TutorialPage } from '../pages/tutorial/tutorial';
// import { ResponsiveState } from 'responsive-directives-angular2';
import { MyTokenAuth } from '../providers/token-auth/auth-service'

export interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
  params?:any;
}

@Component({
  templateUrl: 'app.template.html'
})
export class FormulaApp {
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
    if (page.title === 'Login' || page.title === "Signup") {
      // Give the menu time to close before changing to logged out
      this.nav.push(page.component, page.params);
      return;
    }
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component, page.params);
    }

    if (page.title === 'Logout') {
      // Give the menu time to close before changing to logged out
      setTimeout(() => {
        this.auth.logout()
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




