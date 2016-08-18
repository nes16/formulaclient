import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import { DataService } from '../services/data-service';
import { SqlService } from '../services/sql-service';
import { RemoteService } from '../services/remote-service';

export class ResourceCollection<T extends BaseResource>{
    //Data stream
    resources: Array<T>;
    ole: Observable<any>;
    or: Observer<any>;

    eole: Observable<any>;
    eor: Observer<any>;
    
    //State stream
    state: number;
    sole: Observable<any>;
    sor: Observer<any>;

    offlineData: TableOfflineData;

    constructor(public controller: DataService
        , public type: any)
    {

        this.resources = new Array<T>();
        this.state = States.CREATED;

        this.ole = new Observable(or => {
            this.or = or;
            if(this.State == States.LOAD_COMPLETE)
                or.next(this.resources);
            else
                Observable.from([this.controller.init(), this.controller.loadListAndDepenent(this)])
                          .map(i =>  i)
                          .concatAll()
                          .do(new LogHandler('Init DB'))
                          .subscribe(res=>{
                          },err=>{

                          },() => {
                                or.next(this.resources);
                           })
        });

        this.offlineData = new TableOfflineData(type.table);

        this.eole = new Observable(eor => {
                this.eor = eor;
                eor.next(this.findErrorItems());
        });
    }

    findErrorItems(){
        var errorItems = this.offlineData.getAll().filter(i => i.error_code > 0);
        var childItems = this.resources.filter(i => i.getChildItems().some(j => j.error_code > 0))
        errorItems = errorItems.concat(childItems.filter(i => errorItems.indexOf(i) == -1))
        return errorItems;
    }

    initItems(info) {
        this.resources.forEach(r => { r.init(info) })
    }

    getItem(key: string, val: any): T {
        return this.resources.find(r => r[key] == val)
    }

       
    add(r:T, syncronizing:boolean =false){
        if(r.id){
            if(this.getItem("id", r.id))
                return;
            this.resources.push(r);
            if(!syncronizing)
                this.offlineData.addResource(r, "added");
        }
    }

    onUpdate(r:T){
        this.offlineData.addResource(r, "updated");
    }


    remove(r1:T, child:boolean = false, syncronizing:boolean =false){
        var r = this.getItem("id", r1.id)
        if(r){
            this.resources.splice(this.resources.indexOf(r), 1)
            if(!child && !syncronizing)
                this.offlineData.addResource(r1, "deleted")
        }
    }

    
    set State(state){
        this.state = state;
        console.log('Set state - ' + state)
    }

    get State(){
        console.log('Get state - ' + this.state)
        return this.state;
    }

    map(callbackfn: (value: T, index: number, array: T[]) => any, thisArg?: any) {
        return this.resources.map(callbackfn, thisArg);
    }

    filter(callbackfn: (value: T, index: number, array: T[]) => boolean, thisArg?: any) {
        return this.resources.filter(callbackfn, thisArg);
    }

    find(predicate: (value: T, index: number, obj: T[]) => boolean, thisArg?: any) {
        return this.resources.find(predicate, thisArg)
    }

    get length():number{
        return this.resources.length;
    }

    hasErrorInfo(){
        var errorItems = this.findErrorItems();
        return errorItems.length > 0;
    }


    publishErrors(){
        if(!this.eor)
            return;
        this.eor.next(this.findErrorItems());
    }

    addRows(rows){
       var i;
       for(i=0; i< rows.length; i++){
         var obj = new this.type(rows.item(i))
         this.add(obj)
       }
    }
}

export class BaseResource {
    id: number;
    name: string;
    lock_version:number;
    static errors_messages:any = {
        0:"Success",
        1:"Validation error",
        2:"This item was not found in server",
        3:"Your change not syncronized since the new version was already in server.",
        100:"Unknown error"
    }

    static errors_codes:any= {
        success:0,
        validation_error:1,
        item_not_found:2,
        stale_object:3,
        unknown_error:100
    }


