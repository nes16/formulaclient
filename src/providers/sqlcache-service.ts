import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { SqlService } from './sql-service'
import { CacheService, BaseResource } from '../lib/types/standard' 

@Injectable()
export class SqlCacheService implements CacheService{

	constructor(public sqlService:SqlService){

	}

	init():Observable<any>{
		return this.sqlService.init()
	}

	deleteItem(table:string, id:string):Observable<any>{
        let cond = { and: { id: { cond: '=', value: id } } };
		return this.sqlService.query({type:"delete", table:table, obj:null, cond:cond})
	}

	deleteMany(table:string, ids:Array<string>):Observable<any>{
		let cond = { and: { id: { cond: 'in', value: ids } } };
		return  this.sqlService.query({type:"delete", table:table, obj:null, cond:cond})
	}

    addItem(item:BaseResource):Observable<any>{
        return this.sqlService.query({type:"insertorupdate", table:item.getTable(), obj:item.getState(), cond:null})
    }

    updateItem(item:BaseResource):Observable<any>{
    	let cond = { and: { id: { cond: '=', value: item.id } } };
    	
    	return this.sqlService
    	 		   .query({type:"update", table:item.getTable(), obj:item.getState(), cond:cond})

    }

    updateMany(items:Array<BaseResource>, field:string, val:any):Observable<any>{
    	if(items.length == 0)
    		return Observable.empty();

		let cond = { and: { id: { cond: 'in', value: items.map(i => i.id) } } };
		let obj = {}
    	obj[field]=val;
    	return this.sqlService
    	 		   .query({type:"update", table:items[0].getTable(), obj:obj, cond:cond})

    }
    
    updateIds(list:string, idField:string, oldId:string, newObj:any){
        let cond = { and: {  } };
        cond.and[idField] = {cond: '=', value:oldId}
        let obj = newObj;
        return this.sqlService
                    .query({type:"update", table:list, obj:obj, cond:cond})        
    }

    selectAll(table:string):Observable<any>{
    	let param = {type:"select", table:table, obj:null, cond:null}
    	return this.sqlService.query(param)
    }

	selectAllByUserIds(table:string, ids:Array<number>):Observable<any>{
		let cond = { and: { user_id: { cond: 'in', value: ids } } };
    	let param = {type:"select", table:table, obj:null, cond:cond}
    	return this.sqlService.query(param)
    }

    setKV(key:string, value:string):Observable<any>{
    	return this.sqlService.setKV(key, value)
    }

    getKV(key:string ):Observable<any>{
    	return this.sqlService.getKV(key)
    }

}    