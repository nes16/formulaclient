import { Component } from '@angular/core';
import { App, Modal, NavParams, ViewController } from 'ionic-angular'
import { ModalsPage } from '../modals/modals';

@Component({
	templateUrl: 'more-options.html'
})

export class MoreOptionsPage {
	authenticated: boolean = false;
	constructor(public app:App, params: NavParams, public viewCtrl: ViewController) {
		this.authenticated = params.get('authenticated');
	}

	about(evt){
		this.viewCtrl.dismiss().then(val => {
			let about = new Modal(this.app, ModalsPage, { 'option': 'about' });
			about.onDidDismiss(data => {
			
			});
			about.present();
		})
		 
	}
}