    //Internal
    tempId: number;
    deleted:string;
    syncState: number = 0;
    oldState:any;
    error_code:number;
    error_messages:any = null;
    constructor(state){
        this.loadState(state);
    }

    init(obj:any = null) {

    }

    loadState(state){
        this.id = state.id;
        this.name = state.name;
        this.syncState = state.syncState;
        this.deleted = state.deleted;
        this.lock_version = state.lock_version;
        this.error_code = state.error_code;
        if(state.error_messages)
            this.error_messages = JSON.stringify(state.error_messages);
        if(this.syncState == null)
            this.syncState = 0;
        if(this.lock_version == null)
            this.lock_version = 0;
    }

    getState(){
        return { id: this.id, name: this.name, syncState: this.syncState, lock_version:this.lock_version };
    }


    isChanged(){
        if(!this.oldState)
            return true;
        var curState = this.getState(), O
        var keys = Object.keys(curState);
        var k = keys.find(k => curState[k] != this.oldState[k])
        if(k)
            return true;
        else
            return false;
    }
    
    getTable(){
        return "";
    }

    
    setSyncState(state){
        this.syncState |= state;
    }

    clearSyncState(state){
        this.syncState &= ~state;
    }

    clearAllSyncState(){
        this.syncState = 0;
    }
  
    initMeasure(info:any, property_id:number, unit_id:number):Measure{
        if(property_id){
            var plist = info.plist.resources as Array<Property>;
            var p = plist.find(p => p.id == property_id)
            return new Measure(p);
        }
        if(unit_id){
            var ulist = info.ulist.resources as Array<Unit>;
            var u = ulist.find(u => u.id == unit_id)
            return  new Measure(u);
        }
        return new Measure(null);
    }

    destroy(){

    }

    getChildItems():Array<BaseResource>{
        return [];
    }

    enterEdit(){
        this.oldState = this.getState();
    }
    
    isNewPending():boolean{
       return ((ItemSyncState.NEW & this.syncState) != 0)
    }

    isUpdatePending():boolean{
        return ((ItemSyncState.CHANGE & this.syncState) != 0)
    }

    isDeletePending():boolean{
        return ((ItemSyncState.DELETE & this.syncState) != 0)
    }

    getErrorInfo(){
        var errorInfo:any = {};
        errorInfo.message = BaseResource.errors_messages[this.error_code];
        if(this.error_messages){
            errorInfo.fieldErrors = Object.keys(this.error_messages).map(i => {
                var str = i+":";
                this.error_messages[i].forEach(k => str=str+k+"\n")
                return str;
            })
        }
        errorInfo.fieldErrors = [];

        return errorInfo;
    }
}
    
export class Unit extends BaseResource {
    static table: string = 'units';
    
    system: string;
    symbol: string;
    description: string;
    approx: boolean;
    factor: string;
    property_id: number;
    

    //local members
    _property: Property;
    _latex: string;

    constructor(state: any = {}) {
        super(state);
        if (!this.factor)
            this.factor = "5";
        if (!this.name)
            this.name = "New Unit"
        if (!this.symbol)
            this.symbol = "ss"
        if(!this.system)
            this.system = "SI"
        if(!this.approx)
            this.approx = false;
    }

    init(info){
        if(info.property){
            this._property = info.property;
            this._latex = this.parseLatex(this.symbol); 
        }
    }
    

    getState(){
        if(this.Property)
          this.property_id = this.Property.id;
        return Object.assign(super.getState(), { 
          system: this.system,
          symbol: this.symbol,
          description: this.description,
          approx: this.approx,
          factor: this.factor,
          property_id: this.property_id
        });
    }

    loadState(state){
        super.loadState(state);
        this.system = state.system;
        this.symbol = state.symbol;
        this.description = state.description;
        this.approx = state.approx;
        this.factor = state.factor;
        this.property_id = state.property_id;
    }

    getTable():string{
        return Unit.table;
    }

    get Latex():string{
        return this._latex;
    }

    set Symbol(val:string){
        this.symbol = val;
         this._latex = this.parseLatex(this.symbol);   
    }

