import { NavController, NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core'


@Component({
    templateUrl: 'modals.html',
})
export class ModalsPage {
    option:any;
    error: string;
    errorInfo:any;
    title:string;
    message:string = "";
    constructor(params: NavParams, public nav:NavController, public viewCtrl:ViewController) {
        this.option = params.get('option');
        switch(this.option){
            case 'about':
                this.title = "About";
                break;
            case 'error' :
                this.title="Error";
                this.errorInfo = params.get("errorInfo");
                break;
            case 'progress':
                this.title = this.option.title;
                this.message = params.get("message");
                break;
            default:
                throw('Invalid option in ModalsPage')
        }
    }

    dismiss(evt){
        this.viewCtrl.dismiss();
    }

    hasFieldErrors(){
        if(!this.errorInfo.common_message)
            return true;
        else
            return Object.keys(this.errorInfo).length >= 2
    }

    getErrorFields(){
        return Object.keys(this.errorInfo);
    }

    getMessagesForField(field){
        return this.errorInfo[field];
    }
}
