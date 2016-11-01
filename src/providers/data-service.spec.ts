import { DataService } from './data-service'
import { SqlCacheService } from './sqlcache-service'
import { Content } from 'ionic-angular';
import { RemoteService } from './remote-service'
import { UIStateService } from './ui-state-service'
import { BaseService } from './base-service'
import { MyTokenAuth } from './token-auth/auth-service'
import { SqlService } from './sql-service'
import { JwtHttp } from './token-auth/jwtHttp'
import { provide } from '@angular/core'
import { HTTP_PROVIDERS } from '@angular/http';
import { providers }  from '../../test/diExports';
import { inject  } from '@angular/core/testing';
import { Observable } from 'rxjs/Observable';
import { Property } from '../types/standard'
import {
  addProviders
} from '@angular/core/testing';


describe('Service: data-service', () => {
  //setup
  let myproviders: Array<any> = [
    DataService, 
    RemoteService,
    SqlCacheService,
    UIStateService,
    SqlService,
    BaseService,
    MyTokenAuth,
    JwtHttp,
    Content,
    HTTP_PROVIDERS,
    provide(
    'ApiEndpoint', {useValue: 'http://formulalab.net/api/v1'})
  ];

  let originalTimeout;
  let service:DataService;
  let cs:SqlCacheService;

  beforeEach(() => {
    addProviders(myproviders.concat(providers))
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });

  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  it('set the provider',   inject([DataService, SqlCacheService], (s:DataService, s1:SqlCacheService) => {
    service = s;
    cs = s1;
    expect(true).toBe(true);
  }));

  
  //specs
  it('should initialize cache service', (done) => {
     service.init().catch(err=>{console.log('Inside catch');return Observable.empty()}).subscribe(res => {
      console.log("inside init");
      cs.selectAll('properties').subscribe(res => {
        
        console.log("inside selectAll" + JSON.stringify(res))
        expect(res.length).toBe(0)

        done();
      })
    })
  });

  it('should save new item', (done) => {
     let p = new Property({name:'Property1'})
     let u = p.newUnit(true);
     u.loadState({name:'Unit1',description:'Unit1',factor:"1"})
     console.log('before save');
     service.saveItemRecursive(p).subscribe(null, null, () => {
       debugger
       cs.selectAll('properties').subscribe(res => {
         console.log('inside save');
         expect(res.rows.length).toBe(1);
         done();
       })
     })
  });

  it('should publish failure message when save failed', (done)=>{
done()
  })

  it('should sync offLine data', (done)=>{
done()

  })
  it('should publish sync operation start and end', (done)=>{
done()

  })
  it('should have propert count of items with error', (done)=>{
done()

  })

}) 