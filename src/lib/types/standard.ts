import { Observable } from 'rxjs/Rx'
import { Observer } from 'rxjs/Observer';
import { DataService } from '../../providers/data-service';
import { ValueProvider } from '../math-node/value'
import { MathNode } from '../math-node/math-node'
import { LatexParserService } from '../../providers/latex-parser-service'

export class OfflineData {
    transactionId: string;
    clientId: string;
    user_id: number;
    //For server data
    resources: { [id: string]: BaseResource } = {};
    tables: TableOfflineData[] = new Array<TableOfflineData>();
    constructor() {
        this.transactionId = "";
        this.clientId = "";
    }

    asJson(tables: ResourceCollection<BaseResource>[], uiService: any) {
        var jsonData = { transactionId: this.transactionId, clientId: this.clientId, resources: {}, tables: [] }
        tables.forEach(t => jsonData.tables.push(t.offlineData.asJSON(jsonData.resources, uiService.authenticated)))
        return jsonData;
    }

    loadFromJson(jdata: any) {

    }
}

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
    static allOff: OfflineData = new OfflineData();
    static all: { [id: string]: BaseResource; } = {};
    constructor(public ds: DataService
        , public type: any) {

        this.resources = new Array<T>();
        this.state = States.CREATED;

        this.ole = new Observable(or => {
            this.or = or;
            if (this.State == States.LOAD_COMPLETE)
                or.next(this.resources);
            else
                Observable.from([this.ds.init(), this.ds.loadListAndDepenent(this)])
                    .map(i => i)
                    .concatAll()
                    .do(new LogHandler('Init DB'))
                    .subscribe(res => {
                    }, err => {
                        ErrorHandler.handle(err, "ResourceCollection::constructor->ole->ds.Init+this.ds.loadListAndDepenent", false);
                    }, () => {
                        or.next(this.resources);
                    })
        });

        this.offlineData = new TableOfflineData(type.table);
        ResourceCollection.allOff.tables.push(this.offlineData);

        this.eole = new Observable(eor => {
            this.eor = eor;
            eor.next(this.findErrorItems());
        });
    }

    findErrorItems() {
        var errorItems = this.offlineData.getAll().map(i => ResourceCollection.all[i]).filter(i => i.hasError());
        var childItems = this.resources.filter(i => i.getChildItems().some(j => j.hasError()));
        errorItems = errorItems.concat(childItems.filter(i => errorItems.indexOf(i) == -1))
        return errorItems;
    }

    initItems(info) {
        this.resources.forEach(r => { r.init(info) })
    }

    getItem(key: string, val: any): T {
        return this.resources.find(r => r[key] == val)
    }


    add(r: T, syncronizing: boolean = false) {
        if (r.id) {
            if (this.getItem("id", r.id))
                return;
            this.resources.push(r);
            ResourceCollection.all[r.id] = r;
            //Only add item for sync when user logged in
            if (!syncronizing && this.ds.uiService.authenticated)
                this.offlineData.addResource(r, "added");
        }
    }

    onUpdate(r: T) {
        if (!this.ds.uiService.authenticated)
            this.offlineData.addResource(r, "updated");
    }


    remove(r1: T, syncronizing: boolean = false) {
        var r = this.getItem("id", r1.id)
        if (r) {
            this.resources.splice(this.resources.indexOf(r), 1)
            r.deinit();
            delete ResourceCollection.all[r.id]

            if (!syncronizing && this.ds.uiService.authenticated)
                this.offlineData.addResource(r1, "deleted")
        }
    }


    set State(state) {
        this.state = state;
        console.log('Set state - ' + state)
    }

    get State() {
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

    get length(): number {
        return this.resources.length;
    }

    hasErrorInfo() {
        var errorItems = this.findErrorItems();
        return errorItems.length > 0;
    }


    publishErrors() {
        if (!this.eor)
            return;
        this.eor.next(this.findErrorItems());
    }



    addRows(rows) {
        let i;
        for (i = 0; i < rows.length; i++) {
            var obj = new this.type(rows.item(i))
            this.add(obj)
        }
    }

}

export class BaseResource {
    id: string;
    name: string;
    lock_version: number;
    error_messages: any;
    user_id: number;
    shared: boolean;

    //Internal
    deleted: string;
    oldState: any;
    favorite: Favorite = null;
    crs: CR = null;
    constructor(state = null) {
        this.loadState(state);
    }   
    
    static errors_messages: any = {
        0: "Success",
        1: "Validation error",
        2: "This item was not found in server",
        3: "Your change not syncronized since the new version was already in server.",
        100: "Unknown error"
    }

