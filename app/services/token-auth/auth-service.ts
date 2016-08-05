import { Injectable} from '@angular/core';
import { Http, HTTP_PROVIDERS, Headers, BaseRequestOptions, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { JwtHttp } from "./jwtHttp";

@Injectable()
export class MyTokenAuth {
  header:any = null;
  user:any = {};
  mustResetPassword:boolean = false;
  listener:any = null;
  observable: Observable<any> = null;
  observer: Observer<any> = null;
  providerObserver: Observer<any> = null;
  providerObservable: Observable<any> = null;
  requestCredentialsPollingTimer: any = null;
  firstTimeLogin:any = null;
  oauthRegistration:any = null;
  timer: any = null;
  _hasSessionStorage:boolean = false;
  _hasLocalStorage:boolean = false;

  config:any = {
        apiUrl: 'https://young-hollows-77540.herokuapp.com/api/v1',
        signOutUrl: '/auth/sign_out.json',
        emailSignInPath: '/auth/sign_in.json',
        emailRegistrationPath: '/auth',
        accountUpdatePath: '/auth',
        accountDeletePath: '/auth',
        confirmationSuccessUrl: function() {
          return window.location.href;
        },
        passwordResetPath: '/auth/password',
        passwordUpdatePath: '/auth/password',
        passwordResetSuccessUrl: function() {
          return window.location.href;
        },
        tokenValidationPath: '/auth/validate_token',
        proxyIf: function() {
          return false;
        },
        proxyUrl: '/proxy',
        validateOnPageLoad: true,
        omniauthWindowType: 'newWindow',
        storage: 'localStorage',
        forceValidateToken: false,
        tokenFormat: {
          "Access-Token": "token",
          "Token-Type": "Bearer",
          Client: "clientId",
          Expiry: "expiry",
          Uid: "uid"
        },
        cookieOps: {
          path: "/",
          expires: 9999,
          expirationUnit: 'days',
          secure: false
        },
        createPopup: function(url) {
          return window.open(url, '_blank', 'closebuttoncaption=Cancel');
        },
        parseExpiry: function(headers) {
          return (parseInt(headers['expiry'], 10) * 1000) || null;
        },
        handleLoginResponse: function(resp) {
          return resp;
        },
        handleAccountUpdateResponse: function(resp) {
          return resp;
        },
        handleTokenValidationResponse: function(resp) {
          return resp;
        },
        authProviderPaths: {
          github: '/auth/github',
          facebook: '/auth/facebook',
          google: '/auth/google_oauth2'
        }
      }

  constructor(public http: JwtHttp) {
    this.http.setAuth(this);
    this.initializeListeners();
    this.observable = Observable.create(observer => { 
                this.observer = observer;
    });
    //subscribe locally to create observer
    this.observable.subscribe(res => {})
    
    if (this.config.validateOnPageLoad) {
      this.validateUser();
    }
  }

  getJwtHttp(){
    return this.http;
  }

  cancelOmniauthInAppBrowserListeners() {
  }
  
    
  initializeListeners() {
    this.listener = this.handlePostMessage.bind(this);
    window.addEventListener('message', this.listener)
  }

  destroy() {
    this.cancel(null);
    window.removeEventListener('message', this.listener, false);
  }

  cancel(reason:any) {
    if (this.requestCredentialsPollingTimer != null) {
      clearTimeout(this.requestCredentialsPollingTimer);
    }
    this.cancelOmniauthInAppBrowserListeners();
    if (this.observer != null) {
      this.observer.complete();
    }
    setTimeout(() => {
      this.requestCredentialsPollingTimer = null;
    }, 0);
  }

  handlePostMessage(ev) {
    var error, oauthRegistration;
    if (ev.data.message === 'deliverCredentials') {
      delete ev.data.message;
      oauthRegistration = ev.data.oauth_registration;
      delete ev.data.oauth_registration;
      this.handleValidAuth(ev.data, true);
      this.observer.next({ event: 'auth:login-success', data: ev.data });
      if (oauthRegistration) {
        this.observer.next({ event: 'auth:oauth-registration', data: ev.data });
      }
    }
    if (ev.data.message === 'authFailure') {
      error = {
        reason: 'unauthorized',
        errors: [ev.data.error]
      };
      this.cancel(error);
      return this.observer.next({ event: 'auth:login-error', data: error });
    }
  }

  //service interfaces
  submitRegistration(params, opts) {
    var successUrl;
    if (opts == null) {
      opts = {};
    }
    successUrl = this.getResultOrValue(this.config.confirmationSuccessUrl);
    var param1 = Object.assign(JSON.parse(params), {
      confirm_success_url: successUrl,
    });
    params = JSON.stringify(param1);
    return this.http.post(this.config.apiUrl + this.config.emailRegistrationPath, params, null)
      .map(resp => {
        this.observer.next({
          event: 'auth:registration-email-success',
          data:  params})})
      .catch(resp => {
        this.observer.next({
          event: 'auth:registration-email-error',
          data: resp})})
  }

  submitLogin(params, opts) {
    if (opts == null) {
      opts = {};
    }
        var headers = {headers : new Headers({
          'Content-Type': 'application/json'
        })}


    return this.http.post(this.config.apiUrl + this.config.emailSignInPath, params, headers)
      .map(resp => {
        var authData;
        authData = this.config.handleLoginResponse(JSON.parse(resp._body).data);
        this.handleValidAuth(authData, null);
        this.observer.next({ event: 'auth:login-success', data: this.user });})
      .catch(error => {
        this.observer.next({ event: 'auth:login-error', data: error });
        return error;
      })
  }

  submitLogin123(params, opts) {
    if (opts == null) {
      opts = {};
    }
        var headers = {headers : new Headers({
          'Content-Type': 'application/json'
        })}
    var res = this.http.post(this.config.apiUrl + this.config.emailSignInPath, params, headers)
      .subscribe(resp => {
        var authData;
        authData = this.config.handleLoginResponse(resp._body, this);
        this.handleValidAuth(authData, null);
        this.observer.next({ event: 'auth:login-success', data: this.user });},
       error => {
        this.observer.next({ event: 'auth:login-error', data: error })
        return error;})
  }


  
  signOut() {
    var headers = {headers : new Headers({
      'Content-Type': 'application/json'
    })}
    return this.http["delete"](this.config.apiUrl + this.config.signOutUrl,  headers)
      .map(resp => {
        this.invalidateTokens();
        this.observer.next({event: 'auth:logout-success', data:resp});})
      .catch(resp => {
        this.invalidateTokens();
        this.observer.next({event: 'auth:logout-error', data:resp});})
  }

  requestPasswordReset(params, opts) {
    var successUrl;
    if (opts == null) {
      opts = {};
    }
    successUrl = this.config.passwordResetSuccessUrl;
    params.redirect_url = successUrl;
    return this.http.post(this.config.apiUrl + this.config.passwordResetPath, params, null)
      .map(resp => {
        this.observer.next({ event: 'auth:password-reset-request-success', data: params })})
      .catch(resp => {
        this.observer.next({ event: 'auth:password-reset-request-error', data: resp })})
  }

  updatePassword(params) {
    return this.http.put(this.config.apiUrl + this.config.passwordUpdatePath, params, null)
      .map(resp => {
        this.observer.next({
          event: 'auth:password-change-success',
          data: resp});
        this.mustResetPassword = false;})
      .catch(resp => {
        this.observer.next({
        event: 'auth:password-change-error',
        data: resp})})
  }

  updateAccount(params) {
    return this.http.put(this.config.apiUrl + this.config.accountUpdatePath, params, null)
      .map(resp => {
        var curHeaders, key, newHeaders, updateResponse, val, _ref;
        updateResponse = this.config.handleAccountUpdateResponse(resp);
        curHeaders = this.retrieveData('auth_headers');
        Object.assign(this.user, updateResponse);
        if (curHeaders) {
          newHeaders = {};
          _ref = this.config.tokenFormat;
          for (key in _ref) {
            val = _ref[key];
            if (curHeaders[key] && updateResponse[key]) {
              newHeaders[key] = updateResponse[key];
            }
          }
          this.setAuthHeaders(newHeaders);
        }
        this.observer.next({
          event: 'auth:account-update-success',
          data: resp});})
      .catch(resp => {
        this.observer.next({
          event: 'auth:account-update-error',
          data: resp});})
  }

  destroyAccount(params) {
    return this.http["delete"](this.config.apiUrl + this.config.accountUpdatePath, params)
      .map(resp => {
        this.invalidateTokens();
        this.observer.next({
          event: 'auth:account-destroy-success',
          data: resp});})
      .catch(resp => {
        this.observer.next({
          event: 'auth:account-destroy-error',
          data: resp});});
  }

  authenticate(provider, opts) {
    if (opts == null) {
      opts = {};
    }
    this.openAuthWindow(provider, opts);
    this.providerObservable = Observable.create(observer => this.providerObserver = observer);
    return this.providerObservable;
  }
  
  //Helper function
  userIsAuthenticated() {
    return this.retrieveData('auth_headers') && this.user.signedIn && !this.tokenHasExpired();
  }

  openAuthWindow(provider, opts){
    var authUrl, omniauthWindowType;
    omniauthWindowType = this.config.omniauthWindowType;
    authUrl = this.buildAuthUrl(omniauthWindowType, provider, opts);
    if (omniauthWindowType === 'newWindow') {
      this.requestCredentialsViaPostMessage(this.config.createPopup(authUrl));
    } else if (omniauthWindowType === 'inAppBrowser') {
      this.requestCredentialsViaExecuteScript(this.config.createPopup(authUrl));
    } else if (omniauthWindowType === 'sameWindow') {
      this.visitUrl(authUrl);
    } else {
      throw 'Unsupported omniauthWindowType "#{omniauthWindowType}"';
    }
  }

  visitUrl(url) {
    return window.location.replace(url);
  }

  buildAuthUrl(omniauthWindowType, provider, opts) {
    var authUrl, key, params, val;
    if (opts == null) {
      opts = {};}
    authUrl = this.config.apiUrl;
    authUrl += this.config.authProviderPaths[provider];
    authUrl += '?auth_origin_url=' + encodeURIComponent(window.location.href);
    params = Object.assign({}, opts.params || {}, {
      omniauth_window_type: omniauthWindowType});
    for (key in params) {
      val = params[key];
      authUrl += '&';
      authUrl += encodeURIComponent(key);
      authUrl += '=';
      authUrl += encodeURIComponent(val);}
    return authUrl;
  }

  requestCredentialsViaPostMessage(authWindow) {
    if (authWindow.closed) {
      return this.handleAuthWindowClose(authWindow);}
   else {
      authWindow.postMessage("requestCredentials", "*");
      this.requestCredentialsPollingTimer = setTimeout(() => this.requestCredentialsViaPostMessage(authWindow), 500);}
  }

  requestCredentialsViaExecuteScript(authWindow) {
    var handleAuthWindowClose, handleLoadStop;
    this.cancelOmniauthInAppBrowserListeners();
    handleAuthWindowClose = this.handleAuthWindowClose.bind(this, authWindow);
    handleLoadStop = this.handleLoadStop.bind(this, authWindow);
    authWindow.addEventListener('loadstop', handleLoadStop);
    authWindow.addEventListener('exit', handleAuthWindowClose);
    return this.cancelOmniauthInAppBrowserListeners = function() {
      authWindow.removeEventListener('loadstop', handleLoadStop);
      return authWindow.removeEventListener('exit', handleAuthWindowClose);};
  }

  handleLoadStop(authWindow) {
    return authWindow.executeScript({
      code: 'requestCredentials()'
      }, response => {
        var data, ev;
        data = response[0];
        if (data) {
          ev = new Event('message');
          ev.data = data;
          this.cancelOmniauthInAppBrowserListeners();
          window.dispatchEvent(ev);
          authWindow.close();
        }});
  }

  handleAuthWindowClose(authWindow) {
    this.cancel({
      reason: 'unauthorized',
      errors: ['User canceled login']
    });
    this.cancelOmniauthInAppBrowserListeners();
    this.observer.next({ event: 'auth:window-closed', data: {} });
  }

  buildQueryString(param, prefix) {
    var encoded, k, str, v;
    str = [];
    for (k in param) {
      v = param[k];
      k = prefix ? prefix + "[" + k + "]" : k;
      encoded = (v instanceof Object) ? this.buildQueryString(v, k) : k + "=" + encodeURIComponent(v);
      str.push(encoded);}
    return str.join("&");
  }

  parseLocation(location) {
    var i, locationSubstring, obj, pair, pairs;
    locationSubstring = location.substring(1);
    obj = {};
    if (locationSubstring) {
      pairs = locationSubstring.split('&');
      pair = void 0;
      i = void 0;
      for (i in pairs) {
        i = i;
        if ((pairs[i] === '') || (typeof pairs[i] === 'function')) {
          continue;
        }
        pair = pairs[i].split('=');
        obj[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
      }
    }
    return obj;
  }

  validateUser() {
    var clientId, expiry, location_parse, params, search, token, uid, url;
    
    if (this.userIsAuthenticated()) {
      //resolve
    } else {
      params = this.parseLocation(window.location.search);
      token = params.auth_token || params.token;
      if (token !== void 0) {
        clientId = params.client_id;
        uid = params.uid;
        expiry = params.expiry;
        this.mustResetPassword = params.reset_password;
        this.firstTimeLogin = params.account_confirmation_success;
        this.oauthRegistration = params.oauth_registration;
        this.setAuthHeaders(this.buildAuthHeaders({
          token: token,
          clientId: clientId,
          uid: uid,
          expiry: expiry
        }));
        url = window.location || '/';
        ['auth_token', 'token', 'client_id', 'uid', 'expiry', 'config', 'reset_password', 'account_confirmation_success', 'oauth_registration'].forEach(function(prop) {
          return delete params[prop];
        });
        if (Object.keys(params).length > 0) {
          url += '?' + this.buildQueryString(params, null);
        }
        window.location = url;
      }
      
      if (this.config.forceValidateToken) {
        this.validateToken(null);
      } else if (!this.isEmpty(this.retrieveData('auth_headers'))) {
        if (this.tokenHasExpired()) {
          this.observer.next({
              event: 'auth:session-expired'});
        } else {
          this.validateToken(null);
        }
      } else {
        this.observer.next({event: 'auth:invalid', data:{}});
      }
    }
  }

  validateToken(opts) {
    if (opts == null) {
      opts = {};
    }
    if (!this.tokenHasExpired()) {
      return this.http.get(this.config.apiUrl + this.config.tokenValidationPath, null)
        .map(resp => {
          var authData;
          authData = JSON.parse(this.config.handleTokenValidationResponse(resp));
          this.handleValidAuth(authData, null);
          if (this.firstTimeLogin) {
            this.observer.next({
              event: 'auth:email-confirmation-success',
              data:   this.user});
          }
          if (this.oauthRegistration) {
            this.observer.next({ event: 'auth:oauth-registration', data: this.user });
          }
          if (this.mustResetPassword) {
            this.observer.next({ event: 'auth:password-reset-confirm-success', data: this.user });
          }
          this.observer.next({ event: 'auth:validation-success', data: this.user });})
        .catch(data => {
          if (this.firstTimeLogin) {
            this.observer.next({
              event: 'auth:email-confirmation-error',
              data: data
            });
          }
          if (this.mustResetPassword) {
            this.observer.next({ event: 'auth:password-reset-confirm-error data:', data });
          }
          this.observer.next({ event: 'auth:validation-error', data: data });})
    } else {
      
    }
  }

  tokenHasExpired() {
    var expiry, now;
    expiry = this.getExpiry();
    now = new Date().getTime();
    return expiry && expiry < now;
  }

  getExpiry() {
    return this.config.parseExpiry(this.retrieveData('auth_headers') || {});
  }

  invalidateTokens() {
    var key, val, _ref;
    _ref = this.user;
    for (key in _ref) {
      val = _ref[key];
      delete this.user[key];
    }
    if (this.timer != null) {
      clearTimeout(this.timer);
    }
    return this.deleteData('auth_headers');
  }

  
  handleValidAuth(user, setHeader) {
    if (setHeader == null) {
      setHeader = false;
    }
    if (this.requestCredentialsPollingTimer != null) {
      clearTimeout(this.requestCredentialsPollingTimer);
      setTimeout(() => this.requestCredentialsPollingTimer = null, 0);
    }
    this.cancelOmniauthInAppBrowserListeners();
    
    Object.assign(this.user, user);
    this.user.signedIn = true;
    if (setHeader) {
      this.setAuthHeaders(this.buildAuthHeaders({
        token: this.user.auth_token,
        clientId: this.user.client_id,
        uid: this.user.uid,
        expiry: this.user.expiry
      }));
    }
  }


  buildAuthHeaders(ctx) {
    var headers, key, val, _ref;
    headers = {};
    _ref = this.config.tokenFormat;
    for (key in _ref) {
      val = _ref[key];
      headers[key] = ctx[val];
    }
    return headers;
  }

  persistData(key, val, configName) {
    if (this.config.storage instanceof Object) {
      return this.config.storage.persistData(key, val, this.config);
    } else {
      switch (this.config.storage) {
        case 'localStorage':
          return window.localStorage.setItem(key, JSON.stringify(val));
        default:
          return window.sessionStorage.setItem(key, JSON.stringify(val));
      }
    }
  }

  retrieveData(key) {
    var e;
    try {
      if (this.config.storage instanceof Object) {
        return this.config.storage.retrieveData(key);
      } else {
        switch (this.config.storage) {
          case 'localStorage':
            return JSON.parse(window.localStorage.getItem(key));
          default :
            return JSON.parse(window.sessionStorage.getItem(key));
        }
      }
    } catch (_error) {
      e = _error;
      if (e instanceof SyntaxError) {
        return void 0;
      } else {
        throw e;
      }
    }
  }

  deleteData(key) {
    if (this.config.storage instanceof Object) {
      this.config.storage.deleteData(key);
    }
    switch (this.config.storage) {
      case 'localStorage':
        return window.localStorage.removeItem(key);
      default:
        return window.sessionStorage.removeItem(key);
   }
  }

  setAuthHeaders(h) {
    var expiry, newHeaders, now, result;
    newHeaders = Object.assign(this.retrieveData('auth_headers') || {}, h);
    result = this.persistData('auth_headers', newHeaders, null);
    expiry = this.getExpiry();
    now = new Date().getTime();
    if (expiry > now) {
      if (this.timer != null) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(() => this.validateUser(), expiry - now);
    }
    return result;
  }

  getResultOrValue(arg) {
    if (typeof arg === 'function') {
      return arg();
    } else {
      return arg;
    }
  }

  hasSessionStorage() {
    var error;
    if (this._hasSessionStorage == null) {
      this._hasSessionStorage = false;
      try {
        window.sessionStorage.setItem('ng-token-auth-test', 'ng-token-auth-test');
        window.sessionStorage.removeItem('ng-token-auth-test');
        this._hasSessionStorage = true;
      } catch (_error) {
        error = _error;
      }
    }
    return this._hasSessionStorage;
  }

  hasLocalStorage() {
    var error;
    if (this._hasLocalStorage == null) {
      this._hasLocalStorage = false;
      try {
        window.localStorage.setItem('ng-token-auth-test', 'ng-token-auth-test');
        window.localStorage.removeItem('ng-token-auth-test');
        this._hasLocalStorage = true;
      } catch (_error) {
        error = _error;
      }
    }
    return this._hasLocalStorage;
  }

  getApiUrl(){
    return this.config.apiUrl;
  }

  isEmpty(obj) {
    var key, val;
    if (!obj) {
      return true;
    }
    if (obj.length > 0) {
      return false;
    }
    if (obj.length === 0) {
      return true;
    }
    for (key in obj) {
      val = obj[key];
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return false;
      }
    }
    return true;
  };

}

