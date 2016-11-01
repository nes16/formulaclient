import { Injectable } from '@angular/core';
import { BaseService } from './base-service';

@Injectable()
export class RemoteService {

    constructor(public base: BaseService) {

    }

    //Syncronize the servers
    sync(obj:any){
        return this.base.query('put', '/sync', {data:obj})
    }
}
