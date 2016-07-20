import {Page, Modal, NavController, NavParams, ViewController} from 'ionic-angular'

@Page({
	templateUrl: 'build/pages/more-options/more-options.html'
})

export class MoreOptions {
	authenticated: boolean = false;
	constructor(params: NavParams, public viewCtrl: ViewController) {
		this.authenticated = params.get('authenticated');
	}

	dismiss(option){
		this.viewCtrl.dismiss({'option': option});
	}
}