    get Symbol():string {
        return this.symbol;
    }

    parseLatex(symbol):string {
        var s1 = ''
        var s = symbol
        if(s){
            if(s.length == 1){
                if (s == '_')
                    return this._latex = "\\text{" + this.name + "}";
                return this._latex = "\\text{" + s +"}";
            }
            //replace H2o as H_2o
            s1 = s.replace('H2O', 'H_2O');
            //replace ([a-zA-A])([1-9]) with g1^g2
            var p=/([A-Za-z])([1-9])/
            var s2='';
            while (s1 != s2){
                s2 = s1;
                s1 = s1.replace(p, "$1^$2")
            }
            //replace ((a-zA-A )*) with \text{g1}
            var p2=/([A-Za-z /]+)/
            var s2=''
            var part1='';
            while (s1 != s2){
                s2 = s1;
                s1 = s1.replace(p2, "\\text{$1}")
                if(s1 != s2){
                    part1 += s1.slice(0,s1.lastIndexOf('}')+1)
                    s1 = s1.slice(s1.lastIndexOf('}')+1);
                }
                else{
                    part1 += s1;
                }
            }
            s1 = part1;
            return this._latex = s1;
        }
         return this._latex = s1
    }

    
    get IsDefaultUnit(){
        return this.Factor == 1;
    }

    get Property(){
        return this._property;
    }

    get Factor(){
        if (!this.factor || this.IsFormulaFactor)
            return null;
        else 
            return parseFloat(this.factor);
    }

    get FormulaFactor(){
        if (this.IsFormulaFactor) 
            return this.factor;
        else 
            return null;
    }

    get IsFormulaFactor(){
        if(!this.factor)
            return false;
        return this.factor.indexOf('x') != -1;
    }


    newFormula():Formula{
        var formula = new Formula()
        formula._measure = new Measure(this);
        return formula;
    }

    newGlobal(state):Global{
        var global = new Global(state)
        global.Measure = new Measure(this);
        return global;
    }
}

export class Property extends BaseResource {
    static table: string = 'properties';
    _defaultUnit: Unit;
    _units: Unit[] = new Array<Unit>();
    
    constructor(state: any = {}) {
        super(state);
        if(!this.name)
            this.name = "New Property"
    }

    //called first time after loading
    init(info:any){
        var ulist = info.ulist;
        ulist.resources.forEach(u => {
            if(u.property_id == this.id){
                u.init({property:this})
                this._units.push(u)
                if(u.Factor == 1)
                    this._defaultUnit = u 
            }
        })
    }

    getTable(){
        return Property.table;
    }
    
    get DefaultUnit(){
        return this._defaultUnit;
    }


    updateChildIds(){
        this._units.forEach(u => u.property_id = this.id)   
    }

    newUnit(isDefault: boolean = false):Unit{
        var unit = new Unit();
        unit.init({property:this});
        this._units.push(unit);
        if (isDefault){
             unit.factor = "1";
             this._defaultUnit = unit;
        }
        return unit;
    }

    get Units():any{
            return this._units;
    }

    newFormula():Formula{
        var formula = new Formula({property_id: this.id})
        return formula;
    }


    getChildItems(){
        return this._units;
    }

    enterEdit(){
        super.enterEdit();
        this.DefaultUnit.enterEdit();
    }
}


export class Global extends BaseResource {
    unit_id: number;
    value: string;
    symbol: string;
    static table:string = "globals";

    //private
    _measure: Measure = new Measure(null);
    constructor(state:any = {}) {
        super(state);
        if (!this.name)
            this.name = "New Global";
        if(!this.unit_id)
            this.unit_id = null;
        if(!this.symbol)
            this.symbol = "";
    }

    init(info:any){
        this._measure = this.initMeasure(info, null, this.unit_id)
    }

    getTable(){
        return Global.table;
    }

    getState(){
        return Object.assign(super.getState(), { 
          unit_id: this._measure.UnitId,
          value: this.value,
          symbol: this.symbol,
        });
    }