    static errors_codes: any = {
        success: 0,
        validation_error: 1,
        item_not_found: 2,
        stale_object: 3,
        unknown_error: 100
    }

    init(obj: any = null) {

    }

    deinit() {

    }
    loadState(state) {
        state = state || {};
        this.id = state.id || null;
        this.name = state.name || null;
        this.lock_version = state.lock_version || 0;
        this.user_id = state.user_id || -1;
        this.shared = state.shared || false;
        this.error_messages = JSON.parse(state.error_messages || "null");
    }


    getState():any{
        let state = {
            id: this.id,
            name: this.name,
            lock_version: this.lock_version,
            error_messages: JSON.stringify(this.error_messages),
            user_id: this.user_id,
            shared: this.shared
        };
        if(!this.isUserResource()){
            delete state.user_id;
            delete state.shared
        }
        let tn = this.getTable();
        if(tn == 'fgs' || tn == 'crs' || tn == 'favorites'){
            delete state.name;
        }
        if(tn == 'varvals'){
            delete state.error_messages;
        }
        return state;
    }


    isChanged() {
        if (!this.oldState)
            return true;
        var curState = this.getState();
        var keys = Object.keys(curState);
        var k = keys.find(k => curState[k] != this.oldState[k])
        if (k)
            return true;
        else
            return false;
    }

    getTable() {
        return "";
    }

    static initMeasure(info: any, property_id: string, unit_id: string): Measure {
        if (property_id) {
            var plist = info.plist.resources as Array<Property>;
            var p = plist.find(p => p.id == property_id)
            return new Measure(p);
        }
        if (unit_id) {
            var ulist = info.ulist.resources as Array<Unit>;
            var u = ulist.find(u => u.id == unit_id)
            return new Measure(u);
        }
        return new Measure(null);
    }

    destroy() {

    }

    getChildWithErrors(): Array<BaseResource> {
        return this.getChildItems().filter(i => i.hasError())
    }

    getChildItems(): Array<BaseResource> {
        return [];
    }

    enterEdit() {
        this.oldState = this.getState();
    }

    hasError(): boolean {
        return this.error_messages != null;
    }

    getErrorMessages() {
        if (this.hasError())
            return this.error_messages;
        else
            return null;
    }

    makeFavorite():Favorite{
        let f = new Favorite();
        f._favoritable = this;
        return f;
    }

    setCategory(c){
        let cr = new CR();
        cr._resource = this;
        cr._category = c;
        this.crs = cr;
        return cr;
    }

    get Favorite() {
        return this.favorite;
    }

    set Favorite(f: Favorite) {
        this.favorite = f;
    }

    isUserResource(){
        return true;
    }
}

export class Unit extends BaseResource {
    static table: string = 'units';

    system: string;
    symbol: string;
    description: string;
    approx: boolean;
    factor: string;
    property_id: string;


    //local members
    _property: Property;
    _latex: string;

    constructor(state: any = null) {
        super(state || {});
        if (!state) {
            this.setDefault();
        }
    }

    setDefault() {
        this.factor = "1";
        this.name = "New Unit"
        this.symbol = "ss"
        this.system = "SI"
        this.approx = false;
    }

    init(info) {
        if (info.property) {
            this._property = info.property;
            this._latex = this.parseLatex(this.symbol);
        }
    }



    getState() {
        return Object.assign(super.getState(), {
            system: this.system,
            symbol: this.symbol,
            description: this.description,
            approx: this.approx,
            factor: this.factor,
            property_id: this.Property.id
        });
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.system = state.system || "SI";
        this.symbol = state.symbol || null;
        this.description = state.description || null;
        this.approx = state.approx || false;
        this.factor = state.factor || null;
        this.property_id = state.property_id || null;
    }

    getTable(): string {
        return Unit.table;
    }

    get Latex(): string {
        return this._latex;
    }

    set Symbol(val: string) {
        this.symbol = val;
        this._latex = this.parseLatex(this.symbol);
    }

    get Symbol(): string {
        return this.symbol;
    }

    parseLatex(symbol): string {
        var s1 = ''
        var s = symbol
        if (s) {
            if (s.length == 1) {
                if (s == '_')
                    return this._latex = "\\text{" + this.name + "}";
                return this._latex = "\\text{" + s + "}";
            }
            //replace H2o as H_2o
            s1 = s.replace('H2O', 'H_2O');
            //replace ([a-zA-A])([1-9]) with g1^g2
            var p = /([A-Za-z])([1-9])/
            var s2 = '';
            while (s1 != s2) {
                s2 = s1;
                s1 = s1.replace(p, "$1^$2")
            }
            //replace ((a-zA-A )*) with \text{g1}
            var p2 = /([A-Za-z /]+)/
            s2 = ''
            var part1 = '';
            while (s1 != s2) {
                s2 = s1;
                s1 = s1.replace(p2, "\\text{$1}")
                if (s1 != s2) {
                    part1 += s1.slice(0, s1.lastIndexOf('}') + 1)
                    s1 = s1.slice(s1.lastIndexOf('}') + 1);
                }
                else {
                    part1 += s1;
                }
            }
            s1 = part1;
            return this._latex = s1;
        }
        return this._latex = s1
    }


