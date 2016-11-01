/// <reference path="../../typings/cordova/cordova.d.ts" />
import { Injectable } from '@angular/core';
import { Platform, Content, App } from 'ionic-angular';
import { Observer } from 'rxjs/Observer';
import { ConnectableObservable } from 'rxjs/observable/ConnectableObservable';
import { Modal } from 'ionic-angular';
import { ModalsPage } from '../pages/modals/modals';
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
    tabsPage:any = null;
    category:any = null;
    device:string = "mobile"
    
    static event_types = {
        resource_save_complete:1,   //Successful save of an resource
        service_error_occurred:2, //Publishing errors from services
        resource_selected:3,
        network_state_change:4,
        syncronize:5,
        auth:6,
        category:7
    }

    //Used for communicate async operation
    //state
    ole:ConnectableObservable<any>
    or:Observer<any>;

    inSelectMode:boolean;
    constructor(public app:App, public platform: Platform, 
                public auth:MyTokenAuth) {
        this.ole = ConnectableObservable.create(or => {
            this.or = or;
        }).publish();
        this.ole.connect();

        this.authenticated = auth.userIsAuthenticated();
        this.user = auth.getUser();
        this.listenToLoginEvents();
        this.device = this.mobilecheck()?"mobile":"desktop";
    }

    mobilecheck() {
        var check = false;
        (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window["opera"]);
        return check;
    };

    checkNetwork() {
        this.platform.ready().then(() => {
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
        let modals = new Modal(this.app, ModalsPage, data);
        modals.present();
    }

    showProgressModal(title:string, message:string){
        var data = {option:"progress", title:title, messsage:message}
        this.modals = new Modal(this.app, ModalsPage, data);
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
        //return this.online;
		return navigator.onLine;
    }


    set IsOnline(state:boolean) {
        this.online = state;
    }

    fireSync(){
        let value="online";
        this.or.next({type:UIStateService.event_types.syncronize, value:value})
    }
    set Content(content:Content){
        this.content = content;
    }

    get Content(){
        return this.content;
    }

    setCategory(c){
        this.category = c;
        this.or.next({type:UIStateService.event_types.category, value:c})
    }

    listenToLoginEvents() {
    this.auth.events.subscribe('auth', (evt) => {
      if(evt.action == 'login' && evt.result == 'success'){
        this.authenticated = this.auth.userIsAuthenticated();
        this.user = this.auth.getUser();
      }
      if(evt.action == 'logout' && evt.result == 'success'){
        this.authenticated = this.auth.userIsAuthenticated();
        this.user = this.auth.getUser();
      }
    });
  }

}
