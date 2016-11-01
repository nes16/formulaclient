import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { MyTokenAuth } from './token-auth/auth-service';
import { UIStateService } from './ui-state-service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class BaseService{

	http: any = null;

	constructor(public auth:MyTokenAuth, public uiService:UIStateService
		, @Inject('ApiEndpoint') public apiEndpoint: string){
		this.http = auth.getJwtHttp();
	}
		
	query(method:string, url:string, param:any=null){
		if(!this.uiService.IsOnline)
			return Observable.create(or => {or.next('offline');or.complete();}); 
		return	this.http[method](this.apiEndpoint+url, param?JSON.stringify(param):null)
					.map(res => {
							let body = res.json();
							return body.data || {};
					 })
					//.catch(Util.handleError)
	}

	
}