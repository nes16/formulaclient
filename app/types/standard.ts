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
                this.offlineData.addResource(r);
        }
    }

    onUpdate(r:T){
        this.offlineData.addResource(r);
    }


    remove(r1:T, child:boolean = false, syncronizing:boolean =false){
        var r = this.getItem("id", r1.id)
        if(r){
            this.resources.splice(this.resources.indexOf(r), 1)
            if(!child && !syncronizing)
                this.offlineData.addResource(r1)
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
        var errorItems = this.offlineData.deletedItems.filter(i => i.error_code > 0);
        return errorItems.length > 0;
    }

    getDeletedItemErrorInfo():any{
       var errorItems = this.offlineData.deletedItems.filter(i => i.error_code > 0);
       if(!errorItems.length){
           return null;
       }
       else{
           var errorInfo:any = {};
           errorInfo.message="One or more item deletion has some error"
           errorInfo.fieldErrors = errorItems.map(i => {
               "Id:"+i.id +"= Failure:"+BaseResource.errors_messages[i.error_code];
           })
           return errorInfo;
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
    error_messages:any;
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
        if(this.syncState == null)
            this.syncState = 0;
        if(!state.lock_version)
            state.lock_version = 0;
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

    getUnsavedChildItems(){
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


    getUnsavedChildItems(){
        var arr=[];
        arr.push(this._defaultUnit);
        return arr;
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
    resources: Array<BaseResource> = new Array<BaseResource>();
    deletedItems: Array<any> = new Array();
    lastSync:string="";

    constructor(public name:string){
    }

    addResource(res:BaseResource){
        if(res.isDeletePending()){
            if(!res.isNewPending())
                this.deletedItems.push({id: res.id});
            else
                this.resources.splice(this.resources.indexOf(res), 1);
        }
        else if((res.isNewPending() || res.isUpdatePending()) && this.resources.indexOf(res) == -1)
            this.resources.push(res);
    }

    removeResource(res:BaseResource){
        var item = this.deletedItems.find(i => i.id == res.id)
        var item_index;
        if(item)
            this.deletedItems.splice(this.deletedItems.indexOf(item), 1)
        else{
            item = this.resources.find((i, index) => {
                            item_index=index; 
                            return i.id == res.id;
                            })
            if(item){
               this.resources.splice(item_index, 1);
            }
        }
    }
    //Called after getting successful
    //sync response
    clearResources(lastSync:string){
        this.lastSync = lastSync;
        this.resources.forEach(i => {
            i.clearAllSyncState();
        })
        this.resources = new Array<BaseResource>();
        this.deletedItems = new Array<BaseResource>();
    }

    hasOfflineData():boolean{
        return (this.resources.length != 0 || this.deletedItems.length != 0)
    }

    asJSON(){
        return {resources: this.resources.map(r => r.getState())
                ,name: this.name
                ,deletedItems: this.deletedItems
                ,lastSync:this.lastSync}
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
        console.log("INFO: Next result " + JSON.stringify(res))
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
