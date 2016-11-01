import { Component } from '@angular/core';

import { MenuController, NavController } from 'ionic-angular';

import { TabsPage } from '../tabs/tabs';


export interface Slide {
  title: string;
  description: string;
  image: string;
}

@Component({
  templateUrl: 'tutorial.html'
})
export class TutorialPage {
  slides: Slide[];
  showSkip = true;

  constructor(public navCtrl: NavController, public menu: MenuController) {
    this.slides = [
      {
        title: 'Welcome to <b>Formula Library</b>',
        description: 'The <b>Formula Library App</b> is a mobile app for collection of formulas, to keep the day today used formulas handy.',
        image: 'img/ica-slidebox-img-1.png',
      },
      {
        title: 'What can be done?',
        description: '<b>Formula Library</b> you can define properties like Force, Time, Mass etc. You can define units for them. <br> You can define units, Global constants. <br> These can be used in your definition of a formula.',
        image: 'img/ica-slidebox-img-2.png',
      },
      {
        title: 'How to define formula?',
        description: 'The <b>Formula Library</b> is a cloud platform for define and sharing formulas. Each formula contains variable and global constants. The variables and formula can be optionaly specify a unit/property for them',
        image: 'img/ica-slidebox-img-3.png',
      }
    ];
  }

  startApp() {
    this.navCtrl.push(TabsPage);
  }

  onSlideChangeStart(slider) {
    this.showSkip = !slider.isEnd;
  }

  ionViewDidEnter() {
    // the root left menu should be disabled on the tutorial page
    this.menu.enable(false);
  }

  ionViewWillLeave() {
    // enable the root left menu when leaving the tutorial page
    this.menu.enable(true);
  }

}
