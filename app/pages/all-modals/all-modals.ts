import { FormBuilder, Validators} from '@angular/common';
import { Page, Modal, NavController, NavParams, ViewController } from 'ionic-angular';
import { MyTokenAuth } from '../../services/token-auth/auth-service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Page({
    templateUrl: 'build/pages/all-modals/all-modals.html'
})
export class AllModals {
    option:any;
    login:any;
    register:any;
    forgot:any;
    chpwd:any;
    settings:any;
    error: string;

    constructor(public form: FormBuilder, public auth: MyTokenAuth,
        public nav: NavController, params: NavParams, public viewCtrl: ViewController) {
        this.option = params.get('option');


        this.login = form.group({
            emailId: ["user1@a.com", Validators.required],
            pwd: ["password", Validators.required]
        })

        this.register = form.group({
            emailId: ["", Validators.required],
            pwd: ["", Validators.required],
        })

        this.forgot = form.group({
            emailId: ["", Validators.required],
        })

        this.chpwd = form.group({
            pwd: ["", Validators.required],
        })

        this.settings = form.group({
            system: ["SI", Validators.required],
        })
    }

    dismiss(){
        this.viewCtrl.dismiss();
    }

    ngOnInit() {

    }

    doLogin(evt, value) {
        evt.preventDefault();
        if (!this.auth.userIsAuthenticated()) {
            this.auth.submitLogin(JSON.stringify({ email: value.emailId, password: value.pwd }), null)
                        .subscribe(
                                () => this.dismiss(),
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
        this.auth.authenticate(provider, null);
    }
}
