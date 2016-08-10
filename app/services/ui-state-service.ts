import {Injectable} from '@angular/core';
import {Platform, Content, App} from 'ionic-angular';
import { Observer } from 'rxjs/Observer';
import { ConnectableObservable } from 'rxjs';
import { Modal } from 'ionic-angular';
import { AllModals } from '../pages/all-modals/all-modals';

@Injectable()
export class UIStateService {
    authenticated: boolean = false;
    online:boolean = true;
    content:Content;

    static event_types = {
        resource_save_complete:1,   //Successful save of an resource
        service_error_occurred:2, //Publishing errors from services
        resource_selected:3
    }

    //Used for communicate async operation
    //state
    ole:ConnectableObservable<any>
    or:Observer<any>;

    inSelectMode:boolean;
    constructor(public app:App, private platform: Platform) {
        this.ole = ConnectableObservable.create(or => {
            this.or = or;
        }).publish();
        this.ole.connect();
     
    }



    checkNetwork() {
        this.platform.ready().then(() => {
            var networkState = navigator.connection.type;
            document.addEventListener("online", this.onOnline.bind(this), false);
            document.addEventListener("offline", this.onOffline.bind(this), false);
 
            var states = {};
            states[Connection.UNKNOWN]  = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI]     = 'WiFi connection';
            states[Connection.CELL_2G]  = 'Cell 2G connection';
            states[Connection.CELL_3G]  = 'Cell 3G connection';
            states[Connection.CELL_4G]  = 'Cell 4G connection';
            states[Connection.NONE]     = 'No network connection';
            this.online = navigator.onLine; 
        });
    }

    showErrorModal(nav, errorInfo){
        var data = {option:"error", errorInfo:errorInfo}
        let modals = new Modal(this.app, AllModals, data);
        modals.present();
    }

    onOnline(){
        console.log('=================Online=================');
    }

    onOffline(){
        console.log('=================offline=================')
    }

    get IsOnline() {
        return this.online;
		//return navigator.onLine;
    }


    set IsOnline(state:boolean) {
        this.online = state;
        //return navigator.onLine;
    }

    set Content(content:Content){
        this.content = content;
    }

    get Content(){
        return this.content;
    }

}
