import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {BaseService} from './base-service';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import {Unit, Property} from '../types/standard'

@Injectable()
export class RemoteService {

    constructor(private base: BaseService) {

    }

    //Syncronize the servers
    sync(obj:any){
        return this.base.query('put', '/sync', {data:obj})
    }
}