    loadState(state){
        super.loadState(state);
        this.unit_id = state.unit_id;
        this.value = state.value;
        this.symbol = state.symbol;
    }

    get Measure(){
        return this._measure;
    }

    set Measure(measure){
        this._measure = measure;
    }
}

export class Measure {
    _name:string;
    _latex:string;
    constructor(public measure:Property | Unit){
        if(measure){
            this._name = measure.name;
            if(this.isUnit()){
                this._latex = (measure as Unit).Latex;
            }
            else
                this._latex = "";
        }
        else{
            this._name = "None";
            this._latex = "";
        }
    }

    isMeasure():boolean{
        return (this.isProperty() || this.isUnit())
    }

    isProperty():boolean {
        if (this.measure)
            return !this.measure.hasOwnProperty("property_id");
        else
            return false;
    }

    isUnit():boolean{
        if(this.measure)
            return this.measure.hasOwnProperty("property_id");
        else
            return false;
    }

    get UnitId(){
        if(this.measure){
            if(this.isUnit()) 
                return this.measure.id;
            else 
                return null;

        }
        return null;
    }

    get PropertyId(){
        if(this.measure){
            if(this.isProperty()) 
                return this.measure.id;
            else 
                return null;
        }
        return null;
    }

    get Name(){
        return this._name;
    }

    get Latex(){
        return this._latex;
    }
}

export class Formula extends BaseResource {
    symbol: string;
    latex: string;
    property_id: number;
    unit_id: number;
    static table: string = "formulas";

    //private
    _measure: Measure = new Measure(null);
    _variables: Array<Variable>;
    deletedVars: Array<Variable>;
    _globals: Array<FG>;
    deletedGlobals: Array<FG>;
    constructor(state: any = {}) {
        super(state);
        this._variables = [];
        this._globals = [];
        this.deletedVars = [];
        this.deletedGlobals = [];
        if(!this.latex)
            this.latex = "";
        if(!this.name)
            this.name = "New Formula"
        if(!this.symbol)
            this.symbol = "f"
        if(!this.property_id)
            this.property_id = null;
        if(!this.unit_id)
            this.unit_id = null;
    }

    init(info:any){
        this._measure = this.initMeasure(info, this.property_id, this.unit_id);
        this._variables = info.vlist.resources.filter(i => i.formula_id == this.id)
        this._variables.forEach(i => {
            i.init({formula:this, ulist:info.ulist, plist:info.plist});
        })
        this._globals = info.fglist.resources.filter(i => i.formula_id == this.id)
        this._globals.forEach(i => {
            i.init({formula:this, global:info.glist.getItem("id", i.global_id)});
        })
    }

    getTable(){
        return Formula.table;
    }

    get Variables(){
        return this._variables;
    }

    get Globals(){
        return this._globals;
    }
    set Variables(val){
        this._variables = val;
    }

    set Globals(val){
        this._globals = val;
    }


    enterEdit(){
        super.enterEdit();
        this.Variables.forEach(v => v.enterEdit());
        this.Globals.forEach(g => g.enterEdit());
    }


    getState() {
        return Object.assign(
                super.getState(), { 
                symbol: this.symbol,
                latex: this.latex,
                property_id: this._measure.PropertyId,
                unit_id:  this._measure.UnitId
            });
    }

    loadState(state) {
        super.loadState(state);
        this.symbol = state.symbol;
        this.latex = state.latex;
        this.property_id = state.property_id;
        this.unit_id = state.unit_id;
    }

    get Measure(){
        return this._measure;
    }

    set Measure(val){
        this._measure = val;
    }

}

export class Variable extends BaseResource {
    unit_id: number = null;
    property_id: number;
    formula_id: number;
    symbol: string;
    static table:string = "variables";
    
    //private
    _formula: Formula;
    _measure: Measure = new Measure(null);
    constructor(state:any = {}) {
        super(state);
        if(!this.property_id)
            this.property_id = null;
        if(!this.unit_id)
            this.unit_id = null;
    }

    init(info){
        if(info.formula){
            this._formula = info.formula;
            this._measure = this.initMeasure(info, this.property_id, this.unit_id);
        }
    }