    get IsDefaultUnit() {
        return this.Factor == 1;
    }

    get Property() {
        return this._property;
    }

    get Factor() {
        if (!this.factor || this.IsFormulaFactor)
            return null;
        else
            return parseFloat(this.factor);
    }

    get FormulaFactor() {
        if (this.IsFormulaFactor)
            return this.factor;
        else
            return null;
    }

    get IsFormulaFactor() {
        if (!this.factor)
            return false;
        return this.factor.indexOf('x') != -1;
    }


    newFormula(): Formula {
        var formula = new Formula()
        formula._measure = new Measure(this);
        return formula;
    }

    newGlobal(state): Global {
        var global = new Global(state)
        global.Measure = new Measure(this);
        return global;
    }
}

export class Property extends BaseResource {
    static table: string = 'properties';
   
   
    _defaultUnit: Unit;
    _units: Unit[] = new Array<Unit>();

    constructor(state: any = null) {
        super(state);
        if (!state)
            this.setDefault();
    }

    setDefault() {
        this.name = "New Property"
    }

    //called first time after loading
    init(info: any) {
        var ulist = info.ulist;
        ulist.resources.forEach(u => {
            if (u.property_id == this.id) {
                u.init({ property: this })
                let u1 = this._units.some(i => i.id == u.id);
                if (!u1)
                    this._units.push(u)
                if (u.Factor == 1)
                    this._defaultUnit = u
            }
        })
    }

    getTable() {
        return Property.table;
    }

    get DefaultUnit() {
        return this._defaultUnit;
    }


    updateChildIds() {
        this._units.forEach(u => u.property_id = this.id)
    }

    newUnit(isDefault: boolean = false): Unit {
        var unit = new Unit();
        unit.init({ property: this });
        this._units.push(unit);
        if (isDefault) {
            unit.factor = "1";
            this._defaultUnit = unit;
        }
        return unit;
    }

    get Units(): any {
        return this._units;
    }

    newFormula(): Formula {
        var formula = new Formula({ property_id: this.id })
        return formula;
    }


    getChildItems() {
        return this._units;
    }

    enterEdit() {
        super.enterEdit();
        this.DefaultUnit.enterEdit();
    }
}


export class Global extends BaseResource {
    unit_id: string;
    value: string;
    symbol: string;
    static table: string = "globals";

    //private
    _measure: Measure = new Measure(null);
 
    constructor(state: any = null) {
        super(state);
        if (!state)
            this.setDefault();
    }

    setDefault() {
        this.name = "New Global";
        this.unit_id = null;
        this.symbol = "";
    }

    init(info: any) {
        this._measure = BaseResource.initMeasure(info, null, this.unit_id)
    }

    getTable() {
        return Global.table;
    }

    getState() {
        return Object.assign(super.getState(), {
            unit_id: this._measure.UnitId,
            value: this.value,
            symbol: this.symbol,
        });
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.unit_id = state.unit_id || null;
        this.value = state.value || null;
        this.symbol = state.symbol || null;
    }

    get Measure() {
        return this._measure;
    }

    set Measure(measure) {
        this._measure = measure;
        this.unit_id = measure.UnitId;
    }
}

export class Measure {
    _name: string;
    _latex: string;
    constructor(public measure: Property | Unit) {
        if (measure) {
            this._name = measure.name;
            if (this.isUnit()) {
                this._latex = (measure as Unit).Latex;
            }
            else
                this._latex = "";
        }
        else {
            this._name = "None";
            this._latex = "";
        }
    }

    isMeasure(): boolean {
        return (this.isProperty() || this.isUnit())
    }

    isProperty(): boolean {
        if (this.measure)
            return !this.measure.hasOwnProperty("property_id");
        else
            return false;
    }

    isUnit(): boolean {
        if (this.measure)
            return this.measure.hasOwnProperty("property_id");
        else
            return false;
    }

    get UnitId() {
        if (this.measure) {
            if (this.isUnit())
                return this.measure.id;
            else
                return null;

        }
        return null;
    }

