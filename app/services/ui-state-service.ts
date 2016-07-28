import {Injectable} from '@angular/core';
import {Platform, Content} from 'ionic-angular';
import { Observer } from 'rxjs/Observer';
import { ConnectableObservable } from 'rxjs';

@Injectable()
export class UIStateService {
    authenticated: boolean = false;
    online:boolean = true;
    content:Content;

    //Used for communicate async operation
    //state
    ole:ConnectableObservable<any>
    or:Observer<any>;

    inSelectMode:boolean;
    constructor(private platform: Platform) {
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
        });
    }

    onOnline(){
        console.log('=================Online=================');
    }

    onOffline(){
        console.log('=================offline=================')
    }

    get IsOnline() {
        //return this.online;
		return navigator.onLine;
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