    getTable() {
        return Variable.table;
    }

    getState(){
        if(this._formula){
            this.formula_id = this._formula.id;
        }
        return Object.assign(super.getState(), { 
          formula_id: this.formula_id,
          symbol: this.symbol,
          property_id: this._measure.PropertyId,
          unit_id:  this._measure.UnitId
        });
    }

    loadState(state){
        super.loadState(state);
        this.unit_id = state.unit_id;
        this.formula_id = state.formula_id;
        this.property_id = state.property_id;
        this.symbol = state.symbol;
    }

    get Formula(){
        return this._formula;
    }
    
    set Formula(val){
        this._formula = val;
    }

    get Measure(){
        return this._measure;
    }

    set Measure(val){
        this._measure = val;
    }
}




export class FG extends BaseResource {
    formula_id: number;
    global_id: number;
    static table:string = "fgs"

    _formula: Formula;
    _global: Global;
    constructor(state:any) {
        super(state)
        this.loadState(state);
        if(!this.formula_id)
            this.formula_id = null;
        if(!this.global_id)
            this.global_id = null;
    }

    init(info){
        if(info.formula){
            this._formula = info.formula;
            this._global = info.global;
        }
    }

    getTable() {
        return FG.table;
    }


    getState(){
      this.formula_id = this._formula?this._formula.id:this.formula_id,
      this.global_id = this._global?this._global.id:this.global_id
      var state = Object.assign(super.getState(), 
        { 
            formula_id: this.formula_id,
            global_id: this.global_id
         });

      delete state["name"];
      return state;
    }

    loadState(state){
        super.loadState(state);
        this.formula_id = state.formula_id;
        this.global_id = state.global_id;
    }

    get Formula(){
        return this._formula;
    }

    set Formula(f){
        this._formula = f;
    }


    get Global(){
        return this._global;
    }

    set Global(g){
        this._global = g;
    }
}

export class Category extends BaseResource {
    parent_id: number;
    
    _parent: Category;
    children: Category[];
    
    static table: string = "categories";

    constructor(state:any) {
        super(state);
    }

    init(info){

    }

    getTable():string{
        return Category.table;
    }

    getState(){
        return Object.assign(super.getState(), { parent_id: this._parent?this._parent.id:this.parent_id });
    }

    loadState(state){
        super.loadState(state);
        this.parent_id = state.parent_id;
    }

    onListLoadComplete(){
        
    }
}

export class TableOfflineData {
    added: Array<BaseResource> = new Array<BaseResource>();
    updated: Array<BaseResource> = new Array<BaseResource>();
    deleted: Array<any> = new Array();
    lastSync:string="";
    
    constructor(public name:string){
    
    }


    addResource(res:BaseResource, op:string){
        if(op == 'added'){
            this.added.push(res);
        }else if(op == 'updated'){
            if(this.added.indexOf(res) >= 0)
                return;
            this.updated.push(res);
        }else{
            let i = this.added.indexOf(res);
            if (i >= 0)
                this.added.splice(i, 1);
            else{
                i = this.updated.indexOf(res);
                this.updated.splice(i, 1); 
            }
            this.deleted.push(res);
        }
    }

    getAll():Array<BaseResource>{
        return this.added.concat(this.updated);
    }

    clearResources(lastSync:string){
        this.lastSync = lastSync;
        this.added = new Array<BaseResource>();
        this.updated = new Array<BaseResource>();
        this.deleted = new Array<BaseResource>();
    }

    clearErrors(){
        let all = this.added.concat(this.updated);
        all.forEach(i => {
            i.error_code = 0;
            i.error_messages = null;
        })
    }

    hasOfflineData():boolean{
        return (this.added.length != 0 ||this.updated.length != 0 || this.deleted.length != 0)
    }

    loadFromCache(jdata:any){

    }

    asJSONForCache(){

    }

    asJSON(){
         return {name: this.name
                ,lastSync:this.lastSync
                ,added: this.added.map(r => r.getState())
                ,updated: this.updated.map(r => r.getState())
                ,deleted: this.deleted}

    }
}

