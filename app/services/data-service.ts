import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { RemoteService } from './remote-service';
import { SqlService } from './sql-service';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import * as Rx from 'rxjs/Rx'; 
import { ResourceCollection, BaseResource, Unit, Property, Global, Formula, Variable, Category, States, OpCodes, ItemSyncState, FG, OfflineData, TableOfflineData, LogHandler} from '../types/standard';
import { UIStateService } from './ui-state-service'
import { Platform } from 'ionic-angular';
/*
 * 
 *
 *
*/
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
        , public sqlService: SqlService
        , private uiService: UIStateService) {      
     
        this.logHandler = new LogHandler("Load items");
        
        

    }

    init():Observable<any> {
        //Sqlservice drop all tables.
        var dropdb = localStorage.getItem("dropdb");
        localStorage.setItem("dropdb", "0");
        if(dropdb)
          dropdb = parseInt(dropdb);
        else
          dropdb = 0;
        if(this.initComplete)
            return Observable.create(or => or.complete())
        else 
            return this.sqlService.init(dropdb);
    }

    setKV(key:string, value:Object):Observable<any>{
        return this.sqlService.setKV(key, JSON.stringify(value))
    }

    getKV(key):Observable<any>{
        return this.sqlService.getKV(key);
    }

    
    loadListAndDepenent(list:ResourceCollection<BaseResource>):Observable<any>{
        var lists = this.getDepentent(list).filter(li => li.State == States.CREATED);
        return Observable.from(lists)
                  .flatMap(li => [this.load(li)
                                , this.loadDeletedItems(li)
                                , this.loadLastSync(li)
                                ])
                  .concat([this.sync(list)])
                  .concatAll()
                  //Log the stream events
                  .do(this.logHandler)
                  .finally(() => {
                    console.log('Info:Initializing lists...')
                    lists.forEach(li => {
                      li.State = States.LOAD_COMPLETE;
                      this.initListItem(li)
                    });
                    console.log('Info:Initializing list complete')
                  })
    }


    
    load(li:ResourceCollection<BaseResource>):Observable<any>{
            return Observable.create(or => {
                this.sqlService.query('select', this.getTable(li), null, null)
                    .subscribe(res => {
                        or.next(res);
                        this.addRows(li, res.res.rows)
                    },err => or.error(err), () => or.complete())
            })        
    }



    loadDeletedItems(li: ResourceCollection<BaseResource>):Observable<any> {
        var table = this.getTable(li);
        return Observable.create(or => {
            this.getKV('deletedItems_'+table)
                .subscribe(res => {
                    or.next(res);
                    if(res)
                      li.offlineData.deletedItems = JSON.parse(res);
                    else
                      li.offlineData.deletedItems = new Array<any>();
                }, err => or.error(err), ()=>or.complete())
        })
    }

    loadLastSync(li:ResourceCollection<BaseResource>):Observable<any>{
      return Observable.create(or => {
        this.getKV('lastSync_'+this.getTable(li)).subscribe(res =>{
          or.next(res);
          li.offlineData.lastSync = res;
        }, err=> or.error(err), ()=>or.complete())
      })
    }


    sync(li):Observable<any> {
      var lists = this.getDepentent(li);
      return Observable.create(or => {
          var offLineData = new OfflineData(lists);
          //Handle response for sync opertaion
          this.remoteService
              .sync({syncInfo: offLineData.asJson()})
              .subscribe(od => {
                or.next(od);
                this.handleSyncResponse(od)
                    .subscribe(res => or.next(res), err=>or.error(err), ()=> or.complete())
              }, err=>or.erro(err), ()=>or.complete())
      })
    }

    handleSyncResponseForTable(tod:TableOfflineData):Observable<any>{
      var li =  this[tod.name] as ResourceCollection<BaseResource>;
      var firstSync = false;
      if(li.offlineData.lastSync == "" || li.offlineData.lastSync == null)
        firstSync = true;
      var offlineResourcesCount = li.offlineData.resources.length;
      if(!firstSync)
        var sameLastSync = (li.offlineData.lastSync.replace(new RegExp("\"",'g'), '') == tod.lastSync.replace(new RegExp("\"",'g'), '')) 
      var memOle = Observable.create(or => {
          //set remote bit for offline data
          //and remove resouces from offline data 
          //set the new lastsync time for this table
          li.offlineData.clearResources(tod.lastSync)

          //New items
          //If the incoming ids are greater than old id
          //reverse the order of updating id to avoid collision
          tod.resources = this.orderResources(tod.resources);
          var jsonResources = tod.resources;
          tod.resources = new Array<BaseResource>();
          jsonResources.forEach(i => {
              if(i.oldId){
                 var lobj  = li.getItem("id", i.oldId)
                 lobj.oldId = i.oldId;
                 if(i.oldId != i.id)
                   this.changedIdsRegressive(li, i.oldId, i.id);
                 tod.resources.push(lobj);
              }
          })
          //Remove json item from list
          jsonResources = jsonResources.filter(i => i.oldId == null)
          jsonResources.forEach(i => {
             var obj = new li.type(i) as BaseResource;
             var lobj = li.getItem("id", obj.id)
             if(i.deleted){
                 if(lobj)
                   li.remove(obj, false, true);
             }
             else if(lobj == null)
               li.add(obj, true);
             else
                lobj.loadState(i)
             
             tod.resources.push(obj);
          })
          or.complete()
      })


    return Observable.from([memOle 
                       , this.setKV('deletedItems_'+ tod.name, this[tod.name].offlineData.deletedItems)
                       , this.lupdateIdsSync(tod)
                       , this.lsaveResourcesSync(tod)
                       , this.setKV('lastSync_'+tod.name, tod.lastSync)
                       , this.lclearSyncState(tod.name)
                       ])
                     .map((item, i) => {
                       //Some of the steps in 
                       //sync response handling is not required
                       //in the cases.
                       //for example, the updateIdsSync
                       //clear sync state are not required when you are 
                       //fetching item first time.
                       if(firstSync)//Fetching rows first time
                         if(i == 1 || i==2 || i==5)
                           return Observable.empty();
                       if(offlineResourcesCount == 0 && i == 5)//There is no local update
                           return Observable.empty();
                       if(i == 1 && this[tod.name].offlineData.deletedItems.length == 0)
                           return Observable.empty();
                       if(i == 4 && sameLastSync)
                           return Observable.empty();  
                       return item;

                     })
                     .concatAll()
                   
    }
    
    //If the incoming ids are greater than old id
    //reverse the order of updating id to avoid collision
    orderResources(resources:BaseResource[]){
      var newResources = new Array<BaseResource> ()
      var news = resources.filter(r => r.oldId != null);
      var isNewResFound:boolean = (news.length >= 2)
      if(!isNewResFound)
         return resources;
       
       var newIdGreater:number = news.filter(r => r.id > r.oldId).length;
       if(newIdGreater > 0)
         return resources.reverse();
       else
         return resources;
    }

    handleSyncResponse(offlineData:OfflineData): Observable<any>{
        //Update in memory objects in
        //Resource lists of each table
        return Observable.from(offlineData.tables)
                         .map(tod => this.handleSyncResponseForTable(tod))
                         .concatAll()
    }
    
    //Update forign key ids of particular table
    lclearSyncState(table):Observable<any>{
        var obj = {};
        obj['syncState'] = 0;
        return this.sqlService.query("update", table, obj, null)
    }


    lupdateIdsSync(tod:TableOfflineData):Observable<any>{
        return Observable.create(or =>  {
            var resources = tod.resources.filter(k => k.oldId !=null);  
            Observable.interval(200)
                  .take(resources.length)
                  .flatMap(i =>  this.lupdateIdItemSync(resources[i]))
                  .concatAll()
                  .subscribe(res=>or.next(res), err=>or.error(err),()=>or.complete())
          })
    }

    lsaveResourcesSync(tod:TableOfflineData):Observable<any>{
        return Observable.create(or =>  {
            var resources = tod.resources.filter(k => k.oldId == null)
            Observable.interval(200)
                  .take(resources.length)
                  .flatMap(i =>  this.lsaveItemSync(resources[i]))
                  .concatAll()
                  .subscribe(res=>or.next(res), err=>or.error(err),()=>or.complete())
        })
    }

    


    lupdateIdItemSync(i:BaseResource):Observable<any>[]{
        var li = this[i.getTable()] as ResourceCollection<BaseResource>;
        if(i.oldId == i.id)
          return [Observable.empty()]
        else
          return this.doOpForAllLists(li, i.oldId, i.id, this.lupdateIds.bind(this), this.emptyObservable()) 
    }



    lsaveItemSync(i:BaseResource):Observable<any>[]{
        var li = this[i.getTable()] as ResourceCollection<BaseResource>;
        if(i.deleted)
            return [this.ldelete(i)]
        else
            return [this.laddorupdate(i)]
    }

    //ldeleteIdsLinkTable(formula, "formula_id", list, groupId, fg, "group_id")
    //opfun2(this.formulas, "formula_id", oldId, newId, this.globals, "global_id")
    ldeleteIdsLinkTable(list, col1, oldId, newId, link, col2){
      var table = this.getTable(list)
      var linkTable = this.getTable(link)
      var cond = { and: {  } } ;
      cond.and["id"] = {cond: 'IN', query:`(select ${col1} from ${linkTable} where ${col2} == ${oldId})`}
      return this.sqlService.query("delete", table, null, cond)
    }

    //Update forign key ids of particular table
    lupdateIds(list, col, oldId, newId):Observable<any>{
        var table = this.getTable(list);
        var cond = { and: {  } } ;
        cond.and[col] = {cond: '=', value:oldId}
        var obj = {};
        obj[col] = newId;
        return this.sqlService.query("update", table, obj, cond)
    }

    //Update forign key ids of particular table
    ldeleteIds(list, col, id):Observable<any>{
        var table = this.getTable(list)
        var cond = { and: {  } } ;
        cond.and[col] = {cond: '=', value:id}
        return this.sqlService.query("delete", table, null, cond)
    }



    ladd(r:BaseResource):Observable<any>{
        return Observable.create(or => {
            this.sqlService
                .query("insert", r.getTable(), r.getState(), null)
                .subscribe(res => {
                  r.id = res.res.insertId;
                  or.next(res)
                }, err=>or.error(err), ()=>or.complete())
            })
    }
    
    //used when sync from remote
    laddorupdate(r:BaseResource):Observable<any>{
        return Observable.create(or => {
            this.sqlService
                .query("insertorupdate", r.getTable(), r.getState(), null)
                .subscribe(res => or.next(res), err=>or.error(err), ()=>or.complete())
            })
    }




     
    lupdate(r: BaseResource) :Observable<any>{
      return Observable.create(or => {
          var cond = { and: { id: { cond: '=', value: r.id } } };
          this.sqlService
              .query("update", r.getTable(), r.getState(), cond)
              .subscribe(res => or.next(res), err=>or.error(err), ()=>or.complete())
          })

    }


    ldeleteMany(table, ids):Observable<any>{
      return Observable.create(or => {
        var cond = { and: { id: { cond: 'in', value: ids } } };
        this.sqlService
            .query("delete", table, null, cond)
            .subscribe(res => or.next(res), err=>or.error(err), ()=>or.complete())
      })
    }

    ldelete(r:any):Observable<any>{
        return Observable.create(or => {
          var cond = { and: { id: { cond: '=', value: r.id } } };
          this.sqlService
              .query("delete", r.getTable(), r.getState(), cond)
              .subscribe(res => or.next(res), err=> or.error(err), ()=>or.complete())
        })
    }

    
    

    //Client API
    //==========
    //These functions are called from UI to store the
    //resources in memory, local store, remote store
    //For each method the function update memony any local storage
    //Then calls sync method to update the server

    add(r: BaseResource) :Observable<any>{
      r.setSyncState(ItemSyncState.NEW);
       var addOle = Observable.create(or => {
           this[r.getTable()].add(r);
           or.complete();
       })
       return Observable.from([this.ladd(r), addOle])
                        .concatAll()
    }


    update(r:BaseResource):Observable<any>{
      if(!r.isChanged()){
        console.log('Info: No change found for in table resource - '+ r.getTable()  + ' id:' + r.id +' Name:' + r.name );
        return Observable.empty();        
      }

      r.setSyncState(ItemSyncState.CHANGE);
      this[r.getTable()].onUpdate(r);
      return Observable.from([this.lupdate(r)])
                       .concatAll()
    }

    remove(r:BaseResource, noSync:boolean = false):Observable<any>{
        r.setSyncState(ItemSyncState.DELETE);
        var removeOle = Observable.create(or => {
           var li = this[r.getTable()] as ResourceCollection<BaseResource>;
           var i = this.removeIdsRegressive(r)
           or.next({removed:{id: r.id, table:r.getTable(), count:i}});
           or.complete()
        })
        var lDeleteIdsOle = this.doOpForAllLists(this[r.getTable()], r.id, null
                                    , this.ldeleteIds.bind(this), this.ldeleteIdsLinkTable.bind(this));
        var syncOle;
        if(noSync){
          syncOle = Observable.call(()=>{
            console.log('No sync called for remove. May be due to currently modifing childitems')
          })
        }
        else
          syncOle= this.sync(this[r.getTable()]);

        return Observable.from([lDeleteIdsOle, [removeOle]])
                    .flatMap(i => i)
                    .concat([syncOle])
                    .concatAll()
                    .do(new LogHandler("Remove Item"))
    }

    saveItem(r:BaseResource):Observable<any>{
       if(r.id == null){
           return this.add(r)
       }
       else
           return this.update(r)
    }

    saveItemRecursive(r:BaseResource):Observable<any>{
       var items = [r];
       if(r.getTable() == "formulas"){
         return Observable.from([this.updateVars(r as Formula), this.updateGlobals(r as Formula) ])
                   .map(i => i)
                   .startWith(this.saveItem(r))
                   .concat([this.sync(this[r.getTable()])])
                   .concatAll()
                   .do(new LogHandler("Save Formula"))
       }
       else{
         items = items.concat(r.getUnsavedChildItems());
         return Observable.from(items)
                   .map(r => this.saveItem(r))
                   .concat([this.sync(this[r.getTable()])])
                   .concatAll()
                   .do(new LogHandler('Save Item'))
       }
    }

    //CLient API Helper functions
    //===========================
    updateVars(f:Formula):Observable<any>{
      return Observable.from(f.Variables)
                       .map(v =>{
                         if(!v.deleted)
                           return this.saveItem(v)
                         else
                           return this.remove(v, true)
                       })
                       .concatAll();
    }

    updateGlobals(f:Formula):Observable<any>{
      return Observable.from(f.Globals)
                       .map(g => {
                         if(!g.deleted)
                           return this.saveItem(g)
                         else {
                           g.deleted = null;
                           return this.remove(g)
                         }
                       })
                       .concatAll();
    }

    //Remote methods
    //==============
    //Currently not used.
    //The sync function is called to update
    //editing items posting to server
    radd(r:BaseResource):Observable<any>{
      return Observable.create(or => {
           this.remoteService
             .add(r.getTable(), r.getState())
             .subscribe(res => or.next(res), err=>or.error(err), ()=>or.complete())
       })
    }

    rupdate(r: any):Observable<any> {
      return Observable.create(or => {
          this.remoteService
              .update(r.getTable(), r.getState())
              .subscribe(res => {
                  r.clearSyncState(ItemSyncState.CHANGE);
              }, err=> {
                  console.log('Error: rupdate - ' + err);
              }, ()=> {
                  console.log('Success: rupdate');
                  or.complete();
              })
          })
    }
    rdelete(r: any) :Observable<any>{
        return Observable.create(or => {
          this.remoteService
               .delete(r.getTable(), r.getState())
               .subscribe(res => {
                    r.clearSyncState(ItemSyncState.DELETE);
                }, err=> {
                    console.log('Error rdelete' + err);
                }, ()=> {
                    console.log('rdelete success');
                    or.complete();
                })
            })
    }

    //Helper functions
    doOpForAllLists(list, oldId, newId, opfun, opfun2):Observable<any>[] {
        switch (list) {
            case this.properties:
                return [opfun(this.properties, 'id', oldId, newId)
                        ,opfun(this.units, 'property_id', oldId, newId)
                        ,opfun(this.formulas, 'property_id', oldId, newId)
                        ,opfun(this.variables, 'property_id', oldId, newId)];
            case this.units:
                return [opfun(this.units, 'id', oldId, newId)
                        ,opfun(this.formulas, 'unit_id', oldId, newId)
                        ,opfun(this.globals, 'unit_id', oldId, newId)
                        ,opfun(this.variables, 'unit_id', oldId, newId)];
            case this.formulas:
                return [opfun(this.formulas, 'id', oldId, newId)
                      ,opfun(this.fgs, 'formula_id', oldId, newId)
                      ,opfun(this.variables, 'formula_id', oldId, newId)];
            case this.globals:
                return [opfun(this.globals, 'id', oldId, newId)
                      ,opfun2(this.formulas, "formula_id", oldId, newId, this.fgs, "global_id")
                      ,opfun(this.fgs, 'global_id', oldId, newId)
                      ,];
            case this.variables:
                return [opfun(this.variables, 'id', oldId, newId)];
            case this.fgs:
                return [opfun(this.fgs, 'id', oldId, newId)];
            default:
                return [Observable.empty()];
        }
    }     

    emptyObservable(){
      return Observable.empty();
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
 
    removeIdsRegressive(r:BaseResource){
        var list = this[r.getTable()]
        this.doOpForAllLists(list, r.id, null, this.removeIds.bind(this), this.removeIdsLinkTable.bind(this));
    }

    removeIds(list, col, id){
      var items = list.filter(i => i[col] == id);
      items.forEach(i => list.remove(i));
    }

    removeIdsLinkTable(list, col, id, newId, link, col2){
      var items = link.filter(i => i[col2] == id);
      var itemsIds = items.map(i=> i.id);
      var mainItems = list.filter(i => itemsIds.indexOf(i.id) != -1) 
      mainItems.forEach(i => list.remove(i));
    }

    changedIdsRegressive(list, oldId, newId){
      this.doOpForAllLists(list, oldId, newId, this.changeId.bind(this), this.emptyObservable());
    }

    changeId(li:ResourceCollection<BaseResource>,col:string, oldId: number, newId: number){
        var items = li.filter(i => i[col] == oldId)
        items.forEach(i => i[col] = newId);
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

    addRows(li:ResourceCollection<BaseResource>, rows){
       var i;
       for(i=0; i< rows.length; i++){
         var obj = new li.type(rows.item(i))
         li.add(obj)
       }
    }    

}