import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { RemoteService } from './remote-service';
import { SqlCacheService } from './sqlcache-service';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { ResourceCollection, BaseResource, Unit, Property, Global, Formula, Variable } from '../types/standard';
import { SyncSuccessHandler, SyncFailureHandler, Category, States, OpCodes, ItemSyncState } from '../types/standard'
import { FG, OfflineData, TableOfflineData, LogHandler, pass, AsyncSync } from '../types/standard'
import { UIStateService } from './ui-state-service'
import { Platform } from 'ionic-angular';

@Injectable()
export class DataService {

    // categories: ResourceCollection;
    properties: ResourceCollection<Property> = new ResourceCollection<Property>(this, Property);
    globals: ResourceCollection<Global> = new ResourceCollection<Global>(this, Global);
    units: ResourceCollection<Unit> = new ResourceCollection<Unit>(this, Unit);
    formulas: ResourceCollection<Formula> = new ResourceCollection<Formula>(this, Formula);
    variables: ResourceCollection<Variable> = new ResourceCollection<Variable>(this, Variable);;
    fgs: ResourceCollection<FG> = new ResourceCollection<FG>(this, FG);
    categories: ResourceCollection<Category> = new ResourceCollection<Category>(this, Category);
    
    logHandler:LogHandler;

    // formulas: ResourceCollection;
    resourceTables: Array<string> = ['properties', 'units', 'globals'
    , 'formula', 'variables', 'fgs'
    , 'categories'];

    initComplete: boolean = false;
    
    constructor(private platform: Platform
      , public remoteService: RemoteService
      //Encapsulate cache into cache service
      , public cache: SqlCacheService
      , private uiService: UIStateService) {      
      //What is this
      //Why log handler
      //When it is required, is it required in production?    
      this.logHandler = new LogHandler("Load items");
    }

    init():Observable<any> {
      //cache drop all tables.
      return this.cache.init()
      .map(i => {this.initComplete = true; return Observable.empty()})
    }


    loadListAndDepenent(list:ResourceCollection<BaseResource>):Observable<any>{
      let lists = this.getDepentent(list).filter(li => li.State == States.CREATED);

      return Observable.from(lists)
      .map(li => this.getTable(li))
      .map(table => Observable.forkJoin(this.cache.selectAll(table)
        , this.cache.getKV(`lastSync_${table}`)
        , this.cache.getKV(`offlineData_${table}`)))
      .concatAll()
      .map((res,i) =>{
        lists[i].addRows(res[0].rows);
        lists[i].offlineData.clearResources(res[1]);
        lists[i].offlineData.loadFromCache(lists[i], res[2]) 
      })
      .map((n,i)=>{
        if(i == lists.length-1){
          console.log('Info:Initializing lists...')
          lists.forEach(li => {
            li.State = States.LOAD_COMPLETE;
            this.initListItem(li)
            console.log('Info:Initializing list complete')
          })
        }
      })
    }


    saveOfflineData(li:ResourceCollection<BaseResource>):Observable<any>{
        let table = this.getTable(li);
        return this.cache.setKV(`offlineData_${table}`, JSON.stringify(li.offlineData.asJSONForCache()))
    }

    initListItem(list){
      list.initItems(this.getInitParameters(list))
    }

    getInitParameters(list):any{
      switch (list) {
        case this.properties:
        return { ulist: this.units };
        case this.globals:
        return { ulist: this.units};
        case this.formulas:
        return { plist:this.properties, ulist: this.units, vlist:this.variables, glist:this.globals, fglist:this.fgs};
        default :
        return {};
      }
    }

    isUnique(table:string, field:string, value:string, predicate: (value: BaseResource, index: number) => boolean ):Observable<any>{
      if(this.uiService.IsOnline)
        return Observable.create(or => {
          this.remoteService
          .isUnique({table:table, field:field, value:value})
          .subscribe(od => {
            or.next(od);
          }, err=>or.erro(err), ()=>or.complete())
        })
      else
        return Observable.create(or => {
          if(this[table].find(predicate, null))
            or.next(false), or.complete();
          else
            or.next(true), or.complete();
        })
    }


