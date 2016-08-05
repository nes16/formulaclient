//https://github.com/ronzeidman/ng2-ui-auth/blob/master/src/jwtHttp.ts
import {Injectable, provide, Provider} from '@angular/core';
import {
    Http,
    Request,
    RequestMethod,
    Headers
} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
// import {Shared} from './shared';
/**
 * Created by Ron on 06/01/2016.
 */


@Injectable()
export class JwtHttp {
    _auth: any;
 
    constructor(public _http: Http) {
    }

    setAuth(auth){
        this._auth = auth;
    }

    
    request(url, options) {
        if (url instanceof Request) {
            url.headers = url.headers || new Headers();
            url.headers.set('Content-Type', 'application/json');
            var _ref = this._auth.config.tokenFormat;
            options = {};
            if(this._auth.userIsAuthenticated() && url.url.match(this._auth.getApiUrl()))
                this.setHeaders(url.headers);
        } else {
            options = options || {};
            options.headers = options.headers || new Headers();
            options.headers.set('Content-Type', 'application/json');
            if(this._auth.userIsAuthenticated() && url.match(this._auth.getApiUrl())){
                this.setHeaders(options.headers);
            }
        }
        
        var obsservable = Observable.create(observer => {
            var req = this._http.request(url, options)
                      .map(resp => {

                            this.updateHeadersFromResponse(resp);
                            observer.next(resp); 
                            observer.complete();
                })
                .catch((error: any, caught: Observable<void>) => {
                    console.log('Error : ' + error)
                    return observer.error(error)
                })
                      .subscribe()
                  })
        return obsservable;
    }




    get(url, options) {
        options = options || {};
        options.method = RequestMethod.Get;
        return this.request(url, options);
    }

    post(url, body, options) {
        options = options || {};
        options.method = RequestMethod.Post;
        options.body = body;
        return this.request(url, options);
    }

    put(url, body, options) {
        options = options || {};
        options.method = RequestMethod.Put;
        options.body = body;
        return this.request(url, options);
    }

    delete(url, options) {
        options = options || {};
        options.method = RequestMethod.Delete;
        return this.request(url, options);
    }

    patch(url, body, options) {
        options = options || {};
        options.method = RequestMethod.Patch;
        options.body = body;
        return this.request(url, options);
    }

    head(url, options) {
        options = options || {};
        options.method = RequestMethod.Head;
        return this.request(url, options);
    }

    setHeaders(headers){
        var ref = this._auth.retrieveData('auth_headers')

        Object.keys(ref).forEach((header) => {
            if (!headers.has(header)) {
                headers.set(header, ref[header]);
            }
        });
    }

    updateHeadersFromResponse(resp) {
      var key, newHeaders, val, _ref;
      newHeaders = {};
      _ref = this._auth.config.tokenFormat;
      for (key in _ref) {
        val = _ref[key];
        if (resp.headers.get(key)) {
          newHeaders[key] = resp.headers.get(key);
        }
      }
      if (this.tokenIsCurrent(newHeaders)) {
        return this._auth.setAuthHeaders(newHeaders);
      }
    }

    tokenIsCurrent(headers) {
      var newTokenExpiry, oldTokenExpiry;
      oldTokenExpiry = Number(this._auth.getExpiry());
      newTokenExpiry = Number(this._auth.config.parseExpiry(headers || {}));
      return newTokenExpiry >= oldTokenExpiry;
    }
}