    get PropertyId() {
        if (this.measure) {
            if (this.isProperty())
                return this.measure.id;
            else
                return null;
        }
        return null;
    }

    get Name() {
        return this._name;
    }

    get Latex() {
        return this._latex;
    }
}

export class Formula extends BaseResource {
    symbol: string;
    latex: string;
    property_id: string;
    unit_id: string;
    static table: string = "formulas";

    //private
    _measure: Measure = new Measure(null);
    _variables: Array<Variable>;
    deletedVars: Array<Variable>;
    _globals: Array<FG>;
    deletedGlobals: Array<FG>;
    parsed:boolean = false;
    rootNode:MathNode = null;

    constructor(state: any = null) {
        super(state);
        this._variables = [];
        this._globals = [];
        this.deletedVars = [];
        this.deletedGlobals = [];
        if (!state)
            this.setDefault();
    }
    setDefault() {
        this.latex = "x+y";
        this.name = "New Formula"
        this.symbol = "f"
        this.property_id = null;
        this.unit_id = null;
        
    }

    init(info: any) {
        this._measure = BaseResource.initMeasure(info, this.property_id, this.unit_id);
        this._variables = info.vlist.resources.filter(i => i.formula_id == this.id)
        this._variables.forEach(i => {
            i.init({ formula: this, ulist: info.ulist, plist: info.plist });
        })
        this._globals = info.fglist.resources.filter(i => i.formula_id == this.id)
        this._globals.forEach(i => {
            i.init({ formula: this, global: info.glist.getItem("id", i.global_id) });
        })
    }

    getTable() {
        return Formula.table;
    }

    get Variables() {
        return this._variables;
    }

    get Globals() {
        return this._globals;
    }
    set Variables(val) {
        this._variables = val;
    }

    set Globals(val) {
        this._globals = val;
    }


    enterEdit() {
        super.enterEdit();
        this.Variables.forEach(v => v.enterEdit());
        this.Globals.forEach(g => g.enterEdit());
    }

    newVarval(){
        return Varval.forFormula(this);
    }

    getState() {

        return Object.assign(
            super.getState(), {
                symbol: this.symbol,
                latex: this.latex,
                property_id: this._measure.PropertyId,
                unit_id: this._measure.UnitId
            });
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.symbol = state.symbol || null;
        this.latex = state.latex  || null;
        this.property_id = state.property_id  || null;
        this.unit_id = state.unit_id  || null;
    }

    get Measure() {
        return this._measure;
    }

    set Measure(val) {
        this.property_id = val.PropertyId;
        this.unit_id = val.UnitId;
        this._measure = val;
    }

    parse(){

    }

    addSymbols(symbols:string[], globals:any){
        this.Variables.forEach(v => v.deleted = "true");
        this.Globals.forEach(g => g.deleted = "true");
        symbols.forEach(a => {
            let index, itemfg, itemv;
            itemv = this.Variables.find((item, i) => {
                index=i; 
                return (a == item.symbol)
            })
            if(itemv){
                itemv.deleted = null;
            }
            else if(itemfg = this._globals.find((g, i) => {
                index = i;
                return a == g.Global.symbol;
            })){
                itemfg.deleted = null;
            }
            else{
                var g = globals.getItem("symbol", a);
                if(g)
                    this.addFG(g);
                else
                    this.addVar(a)
            }
        });
    }

    addVarval():Varval{
        let vv = Varval.forFormula(this);
        if(!this.parsed)
            this.parse();
        return vv;
    }

    addFG(g:Global){
        let fg = new FG();
        fg._formula = this;
        fg._global = g;
        this._globals.push(fg);
        return fg;
    }

    addVar(symbol:string){
        let v = new Variable();
        v._formula = this;
        v.symbol = symbol;
        this._variables.push(v);
        return v;
    }

}

//Class represents number with unit
export class ValueU {
    input:string;
    val: number;
    measure: Measure;

    constructor( val:string){
        this.input = val;
        this.parse()
    }

    parse(){
        this.val = +this.input;
    }

    setValue(val:string){
        this.input = val;
        this.parse();
    }

    getValue(unit:Measure):number{
        return this.convert(unit);
    }

    //Convert the value in given symbol
    convert(unit:Measure):number{
        return this.val;
    }

    asString():string{
        return this.getValue(null).toString();
    }
}

export class Varval extends BaseResource implements ValueProvider{
    static table: string = "varvals";
    /*Formula id*/
    formula_id:string;
    /*String version of variable and value */
    /*"["var1", "5 in"],["var2","10 in"]" */
    variables:string;