    sync(li):Observable<any> {
      var lists = this.getDepentent(li);
      return Observable.create(or => {
        var offLineData = new OfflineData(lists);
        //Handle response for sync opertaion
        var syncResponse = null;
        this.remoteService
        .sync({syncInfo: offLineData.asJson()})
        .map(i => i.success?this.handleSyncSuccess(i):this.handleSyncFailure(i))
        .subscribe()
      })
    }



    handleSyncSuccess(offlineData:OfflineData): Observable<any>{
      //Update in memory objects in
      //Resource lists of each table
      return new SyncSuccessHandler(offlineData, this,  this.cache).sync();
    }


    handleSyncFailure(offlineData:OfflineData): Observable<any>{
      //Update in memory objects in
      //Resource lists of each table
      return new SyncFailureHandler(offlineData, this,  this.cache).sync();
    }

    removeItem(r:BaseResource):Observable<any>{
      let items = [r];
      if(r.getTable() == 'properties'){
        let prop = r as Property;
        items = items.concat(prop.getChildItems());
      }
      items.forEach(i => {
        let li = this[r.getTable()] as ResourceCollection<BaseResource>;
        li.remove(r);
      })
      return Observable.from(items)
        .map(r => this.cache.deleteItem(r.getTable(), r.id))
        .concatAll()
    }
    
    _saveItem(r:BaseResource){
      let li = this[r.getTable()] as ResourceCollection<BaseResource>;
      if(r.id == null)
        li.add(r);
      else if(r.deleted)
        li.remove(r);
      else
        li.onUpdate(r);
    }  

    saveItemRecursive(r:BaseResource):Observable<any>{

      let items = [r] as Array<BaseResource>;
      if(r.getTable() == 'properties'){
        let prop = r as Property;
        items = items.concat(prop.DefaultUnit);
      }
      items.forEach(i => {
        this._saveItem(i)
      })
      let lists = [];
      items.forEach(i => {if(lists.indexOf(this[i.getTable()]) == -1) lists.push(this[i.getTable()])})

      let saveOle =  Observable.from(items)
      .map(r => {
        if(r.id == null)
          return Observable.create(or => this.cache.addItem(r)
            .subscribe(res => {
              r.id = res.insertId;
              or.next(res);
            },err=>or.error(err)
              ,() => or.complete()))
        else if(r.deleted)
          return this.cache.deleteItem(r.getTable(), r.id);
        else if(r.isChanged())
          return this.cache.updateItem(r)
        else
          return Observable.empty();
      })
      .concatAll()

      let saveOfflineOle = Observable.from(lists)
      .map(li => this.saveOfflineData(li))
      .concatAll()

      let syncOle = this.sync(this.properties);

      return Observable.from([saveOle, saveOfflineOle, ])
      .concatAll()
    }

    getTable(list: ResourceCollection<BaseResource>): string {
      return list.type.table;
    }

    isDepententInSync(list: ResourceCollection<BaseResource>){
      var deps = this.getDepentent(list);
      return deps.filter(a => a.offlineData.lastSync != list.offlineData.lastSync).length == 0
    }

    getDepentent(list):ResourceCollection<BaseResource>[]{
      switch (list) {
        case this.properties:
        case this.units:
        return [this.properties, this.units];
        case this.globals:
        return [this.properties, this.units, this.globals]
        case this.formulas:
        case this.variables:
        case this.fgs:
        return [this.properties, this.units, this.variables, this.globals, this.formulas, this.fgs]
        default:
        return [list];
      }
    }

    publishErrors(list){
      switch (list) {
        case this.properties:
        this.properties.publishErrors();
        break;
        case this.units:
        this.properties.publishErrors();
        break; 
        case this.globals:
        this.globals.publishErrors();
        break;
        case this.formulas:
        this.formulas.publishErrors();
        break;
        default:
      }
    }



}