export class OfflineData {
    transactionId:string;
    clientId:string;
    tables:Array<TableOfflineData> = new Array<TableOfflineData>();

    constructor(lists:ResourceCollection<BaseResource>[]){
        this.init(lists);
    }

    init(lists:ResourceCollection<BaseResource>[]){
        this.transactionId = ""
        this.clientId = ""
        lists.forEach(li => {
            this.tables.push(li.offlineData);
        })
    }


    asJson(){
        var jsonData = {transactionId: this.transactionId, clientId: this.clientId, tables:[] }
        this.tables.forEach(t => jsonData.tables.push(t.asJSON()))
        return jsonData;
    }

    loadFromJson(jdata:any){

    }


}

export class SyncSuccessHandler{
    constructor(public offlineData:OfflineData, public ds:DataService, public cs:CacheService){
    
    }
    sync():Observable<any>{
        this.syncMem()
        return this.syncCache();
    }

    private syncMem(){
        //Delete exting added items because we will add items
        //from newly created in server
        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            li.offlineData.added.forEach(j => {
                li.remove(j);
            })
        })
        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            i.added.forEach(j => {
                let res = new li.type(j) as BaseResource;
                li.add(res)
            })
        })

        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            i.updated.forEach(j => {
                let res = li.getItem("id", j.id);
                res.loadState(j);
            })
        })

        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            i.deleted.forEach(j => {
                let res = li.getItem("id", j.id);
                res.loadState(j);
            })
        })



    }


    private syncCache():Observable<any>{
        //Delete exting added items because we will add items
        //from newly created in server
        return Observable.create(or =>{
            let a = Observable.from(this.offlineData.tables)
                              .flatMap(t => {
                     let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                     return Observable.from(li.offlineData.added)
                           .map(i => this.cs.deleteItem(li.type.table, i.id))
                           .concatAll()
                })
            let b = Observable.from(this.offlineData.tables)
                              .flatMap(t => {
                     let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                     return Observable.from(t.added)
                                     .map(i => this.cs.addItem(i))
                                     .concatAll()             
                              })

            let c = Observable.from(this.offlineData.tables)
                              .flatMap(t => {
                     let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                     return Observable.from(t.updated)
                                     .map(i => this.cs.updateItem(i))
                                     .concatAll()             
                              })
          let d = Observable.from(this.offlineData.tables)
                            .flatMap(t => {
                   let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                   return Observable.from(t.deleted)
                                   .map(i => this.cs.deleteItem(li.type.table, i))
                                   .concatAll()             
                            })

           Observable.from([a, b, c, d])
                     .concatAll()
                     .subscribe(res =>{

                     }, err => {

                     }, () => {

                     })
        })
    }
}

export class SyncFailureHandler{
    constructor(public offlineData:OfflineData, public ds:DataService, public cs:CacheService){
    
    }
    sync():Observable<any>{
        this.syncMem()
        return this.syncCache();
    }

    private syncMem(){
        

        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            i.added.forEach(j => {
                let res = li.getItem("id", j.id);
                res.error_code = j.error_code;
                res.error_messages = j.error_messages;
            })
            i.updated.forEach(j => {
                let res = li.getItem("id", j.id);
                res.error_code = j.error_code;
                res.error_messages = j.error_messages;
            })
        })

        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            i.deleted.forEach(j => {
                let res = li.getItem("id", j.id);
                li.remove(res);
            })
        })
    }


    private syncCache():Observable<any>{
        //Delete exting added items because we will add items
        //from newly created in server
        return Observable.create(or =>{
            let a = Observable.from(this.offlineData.tables)
                              .flatMap(t => {
                     let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                     return Observable.from(li.offlineData.deleted)
                           .map(i => this.cs.deleteItem(li.type.table, i.id))
                           .concatAll()
                })
            let b = Observable.from(this.offlineData.tables)
                              .flatMap(t => {
                     let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                     return Observable.from(t.added)
                                     .map(i => this.cs.updateItem(li.getItem("id", i.id)))
                                     .concatAll()             
                              })

            let c = Observable.from(this.offlineData.tables)
                              .flatMap(t => {
                     let li = this.ds[t.name] as ResourceCollection<BaseResource>;
                     return Observable.from(t.updated)
                                     .map(i => this.cs.updateItem(li.getItem("id", i.id)))
                                     .concatAll()             
                              })

           Observable.from([a, b, c])
                     .concatAll()
                     .subscribe(res =>{

                     }, err => {

                     }, () => {

                     })
        })
    }
}

