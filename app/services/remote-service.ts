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

    all(resource: string, last_synced:Date, current_sync:Date) {
        if(last_synced)
            var url = this.getPrefix(resource) + `/${resource}?last_synced=${last_synced}&current_sync=${current_sync}`
        else
            var url = this.getPrefix(resource) + `/${resource}?current_sync=${current_sync}`

        return this.base.query('get', url);
    }

    getPrefix(resource){
        var prefix = '';
        if (resource == 'properties' || resource == 'units')
            prefix = '/std'
        return prefix;
    }

    filter(resource: string, key: string) {
        return this.base.query('get', this.getPrefix(resource) + `/${resource}?search=${key}`);
    }

    update(resource: string, f: any) {
        var id = f.id;
        return this.base.query('patch', this.getPrefix(resource)  + `/${resource}/${id}`, { data: f })
    }

    delete(resource: string, f: any) {
        var id = f.id;
        return this.base.query('delete', this.getPrefix(resource)  + `/${resource}/${id}`)
    }

    children(parent: string, resource: string, id: number) {
        return this.base.query('get', this.getPrefix(resource) + `/${parent}/${id}/${resource}`)
    }

    item(resource: string, id: number){
        return this.base.query('get', this.getPrefix(resource)  + `/${resource}/${id}`)
    }

    add(resource:string, obj:any){
        return this.base.query('post', this.getPrefix(resource) + `/${resource}`, { data: obj })
    }

    //Syncronize the servers
    sync(obj:any){
        return this.base.query('put', '/sync', {data:obj})
    }
    get OnLine(){
        return true;
    }
}
