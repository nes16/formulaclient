import { Injectable } from '@angular/core';
import { SyncResponseHandler, Category, CR,  States, ResourceCollection, BaseResource
        , Unit, Property, Global, Formula, Variable, Varval, ErrorHandler
        , Favorite, LogHandler, FG, OfflineData, } from '../lib/types/standard';

import { RemoteService } from './remote-service';
import { SqlCacheService } from './sqlcache-service';
import { Observable } from 'rxjs/Rx';
import { UIStateService } from './ui-state-service'
import { UUID } from 'angular2-uuid';

@Injectable()
export class DataService {

    
    // categories: ResourceCollection;
    properties: ResourceCollection<Property> = new ResourceCollection<Property>(this, Property);
    globals: ResourceCollection<Global> = new ResourceCollection<Global>(this, Global);
    units: ResourceCollection<Unit> = new ResourceCollection<Unit>(this, Unit);
    formulas: ResourceCollection<Formula> = new ResourceCollection<Formula>(this, Formula);
    variables: ResourceCollection<Variable> = new ResourceCollection<Variable>(this, Variable);;
    fgs: ResourceCollection<FG> = new ResourceCollection<FG>(this, FG);
    favorites: ResourceCollection<Favorite> = new ResourceCollection<Favorite>(this, Favorite);
    categories: ResourceCollection<Category> = new ResourceCollection<Category>(this, Category);
    crs: ResourceCollection<CR> = new ResourceCollection<CR>(this, CR);
    varvals: ResourceCollection<Varval> = new ResourceCollection<Varval>(this, Varval);
    logHandler:LogHandler;

    

    // formulas: ResourceCollection;
    resourceTables: Array<string> = ['properties', 'units', 'globals'
    , 'formula', 'variables', 'fgs'
    , 'categories', 'crs'];

    initComplete: boolean = false;
    
