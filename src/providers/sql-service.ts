import { Platform } from 'ionic-angular';
import { Sql } from './sql';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Rx';
import { ErrorHandler } from '../lib/types/standard';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';

@Injectable()
export class SqlService {
	createTableStmts: string[] = [
		'CREATE TABLE IF NOT EXISTS "properties" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar, "dims" varchar, "user_id" integer, "shared" boolean, "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "units" ("id" varchar PRIMARY KEY NOT NULL, "property_id" varchar, "name" varchar, "system" varchar,  "symbol" varchar,  "description" varchar, "approx" boolean, "factor" varchar,  "user_id" integer, "shared" boolean, "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "formulas" ("id" varchar PRIMARY KEY NOT NULL, "latex" varchar, "name" varchar, "symbol" varchar, "unit_id" integer, "property_id" varchar, "user_id" integer, "shared" boolean,  "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "favorites" ("id" varchar PRIMARY KEY NOT NULL,  "user_id" integer, "favoritable_id" varchar, "favoritable_type" varchar, "lock_version" integer, "error_messages" varchar, "shared" boolean);',
		'CREATE TABLE IF NOT EXISTS "globals" ("id" varchar PRIMARY KEY NOT NULL, "symbol" varchar, "name" varchar, "unit_id" varchar, "value" varchar, "user_id" integer, "shared" boolean,  "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "fgs" ("id" varchar PRIMARY KEY NOT NULL, "formula_id" varchar, "global_id" varchar, "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "variables" ("id" varchar PRIMARY KEY NOT NULL, "symbol" varchar, "name" varchar, "unit_id" varchar, "formula_id" varchar, "property_id" varchar, "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "categories" ("id" varchar PRIMARY KEY NOT NULL, "name" varchar,  "parent_id" varchar, "lock_version" integer, "error_messages" varchar);',
		'CREATE TABLE IF NOT EXISTS "crs" ("id" varchar PRIMARY KEY NOT NULL, "category_id" varchar, "categorizable_id" varchar, "categorizable_type" varchar, "lock_version" integer, "error_messages" varchar);',
		//stores the formula variables values in comma seperated string.
		'CREATE TABLE IF NOT EXISTS "varvals" ("id" varchar PRIMARY KEY NOT NULL,"name" varchar, "formula_id" varchar, "variables" varchar, "result" varchar, "lock_version" integer);',
	]
	tables: string[] = ["properties", "units", "formulas", "favorites", "globals", "fgs", "variables", "categories", "crs", "varvals"]
	initComplete: boolean = false;
	constructor(public platform: Platform, public storage:Sql) {
	}

	init(): Observable<any> {
		
		if (this.initComplete)
			return Observable.empty();
		
		if(localStorage.getItem("dbInit") == null || localStorage.getItem("dbInit") == "0")
			return Observable.from([this.initSql(), this.dropTables(), this.createTables()])
							 .concatAll()
							 .map((r,i) => i==3?this.saveInitState():i)

		return this.initSql();
	}

	initSql():Observable<any>{
		return Observable.empty();
		// return Observable.fromPromise(this.platform.ready() as Promise<any>)
		// 					 .map(i => {this.storage = new Storage(SqlStorage);return Observable.empty()})
	}

	saveInitState(){
		localStorage.setItem("dbInit", "1");
	}

	dropTables():Observable<any>{
		return Observable.from(this.tables)
						 .map(t => this._query('DROP TABLE ' + t))
						 .concat([this._query('DELETE FROM kv')])
						 .concatAll()
						 .catch(err => {console.log('Drop failed' + err); return Observable.empty()})
	}

	createTables():Observable<any> {
		return Observable.from(this.createTableStmts)
						 .map(t => this._query(t))
						 .concatAll()
	}
	
	

