import { provide, Type }                              from '@angular/core';
import { ComponentFixture, TestComponentBuilder }     from '@angular/compiler/testing';
import { inject }                                from '@angular/core/testing';
import { Control }                                    from '@angular/common';
import { ConfigMock, NavMock }                        from './mocks';
import { Utils }                                      from '../app/services/utils';
import { DataService } from '../app/services/data-service'
import { SqlCacheService } from '../app/services/sqlcache-service'
import { Content, App, Platform, NavController, Config} from 'ionic-angular';
import { RemoteService } from '../app/services/remote-service'
import { UIStateService } from '../app/services/ui-state-service'
import { BaseService } from '../app/services/base-service'
import { MyTokenAuth } from '../app/services/token-auth/auth-service'
import { SqlService } from '../app/services/sql-service'
import { JwtHttp } from '../app/services/token-auth/jwtHttp'
import { Http, HTTP_PROVIDERS, Headers, ConnectionBackend, BaseRequestOptions, Request, RequestOptions, RequestOptionsArgs, RequestMethod, Response } from '@angular/http';

export { TestUtils }                                  from './testUtils';

export let providers: Array<any> = [
  provide(Config, {useClass: ConfigMock}),
  provide(App, {useClass: ConfigMock}),        // required by ClickerList
  provide(NavController, {useClass: NavMock}), // required by ClickerList
  provide(Platform, {useClass: ConfigMock}),   // -> IonicApp
];

export let injectAsyncWrapper: Function = ((callback) => inject([TestComponentBuilder], callback));

export let asyncCallbackFactory: Function = ((component, testSpec, detectChanges, beforeEachFn) => {
  return ((tcb: TestComponentBuilder) => {
    return tcb.createAsync(component)
      .then((fixture: ComponentFixture<Type>) => {
        testSpec.fixture = fixture;
        testSpec.instance = fixture.componentInstance;
        testSpec.instance.control = new Control('');
        if (detectChanges) fixture.detectChanges();
        if (beforeEachFn) beforeEachFn(testSpec);
      })
      .catch(Utils.promiseCatchHandler);
  });
});
