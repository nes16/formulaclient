import { Modal, NavController, NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core'


@Component({
    templateUrl: 'build/pages/modals/modals.html',
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
            case 'error' :
                this.title="Error";
                break;
            case 'progress':
                this.title = this.option.title;
        }
        if(this.option == "error"){
            this.title = "Errors"
            this.errorInfo = params.get("errorInfo");
        }

        if(this.option == "progress"){
            this.title = params.get("title");
            this.message = params.get("message");
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