export class ChangeHandler{

    constructor(public ds:DataService, public cs:CacheService, public rs:RemoteService){

    } 

    save(res:BaseResource){
        this.saveLocal(res).subscribe(res =>{

        },err => {

        },() => {
            this.saveRemote(res);
        })

    }

    saveRemote(res:BaseResource){
        return this.ds.sync(this.ds[res.getTable()]);
    }

    saveLocal(res:BaseResource):Observable<any>{
        return Observable.create(or => {
            let items = res.getChildItems();
            items = [res].concat(items);
            let li = this.ds[res.getTable()] as ResourceCollection<BaseResource>;
            let op = li.offlineData.deleted.indexOf(res) >= 0?'deleted':null;
            if (!op){
                op = res.id > 0?'added':'updated';
            }
            else
                op = 'updated'
            let a;
            if(op == 'added')
               a = Observable.from(items)
                      .map(i => this.cs.addItem(i))
            else if(a == 'updated')
                a = Observable.from(items)
                            .map(i => this.cs.updateItem(i))
            else
                a = Observable.from(items)
                              .map(i => this.cs.deleteItem(i.getTable(), i.id))

            a.concatAll()
             .subscribe()
        })
    }
}
export class LogHandler{
    processId:number = 0;
    constructor(private process:string = ""){

    }
    //Log the stream events
    next(res){
      this.handleSqlResult(res);
    }

    error(err){
      this.handleSqlError(err);
    }

    complete(){
      console.log('The process completed - '+ this.process +' - ' + this.processId++)
    }

    handleSqlResult(res){
      if(!res || !res.res)
      {
        console.log("INFO: Next result " + JSON.stringify(res, null, 2))
        return;
      }
      res = res.res;
      if(res.stmt)
        console.log(res.stmt);
      if(res.rowsAffected)
        console.log("No of rows affected - " + res.rowsAffected);
    }

    handleSqlError(err){
      if(!err || !err.err){
         console.log('ERROR: '+ JSON.stringify(err));
         return;
      }
      err = err.err;
      if(err.stmt)
        console.log(err.stmt)
      if(err.code)
        console.log('Error code - ' +  err.code)
      if(err.message)
        console.log('Error message - ' +  err.message)
    } 


}
export class States {
    static CREATED:number = 0
    static  LOAD_STARTED:number = 1;
    static  LOAD_COMPLETE:number = 2;
    static INIT_STARTED: number = 3;
    static INIT_COMPLETE: number = 4;
    static FETCH_STARTED: number = 5;
    static FETCH_COMPLETE: number = 6;
    static  SYNC_STARTED:number = 7;
    static SYNC_COMPLETE: number = 8;
}


export class ItemSyncState {
    static NEW: number = 1;
    static CHANGE: number = 2;
    static DELETE: number = 4;
}

export class OpCodes {
    static CREATE: number = 0;
    static UPDATE: number = 1;
    static DELETE: number = 2;
    static MAX_OP: number = 3;
}

export function pass(or){
    return {
        next:res=>or.next(res),
        err:err=>or.error(err),
        complete:()=>or.complete()
    }
}

export interface CacheService{
    deleteItem(table:string, id:number):Observable<any>;
    addItem(item:BaseResource):Observable<any>;
    updateItem(item:BaseResource):Observable<any>;
    selectAll(table:string):Observable<any>;
    setKV(key:string, value:string):Observable<any>;
    getKV(key:string):Observable<any>;
}