import { REACTIVE_FORM_DIRECTIVES, FormControl, FormGroup, Validators } from '@angular/forms';
import { Page, Modal, NavController, NavParams, ViewController } from 'ionic-angular';
import { Component } from '@angular/core'
import { Observable } from 'rxjs/Observable';
import { MyTokenAuth } from '../../services/token-auth/auth-service'
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
    templateUrl: 'build/pages/all-modals/all-modals.html',
    providers: [MyTokenAuth]
})
export class AllModals {
    option:any;
    login:any;
    register:any;
    forgot:any;
    chpwd:any;
    settings:any;
    error: string;
    errorInfo:any;
    title:string;
    message:string = "";
    constructor(params: NavParams, public nav:NavController, public viewCtrl:ViewController, public auth:MyTokenAuth) {
        this.option = params.get('option');

        switch(this.option){
            case 'login' :
                this.title="Login";
                break;
            case 'register' :
                this.title="Register";
                break;
            case 'forgot' :
                this.title="Forgot password";
                break;
            case 'chpwd' :
                this.title="Change password";
                break;
            case 'settings' :
                this.title="Settings";
                break;
            case 'about' :
                this.title="About";
                break;
            case 'error' :
                this.title="Error";
                break;
            case 'progress':
                this.title = this.option.title;
        }
        this.login = new FormGroup({
            emailId: new FormControl("senthilr2007@gmail.com", Validators.required),
            pwd: new FormControl("12345678", Validators.required)
        })

        this.register = new FormGroup({
            emailId: new FormControl("", Validators.required),
            pwd: new FormControl("", Validators.required),
        })

        this.forgot = new FormGroup({
            emailId: new FormControl("", Validators.required),
        })

        this.chpwd = new FormGroup({
            pwd: new FormControl("", Validators.required),
        })

        this.settings = new FormGroup({
            system: new FormControl("SI", Validators.required),
        })

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

    ngOnInit() {

    }

    doLogin(evt, value) {
       
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.submitLogin(JSON.stringify({ email: value.emailId, password: value.pwd }), null)
                        .subscribe(
                                () => this.dismiss(null),
                                (error) => { this.error = error; })
        } else {
            this.auth.signOut()
                        .subscribe(
                            () => alert('logout success'),
                            (error) => { this.error = error; })
        }
    }

     doRegister(evt, value) {
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.submitRegistration(JSON.stringify({ email: value.emailId, password: value.pwd }), null)
                        .subscribe(
                                () => alert('registration success'),
                                (error) => { this.error = error; })
        }
     }

    doForgot(evt, value) {
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.requestPasswordReset(JSON.stringify({ email: value.emailId }), null)
                        .subscribe(
                                () => alert('password request success'),
                                (error) => { this.error = error; })
        }
    }


    doChpwd(evt, value) {
        evt.preventDefault();
        if (this.auth.userIsAuthenticated()) {
            this.auth.updatePassword(JSON.stringify({ pwd: value.pwd }))
                        .subscribe(
                                () => alert('password change success'),
                                (error) => { this.error = error; })
        }
    }

    doSettings(evt, value){
        evt.preventDefault();
    }

    oauthlogin(provider) {
        // this.auth.authenticate(provider, null);
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
