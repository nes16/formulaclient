import { Component } from '@angular/core';
import {App, Modal, NavController, NavParams, ViewController} from 'ionic-angular'
import {ModalsPage} from '../modals/modals';

@Component({
	templateUrl: 'build/pages/more-options/more-options.html'
})

export class MoreOptions {
	authenticated: boolean = false;
	constructor(public app:App, params: NavParams, public viewCtrl: ViewController) {
		this.authenticated = params.get('authenticated');
	}

	about(option){
		let about = new Modal(this.app, ModalsPage, { 'option': 'about' });

	     about.onDidDismiss(data => {
	       
	     });
	     about.present();
	}
}