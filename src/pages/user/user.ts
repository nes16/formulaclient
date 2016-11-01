import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NavController, NavParams } from 'ionic-angular';
import { Component } from '@angular/core'
import { MyTokenAuth } from '../../providers/token-auth/auth-service'
import { AuthData } from '../../providers/token-auth/auth-service'
import { TabsPage } from '../tabs/tabs';


@Component({
    templateUrl: 'user.html',
})
export class UserPage {
    option:any;
    formLogin:any;
    formSignup:any;
    formForgot:any;
    formChpwd:any;
    formSetup:any;
    title:string;
    message:string = "";
    constructor(params: NavParams, public nav:NavController, public auth:MyTokenAuth) {
        this.option = params.get('option');
                
        this.auth.events.subscribe("auth", (data) =>{
            this.handleAuthEvent(data);
        })
        
        switch(this.option){
            case 'login' :
                this.title="Login";
                break;
            case 'logout':
                this.title = 'logout';
                break;
            case 'signup' :
                this.title="Sign up";
                break;
            case 'forgot' :
                this.title="Forgot password";
                break;
            case 'chpwd' :
                this.title="Change password";
                break;
            case 'setup' :
                this.title="Setup";
                break;
            case 'about' :
                this.title="About";
                break;
            
        }
        this.formLogin = new FormGroup({
            emailId: new FormControl("senthilr2007@gmail.com", Validators.required),
            pwd: new FormControl("rs#123456", Validators.required)
        })

        this.formSignup = new FormGroup({
            emailId: new FormControl("", Validators.required),
            pwd: new FormControl("", Validators.required),
        })

        this.formForgot = new FormGroup({
            emailId: new FormControl("", Validators.required),
        })

        this.formChpwd = new FormGroup({
            pwd: new FormControl("", Validators.required),
        })

        this.formSetup = new FormGroup({
            system: new FormControl("SI", Validators.required),
        })
    }

    login(evt, value) {
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.login(JSON.stringify({ email: value.emailId, password: value.pwd }), null);
        } else {
            this.auth.logout();
        }
    }

     signup(evt, value) {
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.signup(JSON.stringify({ email: value.emailId, password: value.pwd }), null);
        }
     }

    requestPwdReset(evt, value) {
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.requestPasswordReset(JSON.stringify({ email: value.emailId }), null);
        }
    }


    chpwd(evt, value) {
        evt.preventDefault();
        if (this.auth.userIsAuthenticated()) {
            this.auth.updatePassword(JSON.stringify({ pwd: value.pwd }));
        }
    }

    setup(evt, value){
        evt.preventDefault();
    }

    oauthlogin(provider) {
        this.auth.authenticate(provider, null);
    }

    oauthlogout(){
        this.auth.logout();
    }

    userIsAuthenticated(){
        return this.auth.userIsAuthenticated();
    }

    oauthprofile(){
        this.auth.logout();
    }

    handleAuthEvent(evt:AuthData){
        switch(evt.action){
            case 'login':
            case 'logout':
            case 'register':
            {
                switch(evt.result){
                    case 'success':
                    this.nav.push(TabsPage);
                    break;
                    case 'failed':
                    alert('Auth failure happened');
                    break;
                }
            }
        }
    }

    onClose(evt){
    }
}