    constructor(public remoteService: RemoteService
      //Encapsulate cache into cache service
      , public cache: SqlCacheService
      , public uiService: UIStateService) {      
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
      .map(table => Observable.forkJoin(this.getSelectMethod(table)
        , this.cache.getKV(`lastSync_${table}`)
        , this.cache.getKV(`offlineData_${table}`)))
      .concatAll()
      .map((res,i) =>{
        lists[i].addRows(res[0].rows);
        lists[i].offlineData.lastSync = res[1];
        lists[i].offlineData.loadFromCache(lists[i], res[2]) 
      })
      .map((n,i)=>{
        if(i == lists.length-1){
          console.log('Info:Initializing lists...')
          let supportLists = [this.favorites, this.crs] as Array<ResourceCollection<BaseResource>>;
          lists.forEach(li => {
            if(supportLists.indexOf(li) == -1){
              li.State = States.LOAD_COMPLETE;
              this.initListItem(li)
              console.log('Info:Initializing main list complete')
            }
          })
          supportLists.forEach(li => {
            li.State = States.LOAD_COMPLETE;
            this.initListItem(li)
            console.log('Info:Initializing support list complete')
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
        case this.categories:
        return { clist:this.categories }
        case this.varvals:
        return {flist:this.formulas, vlist:this.variables}
        default :
        return {};
      }
    }

    isUnique(table:string, value:string, id:string, predicate: (value: BaseResource, index: number) => boolean ):Observable<any>{
      let oles = new Array<Observable<any>>();
      console.log(table+','+value+','+id)
       oles.push(Observable.create(or => {
          let r = this[table].find(predicate, null)
          if(r)
            or.next({id:r.id}), or.complete();
          else
            or.next({id:id}), or.complete();
        }))

       let combined = Observable.from(oles)
           .map(i => i)
           .concatAll();

       return Observable.create(or => {
         let result = true;
         combined.map(res => {
          console.log(res.id+','+id)
            
           return res.id != id
         }).subscribe(res => {
                   if(res) {
                     result = false;
                     }
                   },err => {
                     ErrorHandler.handle(err, "DataService::isUnique", false);
                     or.error(err)
                    }
                   ,() => {
                     or.next({unique:result}); or.complete()
                   });

       }) 
    }


    sync(li):Observable<any> {
      var lists = this.getDepentent(li);
      return Observable.create(or => {
        var offLineData = ResourceCollection.allOff;
        console.log(JSON.stringify(offLineData.asJson(lists, this.uiService), null, 2));
        //or.complete()
        //Handle response for sync opertaion
        this.remoteService
        .sync({syncInfo: offLineData.asJson(lists, this.uiService)})
        .subscribe(res=>{ 
            //this.uiService.showProgressModal("Syncronizing", "Please wait");
            if(res == 'offline'){
              //this.uiService.closeProgressModal();
              return or.complete();
            }
            console.log(JSON.stringify(res, null, 2));
            this.handleSyncResponse(res)
            .subscribe(res=>{
              or.next(res);
              lists.forEach(li => {
                if(li.eor)
                  li.eor.next(li.findErrorItems())
              })
            },err=>{
              ErrorHandler.handle(err, "DataService::sync->handleSyncResponse", false);
              or.error(err);
            },()=>{
              or.complete()
            })
          },
          err=>{
            ErrorHandler.handle(err, "DataService::sync", false);
            or.error(err);
          })
      })
    }

    checkOnlineAndErrors(r:BaseResource){
      if(this.uiService.IsOnline && this.resourceTables.some(i => this[i].hasErrorInfo()) && !r.hasError())
      {
        console.log("You are online and have items with server errors")
        return false;
      }
      else
        return true;
    }


    handleSyncResponse(offlineData:OfflineData): Observable<any>{
      //Update in memory objects in
      //Resource lists of each table
      return new SyncResponseHandler(offlineData, this,  this.cache).sync();
      
    }
    

    removeItem(r:BaseResource):Observable<any>{
      let items = [r];
      let oles = [] as Observable<any>[];
      let li = this[r.getTable()] as ResourceCollection<BaseResource>;
      if(r.getTable() == 'properties'){
        let prop = r as Property;
        items = items.concat(prop.getChildItems());
      }
      items.forEach(i => {
        let li = this[i.getTable()] as ResourceCollection<BaseResource>;
        li.remove(i);
        oles.push(this.cache.deleteItem(i.getTable(), i.id));
      })
      oles.push(this.saveOfflineData(li))

      return Observable.from(oles)
      .map(i => i)
      .concatAll();
    }
    
    _saveItem(r:BaseResource):Observable<any>{
      let li = this[r.getTable()] as ResourceCollection<BaseResource>;
      if(r.id == null){
        r.id = UUID.UUID();
        r.user_id = this.uiService.userId;
        li.add(r);
        return this.cache.addItem(r)
      }
      else if(r.deleted){
        li.remove(r);
        return this.cache.deleteItem(r.getTable(), r.id);
      }
      else
        if(r.isChanged()){
          li.onUpdate(r);
          return this.cache.updateItem(r)
        }
        else 
          return Observable.empty();
    }  

    saveItemRecursive(r:BaseResource):Observable<any>{
      let cacheOles = new Array<Observable<any>>();
      let items = [r] as Array<BaseResource>;
      if(r.getTable() == 'properties'){
        let prop = r as Property;
        items = items.concat(prop.DefaultUnit);
      }
      else if(r.getTable() == 'formulas'){
        let r1 = r as Formula;
        items = items.concat(r1.Globals);
        items = items.concat(r1.Variables)
      }
      items.forEach(i => {
        cacheOles.push(this._saveItem(i))
      })
      let lists = [];
      items.forEach(i => {if(lists.indexOf(this[i.getTable()]) == -1) lists.push(this[i.getTable()])})

      let saveOle =  Observable.from(cacheOles)
                               .map(i => i)
                               .concatAll()


      let saveOfflineOle = Observable.from(lists)
      .map(li => this.saveOfflineData(li))
      .concatAll()

      return Observable.from([saveOle, saveOfflineOle])
      .concatAll()
    }

    getTable(list: ResourceCollection<BaseResource>): string {
      return list.type.table;
    }

    isDepententInSync(list: ResourceCollection<BaseResource>){
      var deps = this.getDepentent(list);
      return deps.filter(a => a.offlineData.lastSync != list.offlineData.lastSync).length == 0
    }

    isResourceShared(res):boolean{
        let userId = this.uiService.userId; 
        if(!userId)
            return false;
        if(res.user_id == null || res.user_id == userId)
            return false;
        else
            return true;
    }

    getDepentent(list):ResourceCollection<BaseResource>[]{
      let list1 = this.getDepententCore(list);
      if(list == this.crs)
        return list1;
      return list1.concat([this.favorites, this.categories, this.crs])
    }

    getDepententCore(list):ResourceCollection<BaseResource>[]{
      switch (list) {
        case this.properties:
        case this.units:
        return [this.properties, this.units];
        case this.globals:
        return [this.properties, this.units, this.globals]
        case this.formulas:
        case this.variables:
        case this.fgs:
        return [this.properties, this.units, this.globals, this.formulas, this.fgs, this.variables]
        case this.categories:
        return [this.crs]
        default:
        return [list];
      }
    }

    getReferingList(list):ResourceCollection<BaseResource>[]{
      switch (list) {
        case this.properties:
          return [this.units, this.formulas, this.variables];
        case this.units:
          return [this.globals, this.formulas, this.variables];
        case this.globals:
          return [this.fgs]
        case this.formulas:
          return [this.fgs, this.variables]
        case this.variables:
        case this.fgs:
        case this.favorites:
          return [];
      }
    }
    getRefIdColumn(list):string{
        switch (list) {
          case this.properties:
            return 'property_id';
          case this.units:
            return 'unit_id'
          case this.globals:
            return 'global_id';
          case this.formulas:
            return 'formula_id'
          case this.fgs:
            return 'fg_id';
          case this.variables:
            return 'variable_id';
          case this.favorites:
            return 'favorite_id';
          case this.categories:
            return 'category_id';
          case this.crs:
            return 'cr_id'
          default:
            throw('Dataserver:Invalid list passed to getRefIdColumn');
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
        case this.categories:
        this.categories.publishErrors();
        break;
        default:
      }
    }

    getSelectMethod(table:string):Observable<any>{
      if(table == "fgs" || table == "variables" || table == "categories" || table == "crs" || table == "varvals")
        return this.cache.selectAll(table);
      else
        return this.cache.selectAllByUserIds(table, [1, this.uiService.userId]);
    }
}