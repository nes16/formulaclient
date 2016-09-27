import { Injectable } from '@angular/core';
import { Platform, Content, App } from 'ionic-angular';
import { Observer } from 'rxjs/Observer';
import { ConnectableObservable } from 'rxjs';
import { Modal } from 'ionic-angular';
import { ErrorHandler } from '../types/standard';

import { AllModals } from '../pages/all-modals/all-modals';
import { MyTokenAuth } from './token-auth/auth-service';

@Injectable()
export class UIStateService {
    authenticated: boolean = false;
    online:boolean = false;
    content:Content;
    modals:Modal;
    sharedTab:boolean = false;
    userId:number = -1;
    user:any = null;
    static event_types = {
        resource_save_complete:1,   //Successful save of an resource
        service_error_occurred:2, //Publishing errors from services
        resource_selected:3,
        network_state_change:4,
        syncronize:5
    }

    //Used for communicate async operation
    //state
    ole:ConnectableObservable<any>
    or:Observer<any>;

    inSelectMode:boolean;
    constructor(public app:App, private platform: Platform, private auth:MyTokenAuth) {
        this.ole = ConnectableObservable.create(or => {
            this.or = or;
        }).publish();
        this.ole.connect();

        this.authenticated = auth.userIsAuthenticated();
        this.user = auth.getUser();
        
        auth.observable.subscribe(res => {
            this.authenticated = auth.userIsAuthenticated()
            this.user = auth.getUser();
            this.userId = this.user.id;
        },err=>{
            ErrorHandler.handle(err, "UIStateService::constructor", false);
        }
        )
     
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
            //this.online = false; 
        });
    }

    showErrorModal(nav, errorInfo){
        var data = {option:"error", errorInfo:errorInfo}
        let modals = new Modal(this.app, AllModals, data);
        modals.present();
    }

    showProgressModal(title:string, message:string){
        var data = {option:"progress", title:title, messsage:message}
        this.modals = new Modal(this.app, AllModals, data);
        this.modals.present();
    }

    closeProgressModal(){
        if(this.modals)
            this.modals.dismiss();
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
        let value = "offline";
        if(this.online) 
            value = "online";
        this.or.next({type:UIStateService.event_types.syncronize, value:value})
        //return navigator.onLine;
    }

    set Content(content:Content){
        this.content = content;
    }

    get Content(){
        return this.content;
    }

}