	prepareQuery(type:string, table:string, obj, condition){
		var andCond = ""
		var orCond = ""
		var query = ""
		var where = "";
		if(condition){
			var keys1;
			if(condition.and){
				keys1 = Object.keys(condition.and);
				keys1.map(k => {
					andCond += k + ' '+ condition.and[k].cond +' ';
					var condVal = condition.and[k].value; 
					if(condVal){
						if (Object.prototype.toString.call(condVal) == '[object Array]')
							andCond += JSON.stringify(condVal).replace('[','(').replace(']', ')') + ' AND '
						else 
							andCond +=  JSON.stringify(condVal) + ' AND '
					}
					else if(condition.and[k].query){
						andCond += condition.and[k].query + ' AND '
					}
				})
			}
			if(condition.or){
				keys1 = Object.keys(condition.or);
				keys1.map(k => orCond += k +' '+ condition.or[k].cond +' '+ JSON.stringify(condition.or[k].value) + ' OR ')
			}
			if (andCond.length)
				andCond = andCond.slice(0, -4);
			if (orCond.length)
				orCond = orCond.slice(0, -3)
			where = " WHERE ";

		}

		if(type == 'insert'){
			var keys = Object.keys(obj);
			var columns = "";
			keys.map(c => columns += c + ',');
			if(columns.length)
				columns = columns.slice(0, -1)
			var values = JSON.stringify(this.SQLStringify(keys.map(k => obj[k]))).slice(1).slice(0, -1);
			query = `INSERT INTO ${table} (${columns}) VALUES (${values})`
		}

		if(type == 'insertorupdate'){
			var keys = Object.keys(obj);
			var columns = "";
			keys.map(c => columns += c + ',');
			if(columns.length)
				columns = columns.slice(0, -1)
			var values = JSON.stringify(this.SQLStringify(keys.map(k => obj[k]))).slice(1).slice(0, -1);
			query = `INSERT OR REPLACE INTO ${table} (${columns}) VALUES (${values})`
		}

		if(type == 'update'){
			var keys = Object.keys(obj);
			var combined = "";
			keys.map(k => combined += k + ' = ' +this.SQLStringify(obj[k])+',')
			if(combined.length)
				combined = combined.slice(0, -1)
			if(condition)
				query = `UPDATE ${table} SET ${combined} WHERE ${andCond} ${orCond}`;
			else
				query = `UPDATE ${table} SET ${combined}`;

		}

		if(type == 'select'){
			var combined = "";
			query = `SELECT * FROM ${table} ${where} ${andCond} ${orCond}`;
		}

		if(type == 'delete'){
			query = `DELETE FROM ${table} WHERE ${andCond} ${orCond}`;
		}
		//reverse "\\\\" with "\\" done by JSON.stringify. 
		//because escaping done in JSON.stringify is NOT
		//required. we are not parsing againg after fetch from db.
		// query = query.replace("\\\\", "\\");
		// while(query.indexOf("\\\\") != -1)
		// 	query = query.replace("\\\\", "\\");
		//replace "\"" with ""
		//because escaping done in JSON.stringify is NOT
		//compatible with SQL statement
		// query = query.replace("\\\"", "\"\"");
		// while(query.indexOf("\\\"") != -1)
		// 	query = query.replace("\\\"", "\"\"");
		query = query.replace(/\\\\/g, "\\");
		query = query.replace(/\\\"/g, "\"\"");
		

		return query;
	}

	SQLStringify(val){
		//convert true or false to 1 and 0
		if (Object.prototype.toString.call(val) == '[object Array]'){
			return val.map((v, i) => { 
					if (v === true || v === false) 
						return v ? 1 : 0; 
					else return v; 
				})
		}
		else
		{
			if(val === false){
				return "0"
			}
			else if(val === true){
				return "1"
			}
			else{
				let val1 = JSON.stringify(val);
				if(typeof val == "string"){
					let val1Old = val1;
					let bString = false;
					val1 = val1.replace(/\"$/g, "")
					if(val1Old != val1)
						bString = true;
					val1 = val1.replace(/\\\"/g, "\"\"");
					val1 = val1.replace(/\\\\/g, "\\");
					if(bString)
						val1 += "\"";		
				}
				return val1;

			}
		}
	}

	query(params) {
		var queryStr = this.prepareQuery(params.type, params.table, params.obj, params.cond);
		return this._query(queryStr);//Observable.create(or => {this.query1(queryStr, or)})
	}

	_query(stmt):Observable<any>{
		return Observable.create(or => {
			this.storage.query(stmt).then((res) => {
				if(or){
					//Send the statement string with result
					res.res.length = 0;
					if(res.res)
						res.res.stmt = stmt;
					or.next(res.res);
					or.complete();
				}
			},(err) => {
				//Send the stmt string with error
				console.log(stmt);			
				console.log(JSON.stringify(err));
				ErrorHandler.handle(err, "SqlService::query " + stmt, false);
				if(err.err)
					err.err.stmt = stmt;
				or.error(err)
			})
		})
	}

	getKV(key:string):any {
		return Observable.create(or => {
			this.storage.get(key).then((res) => {
				or.next(res)
					or.complete();
				},
				err =>{
					ErrorHandler.handle(err, "SqlService::getKV " + key, false);
					or.error(err)
				})
		})
	}

	setKV(key:string, obj:any):Observable<any>{
		return Observable.create(or => {
				this.storage.set(key, obj).then(res => {
					or.next(res)
					or.complete();
				},
				err =>{
					ErrorHandler.handle(err, "SqlService::setKV " + key, false);
					or.error(err)
				})
		})
	}
}