    _formula: Formula;
    _values: {[key:string]: ValueU} = {};
    _nodes: {[key:string] : MathNode} = {};
    
    _result:ValueU;
    _rootNode:MathNode = null;
    static ps:LatexParserService = new LatexParserService();
    static magicStingDB = [[/\\/g, "@G#"], [/\"/g, "#G@"]];
    static magicStingMEM = [[/@G#/g, "\\"], [/#G@/g, "\""]];
    constructor(state:any = null){
        super(state);
        if(!state)
            this.setDefault();
        if(!this._result)
            this._result = new ValueU("");
    }

    setDefault(){

    }

    static forFormula(formula:Formula):Varval{
        let val = new Varval();
        val.Formula = formula;
        val.Formula.Variables.forEach(v=> {
            let sym = v.symbol;
            val._values[sym] = new ValueU("");
        })
        return val;
    }

    set Formula(f:Formula){
        this.formula_id = f.id;
        this._formula = f;
    }
    get Formula():Formula{
        return this._formula;
    }

    init(info){
        if(this._formula)
            return;
        let toks_vals =  JSON.parse(this.variables);
        this._formula = ResourceCollection.all[this.formula_id] as Formula;
        if(this._formula){
            this._formula.Variables.forEach((v, i)=> {
                this._values[v.symbol] = new ValueU(toks_vals[i])
            })
        }
    }

    getState() {
        this.variables = JSON.stringify(this._formula.Variables.map(v => this._values[v.symbol].input));
        return Object.assign(
            super.getState(), {
                formula_id: this._formula.id,
                variables: this.replaceSpecialChar('DB',this.variables),
                result:this._result.asString()
            });
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.formula_id = state.formula_id || null;
        this.variables = this.replaceSpecialChar('MEM', state.variables);
        this._result = new ValueU(state.result);
    }

    evaluate(){
        //If all variable has value
        let varsWithNoValue = this._formula._variables.filter(v => this._values[v.symbol].input.length == 0)
        if(varsWithNoValue.length > 0)
            return null;
        
        this._formula._variables.forEach(v => this._values[v.symbol].parse())
        
        //Set the nodes of each variable this as value provider
        try{
            if(!this._rootNode){
                this._rootNode = Varval.ps.parse(this._formula.latex); 
            }
            Varval.ps.setValueProviderForVarNodes(this._rootNode, this);
            this._rootNode.type() as number;
            this._result.setValue(this._rootNode.val.toString());
            //to update variable
            this.getState();
        }
        catch(exp){
            throw exp;
        }

    }

    getValue(token:string):number{
        let val = 1;

        let v = this._formula._variables.find(v => v.symbol == token);
        if(v){
            return this._values[token].getValue(v._measure)

        }
        else{
            let g = this._formula._globals.find(g => g._global.symbol == token)
            if(g)
                return +g._global.value;
        }
        return val;
    }

    setValue(v:string, value:string){
        this.evaluate();
    }

    getTable(){
        return Varval.table;
    }

    isUserResource():boolean{
        return false;
    }

    replaceSpecialChar(to:string, val:string):string{
        let items = (to == 'DB')?Varval.magicStingDB:Varval.magicStingMEM;
        items.forEach(i => {
            if(val && val.length > 0)
                val = val.replace(i[0] as RegExp,i[1] as string);    
        })
        return val;
    }
}

export class Variable extends BaseResource {
    unit_id: string;
    property_id: string;
    formula_id: string;
    symbol: string;
    static table: string = "variables";

    //private
    _formula: Formula;
    _measure: Measure = new Measure(null);

    constructor(state: any = null) {
        super(state);
        if (!state)
            this.setDefault()
    }

    setDefault() {
        this.property_id = null;
        this.unit_id = null;
    }

    init(info) {
        if (info.formula) {
            this._formula = info.formula;
            this._measure = BaseResource.initMeasure(info, this.property_id, this.unit_id);
        }
    }

    getTable() {
        return Variable.table;
    }

    getState() {
        let state = Object.assign(super.getState(), {
            formula_id: this._formula.id,
            symbol: this.symbol,
            property_id: this._measure.PropertyId,
            unit_id: this._measure.UnitId
        });

        return state;
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.unit_id = state.unit_id || null;
        this.formula_id = state.formula_id || null;
        this.property_id = state.property_id || null;
        this.symbol = state.symbol || null;
    }

    get Formula() {
        return this._formula;
    }

    set Formula(val) {
        this._formula = val;
    }

    get Measure() {
        return this._measure;
    }

    set Measure(val) {
        this._measure = val;
        this.property_id = val.PropertyId;
        this.unit_id = val.UnitId;

    }

    isUserResource():boolean{
        return false;
    }

    isChildResource():boolean{
        return true;
    }
}

export class FG extends BaseResource {
    formula_id: string;
    global_id: string;
    static table: string = "fgs"

    _formula: Formula;
    _global: Global;
    constructor(state: any = null) {
        super(state)
        if (!state)
            this.setDefault();
    }


    setDefault() {
        this.formula_id = null;
        this.global_id = null;
    }

    init(info) {
        if (info.formula) {
            this._formula = info.formula;
            this._global = info.global;
        }
    }

    getTable() {
        return FG.table;
    }


    getState() {
        this.formula_id = this._formula.id
        this.global_id = this._global.id
        var state = Object.assign(super.getState(),
            {
                formula_id: this.formula_id,
                global_id: this.global_id
            });
        return state;
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.formula_id = state.formula_id || null;
        this.global_id = state.global_id || null;
    }

    get Formula() {
        return this._formula;
    }

    set Formula(f) {
        this._formula = f;
    }


    get Global() {
        return this._global;
    }

    set Global(g) {
        this._global = g;
    }

    isUserResource():boolean{
        return false;
    }
}


export class Favorite extends BaseResource {
    static table: string = "favorites";

    favoritable_id: string;
    favoritable_type:string;

    _favoritable:BaseResource;

    constructor(state: any = null) {
        super(state);
        if(!state){
            this.setDefault()
        }
    }

    setDefault(){

    }

    init() {
        if(this._favoritable)
            return;
        let r = ResourceCollection.all[this.favoritable_id];
        if(r){ 
            r.Favorite = this;
            this._favoritable = r;
        }
    }
    

    deinit() {
        if(this._favoritable)
            this._favoritable.Favorite = null;
    }

    getTable(): string {
        return Favorite.table;
    }

    getState() {
        return Object.assign(super.getState(), {
            favoritable_id: this._favoritable.id,
            favoritable_type: this._favoritable.getTable()
        })
    }

    loadState(state) {
        state = state || {}
        super.loadState(state);
        this.favoritable_id = state.favoritable_id || null;
        this.favoritable_type = state.favoritable_type || null;
    }
}

export class Category extends BaseResource {
    parent_id: number;
    isRoot: boolean;
    _parent: Category;
    children: Category[];

    
    _level:number = null;
    _code:number = null;
    _index:number = 0;

    static _root:Category = Category.root();
    static table: string = "categories";
    static initComplete:boolean = false;

    constructor(state: any = null) {
        super(state);
        if(!state){
            this.setDefault()
        }
        this.children = [];
    }

    setDefault(){

    }

    static root():Category{
        let c = new Category();
        c.name = "Root"
        c.isRoot = true;
        return c;
    }

    init(info) {
        if(Category.initComplete)
            return;
        this.initChildren(Category._root, info.clist, 0);
    }

    initChildren(parent, clist, level){
        parent.children = clist.filter(i => i.parent_id == parent.id);
        parent._lastChildIndex = parent.children.length;
        parent.children.forEach((i, k) => {
            i._parent=parent;
            i.setCode(k);
            i._level = level;
            i._index = k;
            this.initChildren(i, clist, level+1)
        });
        
        Category.initComplete = true;
    }

    getTable(): string {
        return Category.table;
    }

    addCategory(name:string):Category{
        let c = new Category();
        c.name = name;
        c._parent = this;
        c._level = this._level+1;
        let k = this.children.length;
        c.setCode(k);
        this.children.push(c);
        return c;
    }

    setCode(index){
        this._code = this._parent._code | (index+1) << 8*(3-this._level);
    }
    getState() {
        return Object.assign(super.getState(),
            {
                parent_id: this._parent ? this._parent.id : null,
            });
    }

    loadState(state) {
        state = state || {};
        super.loadState(state);
        this.parent_id = state.parent_id || null;
    }

    onListLoadComplete() {

    }

    isUserResource(){
        return false;
    }

    isSubCategory(c):boolean{
        return ((c._code & this._code) == this._code)
    }

    getPrefix():number{
        return this._level*25+10;
    }
}

export class CR extends BaseResource {
    category_id: string;
    categorizable_id: string;
    categorizable_type: string;
    static table: string = "crs"

    _category: Category;
    _resource: BaseResource;
    constructor(state: any = null) {
        super(state)
        if(!state){
            this.setDefault()
        }
    }

    setDefault(){
        this.category_id = null;
        this.categorizable_id = null;
    }
    
    init() {
        if(this._resource)
            return;
        this._resource = ResourceCollection.all[this.categorizable_id];
        if(this._resource){
            this._category = ResourceCollection.all[this.category_id] as Category;
            this._resource.crs = this;
            this.categorizable_type = this._resource.getTable();
        }
    }

    deinit(){
        if(this._resource)
            this._resource.crs = null;
    }

    getTable() {
        return CR.table;
    }


    getState() {
        var state = Object.assign(super.getState(),
            {
                categorizable_id: this._resource.id,
                categorizable_type: this._resource.getTable(),
                category_id: this._category.id,
            });
        return state;
    }

    loadState(state) {
        state = state || {}
        super.loadState(state);
        this.category_id = state.category_id;
        this.categorizable_id = state.categorizable_id;
        this.categorizable_type = state.categorizable_type;
    }

    get Category() {
        return this._category;
    }

    set Category(c) {
        this._category = c;
    }


    get Resource() {
        return this._resource;
    }

    set Resource(r) {
        this._resource = r;
    }


    isUserResource():boolean{
        return false;
    }
}

export class TableOfflineData {
    added: Array<string> = new Array<string>();
    updated: Array<string> = new Array<string>();
    deleted: Array<string> = new Array<string>();
    lastSync: string = "";
    lastSyncShared: string = "";

    constructor(public name: string) {
    }


    addResource(res: BaseResource, op: string) {
        if (op == 'added') {
            this.added.push(res.id);
        } else if (op == 'updated') {
            if (this.added.indexOf(res.id) >= 0)
                return;
            this.updated.push(res.id);
        } else {
            let i = this.added.indexOf(res.id);
            if (i >= 0)
                this.added.splice(i, 1);
            else {
                i = this.updated.indexOf(res.id);
                this.updated.splice(i, 1);
            }
            this.deleted.push(res.id);
        }
    }

    getAll(): Array<string> {
        return this.added.concat(this.updated);
    }

    remove(item) {
        let list = [this.added, this.deleted, this.updated].find(a => a.indexOf(item) > -1)
        if (list) {
            let index = list.indexOf(item)
            list.splice(index, 1)
        }
    }

    hasOfflineData(): boolean {
        return (this.added.length != 0 || this.updated.length != 0 || this.deleted.length != 0)
    }

    loadFromCache(li: ResourceCollection<BaseResource>, jdata: string) {
        if (jdata) {
            let jobj = JSON.parse(jdata);
            this.added = jobj.added;
            this.updated = jobj.updated;
            this.deleted = jobj.deleted;
            this.lastSync = jobj.lastSync;
        }
    }

    asJSONForCache(): any {
        return this;
    }

    asJSON(resources, authenticated: boolean = false): any {
        this.added.concat(this.updated).forEach(id => {
            let state = ResourceCollection.all[id].getState();
            delete state.id;
            delete state.error_messages;
            resources[id] = state;
        })
        if (authenticated) {
            let tinfo = {
                name: this.name
                , lastSync: this.lastSync
                , lastSyncShared: this.lastSyncShared
                , added: this.added
                , updated: this.updated
                , deleted: this.deleted
            };

            return tinfo;

        }
        else
            return { name: this.name, lastSync: this.lastSync };
    }
}


export class SyncResponseHandler {
    constructor(public offlineData: OfflineData, public ds: DataService, public cs: CacheService) {

    }
    sync(): Observable<any> {
        return this.syncMem()
    }

    public syncMem() {
        //Delete exting added items because we will add items
        //from newly created in server
        let oles = [] as Array<Observable<any>>;
        let resources = this.offlineData.resources;

        let user_id = this.offlineData.user_id;
        this.ds.uiService.userId = user_id;
        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            li.offlineData.deleted = [];
            let table = this.ds.getTable(li);
            i.deleted.forEach(j => {
                let lr = ResourceCollection.all[j];
                li.remove(ResourceCollection.all[j], true)
                if (!this.ds.isResourceShared(lr))
                    oles.push(this.cs.deleteItem(table, j));
            })
        })
        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            let table = this.ds.getTable(li);
            i.added.forEach(j => {
                let r = new li.type(resources[j]) as BaseResource;
                let lr = li.getItem("id", j)
                if (lr) {
                    let oldId = j;
                    if (!r.hasError()) {
                        lr.id = r.id;
                        lr.error_messages = {}
                        oles.push(this.cs.updateIds(table, "id", j, { id: lr.id, error_messages: null }))
                        let dts = this.ds.getReferingList(li);
                        let refId_col = this.ds.getRefIdColumn(li);
                        dts.map(t => this.ds.getTable(t)).forEach(t => {
                            let obj = {}
                            obj[refId_col] = r.id;
                            oles.push(this.cs.updateIds(t, refId_col, oldId, obj));
                        })
                        ResourceCollection.all[lr.id] = lr;
                        li.offlineData.remove(j);
                    }
                    else {

                        lr.error_messages = r.error_messages;
                        oles.push(this.cs.updateItem(lr));
                    }

                }
                else {
                    r.id = j;
                    if (!this.ds.isResourceShared(r))
                        oles.push(this.cs.addItem(r));
                    li.add(r, true);
                }
            })
        })

        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            i.updated.forEach(j => {
                let r = new li.type(resources[j]) as BaseResource;
                let lr = li.getItem("id", j) as BaseResource;
                if (r.hasError()) {
                    lr.error_messages = r.error_messages;
                    oles.push(this.cs.updateItem(lr))
                }
                else {
                    let index = li.offlineData.updated.indexOf(j);
                    if (index >= 0) {
                        lr.error_messages = {}
                        lr.lock_version = r.lock_version;
                        if (!this.ds.isResourceShared(lr))
                            oles.push(this.cs.updateItem(lr))
                        li.offlineData.remove(j);
                    }
                    else {
                        r.id = j;
                        lr.loadState(r.getState());
                        if (!this.ds.isResourceShared(lr))
                            oles.push(this.cs.updateItem(lr))
                    }
                }
            })
        })
        this.offlineData.tables.forEach(i => {
            let li = this.ds[i.name] as ResourceCollection<BaseResource>;
            li.offlineData.lastSync = i.lastSync;
            li.offlineData.lastSyncShared = i.lastSyncShared;
            oles.push(this.ds.saveOfflineData(li));
        })
        this.offlineData.tables.forEach(t => {
            let li = this.ds[t.name] as ResourceCollection<BaseResource>;
            let all = t.updated.concat(t.added);
            let param = this.ds.getInitParameters(li);
            all.forEach(i => {
                ResourceCollection.all[i].init(param);
            })
        })

        return Observable.from(oles).map(i => i).concatAll();
    }
}

