import { provide } from '@angular/core'
import { HTTP_PROVIDERS } from '@angular/http';
import { providers }  from '../../../test/diExports';
import { inject } from '@angular/core/testing';
import { MyTokenAuth } from './auth-service'
import { JwtHttp } from './jwtHttp'
import {
  addProviders
} from '@angular/core/testing';

describe('Service: auth-service', () => {
  
  //setup
  let myproviders: Array<any> = [
    MyTokenAuth,
    JwtHttp,
    HTTP_PROVIDERS,
    provide(
    'ApiEndpoint', {useValue: 'http://formulalab.net/api/v1'})
  ];

  let originalTimeout;
  let service:MyTokenAuth;

  beforeEach(() => {
    addProviders(myproviders.concat(providers))
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('set the provider',   inject([MyTokenAuth], (s:MyTokenAuth) => {
    service = s;
    expect(true).toBe(true);
  }));

  //specs
  it('should not be authenticated', () => {
     let k = service.userIsAuthenticated() 
     expect(k).toBe(false)
  });

  it('should have proper api endpoint',()=>{

  })

  it('should publish invalid login attempt', (done)=>{
    done();
  })

  it('should able to log in with email', (done)=>{
 done();   
  })

  it('should be authenticated',(done)=>{
done();
  })

  it('should store user information', (done)=>{
done();
  })

  it('should clean token, and user info when logout', (done)=>{
done();
  })

  it('should be deauthenticated',(done)=>{
done();
  })

  it('should able to register a user', (done)=>{
done();
  })

  it('should able to delete account', (done)=>{
done();
  })

  it('should get confirmation mail', (done)=>{
done();
  })

  it('should able to see the profile information', (done)=>{
done();
  })

  it('should able to reset password', (done)=>{
done();
  })

  it('password reset should invalidate existing token',(done)=>{
done();
  })

}) 