import {App, Platform, Storage, SqlStorage} from 'ionic-angular';
import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { RemoteService } from './remote-service';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import {ResourceCollection, Unit, Property/*, Category, Formula*/} from '../types/standard';

@Injectable()
export class SqlService {
	createTableStmts: string[] = [
		'CREATE TABLE IF NOT EXISTS "properties" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "dims" varchar, "user_id" integer, "shared" boolean, "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "units" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "property_id" integer, "name" varchar, "system" varchar,  "symbol" varchar,  "description" varchar, "approx" boolean, "factor" varchar,  "user_id" integer, "shared" boolean, "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "formulas" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "latex" varchar, "name" varchar, "symbol" varchar, "unit_id" integer, "property_id" integer, "user_id" integer, "shared" boolean,  "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "favorites" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "user_id" integer, "favoritable_id" integer, "favoritable_type" varchar, "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "globals" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "symbol" varchar, "name" varchar, "unit_id" integer, "value" varchar, "user_id" integer, "shared" boolean,  "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "fgs" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "formula_id" integer, "global_id" integer, "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "variables" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "symbol" varchar, "name" varchar, "unit_id" integer, "formula_id" integer, "property_id" integer, "lock_version" integer);',
		'CREATE TABLE IF NOT EXISTS "categories" ("id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar, "parent_id" integer, "lock_version" integer);',
	]
	storage: Storage;
	tables: string[] = ["properties", "units", "formulas", "favorites", "globals", "fgs", "variables", "categories"]
	initComplete: boolean = false;
	constructor(private platform: Platform) {
	}

	init(drop:number): Observable<any> {
		
		if (this.initComplete)
			return Observable.empty();
		
		if(localStorage.getItem("dbInit") == "1")
			return this.initSql();
		

		if(drop)
			return Observable.from([this.initSql(), this.dropTables(), this.createTables(), this.saveInitState()])
							 .map(i => i)
							 .concatAll()
		else
			return Observable.from([this.initSql(), this.createTables(), this.saveInitState()])
								 .map(i => i)
								 .concatAll();
	}

	initSql(){
		return Observable.create(or => {
			Observable.fromPromise(this.platform.ready())
					  .subscribe(res=>res, err=>err, ()=>{
							this.storage = new Storage(SqlStorage);
							or.complete();
						})
					})
	}

	saveInitState(){
		return Observable.create(or => {
			localStorage.setItem("dbInit", "1");
			or.complete();
		})

	}

	dropTables():Observable<any>{
		return Observable.from(this.tables)
						 .map(t => {
						 	return this.initQuery('DROP TABLE ' + t)
						 })
						 .concat([this.initQuery('DELETE FROM kv')])
						 .concatAll()
				
	}
	
	


	createTables():Observable<any> {
	//	this.storage = new Storage(SqlStorage);
		return Observable.from(this.createTableStmts)
						 .flatMap((t, i) => { 
							return [
								  this.initQuery(t)
								 , this.initQuery(this.getAlterStatement(this.tables[i]))
							]
						})
						.concatAll()
	}
	
	
	//ALTER TABLE OLD_COMPANY ADD COLUMN SEX char(1);
	getAlterStatement(table){
		var astmt = `ALTER TABLE ${table} ADD COLUMN  \"syncState\" integer`;
		return astmt;
	}

	/*Not used*/
	initSequeceId(){
		var obj = { seq: 10E6 };
		this.query("update", "sqlite_sequence", obj, { and: { seq: { cond: "<=", val: 1 } } }).subscribe(
			res => { }
			)
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
					if(condition.and[k].value)
						andCond +=  JSON.stringify(condition.and[k].value) + ' AND '
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
		//replace "\"" with ""
		query = query.replace("\\\"", "\"\"");
		while(query.indexOf("\\\\") != -1)
			query = query.replace("\\\\", "\\");
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
				return JSON.stringify(val);
			}
		}
	}
/*
	then((data) => {
    var results;
    if(type == 'select' && data.res.rows.length > 0) {
		results = [];
    	for(var i = 0; i < data.res.rows.length; i++) {
    		results.push(data.res.rows.item(i))	
    	}
		
   	}
	else if (type == 'insert' && data.res.insertId){
		results = data.res.insertId;
	}
	else if (type == 'update'){
		results = 'success';
	}
	if(observer){
		observer.next(results);
		observer.complete();
	}
	}, (error) => {
	observer.error(error);
	            });
*/

	query(type, table, obj, cond:any=null, async=true) {
		return this._query(type, table, obj, cond);
	}
/*
	INSERT INTO units (id,property_id,name,system,baseunit,symbol,prefix,extend,definition,description,approx,factor,repeat) 
	VALUES 
	(187,4,"arcsecond","_",0,"\"",null,null,"1°/3600","",1,"4.848137×10−6",null)
	INSERT INTO units (id,property_id,name,system,baseunit,symbol,prefix,extend,definition,description,approx,factor,repeat) 
	VALUES 
	(189,4,"centesimal second of arc","_",0,"\"",null,null,"1 grad/10000","",1,"1.570796×10−6",null)
*/
	_query(type, table, obj, cond) {
		var queryStr = this.prepareQuery(type, table, obj, cond);
		return this.query1(queryStr);//Observable.create(or => {this.query1(queryStr, or)})
	}

	initQuery(stmt):Observable<any>{
			return Observable.create(or => {
				this.storage.query(stmt).then((res) => {
					if(or){
						//Send the statement string with result
						if(res.res)
							res.res.stmt = stmt;
						or.next(res);
						or.complete();
					}
				},(err) => {
					//Send the stmt string with error
					if(err.err)
						console.log(err.err)
					or.complete();

				})
			})
		}

	query1(stmt):Observable<any>{
		return Observable.create(or => {
			this.storage.query(stmt).then((res) => {
				if(or){
					//Send the statement string with result
					//console.log('TEMMMMMM----------'+stmt)
					if(res.res)
						res.res.stmt = stmt;
					or.next(res);
					or.complete();
				}
			},(err) => {
				//Send the stmt string with error
				if(err.err)
					err.err.stmt = stmt;
				or.error(err)
			})
		})
	}
	getKV(key:string):any{
		return Observable.fromPromise(this.storage.get(key));
	}

	setKV(key:string, obj:any){
		return Observable.fromPromise(this.storage.set(key, obj));
	}
}