export class LogHandler {
    processId: number = 0;
    constructor(public process: string = "") {

    }
    //Log the stream events
    next(res) {
        this.handleSqlResult(res);
    }

    error(err) {
        this.handleSqlError(err);
    }

    complete() {
        console.log('The process completed - ' + this.process + ' - ' + this.processId++)
    }

    handleSqlResult(res) {
        if (!res || !res.res) {
            console.log("INFO: Next result " + JSON.stringify(res, null, 2))
            return;
        }
        res = res.res;
        if (res.stmt)
            console.log(res.stmt);
        if (res.rowsAffected)
            console.log("No of rows affected - " + res.rowsAffected);
    }

    handleSqlError(err) {
        if (!err || !err.err) {
            console.log('ERROR: ' + JSON.stringify(err));
            return;
        }
        err = err.err;
        if (err.stmt)
            console.log(err.stmt)
        if (err.code)
            console.log('Error code - ' + err.code)
        if (err.message)
            console.log('Error message - ' + err.message)
    }


}

export class AsyncSync {
    constructor(public async: (li: any, i: number) => Observable<any>, public sync: (res: any, i: number) => any) {
    }
}
export class States {
    static CREATED: number = 0
    static LOAD_STARTED: number = 1;
    static LOAD_COMPLETE: number = 2;
    static INIT_STARTED: number = 3;
    static INIT_COMPLETE: number = 4;
    static FETCH_STARTED: number = 5;
    static FETCH_COMPLETE: number = 6;
    static SYNC_STARTED: number = 7;
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

export function pass(or) {
    return {
        next: res => or.next(res),
        err: err => or.error(err),
        complete: () => or.complete()
    }
}

export class User {
    uid: string;
    id: number;
    name: string;
}

export interface CacheService {
    deleteItem(table: string, id: string): Observable<any>;
    addItem(item: BaseResource): Observable<any>;
    updateItem(item: BaseResource): Observable<any>;
    updateIds(list: string, idField: string, oldId: string, newId: any): Observable<any>;
    selectAll(table: string): Observable<any>;
    selectAllByUserIds(table: string, ids: Array<number>): Observable<any>;
    setKV(key: string, value: string): Observable<any>;
    getKV(key: string): Observable<any>;
}

export class ErrorHandler {

    constructor() {

    }

    static handle(stack: any, msg: string, last: boolean = false) {
        if (last) {
            console.log('Error:' + msg);
            console.log(JSON.stringify(stack));
        }
        else {
            if (stack.stack)
                stack.stack.push(msg);
            else
                stack.stack = new Array<string>();
            stack.stack.push(msg);
        }
    }
}