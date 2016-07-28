import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import {MyTokenAuth} from './token-auth/auth-service';
import {UIStateService} from './ui-state-service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class BaseService{
//https://github.com/ronzeidman/ng2-ui-auth/blob/master/src/jwtHttp.ts
	baseUrlRemote:string = "https://young-hollows-77540.herokuapp.com/api/v1" 
	baseUrlLocal:string = "http://localhost/api/v1" 
	baseUrl:string = this.baseUrlLocal;
	http: any = null;

	constructor(public auth:MyTokenAuth, public uiService:UIStateService){
		this.http = auth.getJwtHttp();
		
	}
		
	query(method:string, url:string, param:any=null){
		if(!this.uiService.IsOnline)
			return Observable.empty(); 
		return	this.http[method](this.baseUrl+url, param?JSON.stringify(param):null)
			.map(res => JSON.parse(res._body).data)
			.catch(error => error)
	}
}