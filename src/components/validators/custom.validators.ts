import { DataService } from '../../providers/data-service';
import { Measure, Formula, Unit,  BaseResource } from '../../lib/types/standard';
import { ErrorHandler } from '../../lib/types/standard';

/*
source:https://raw.githubusercontent.com/restlet/restlet-sample-angular2-forms/master/app/validators/custom.validators.ts

*/

class ResourceValidator{

  constructor(public service:DataService, public component:any){

  }

  public validateName(control) {
    let resource = this.component.resource;
    if(resource.nameTimeout)
      clearTimeout(resource.nameTimeout);
    return new Promise((resolve, reject) => {
                resource.nameTimeout = setTimeout(() => {
                    let val = control.value as string;
                    this.service.isUnique(resource.getTable(), val, resource.id, (res, i)=> val == res.name)
                          .subscribe(res => {
                            if(res.unique){
                                resolve(null);
                            }
                            else{
                              resolve({uniqueness: true});
                            }
                          }, err=>{
                              ErrorHandler.handle(err, "createUniqueNameValidator", true);

                              resolve({uniqueness: true});
                          }, () => resolve({uniqueness: true}))
            }, 600);

    });
  }

  validateSymbol(control) {
      let resource = this.component.resource;
      if(resource.symbolTimeout)
        clearTimeout(resource.symbolTimeout);
      return new Promise((resolve, reject) => {
                  resource.symbolTimeout = setTimeout(() => {
                      this.service.isUnique(resource.getTable(), control.value as string, resource.id, (res , i)=> control.value == (res as Unit).symbol)
                            .subscribe(res => {
                              if(res.unique){
                                  resolve(null);
                              }
                              else{
                                resolve({uniqueness: true});
                              }
                            }, err=>{
                                ErrorHandler.handle(err, "createUniqueNameValidator", true);
                                resolve({uniqueness: true});
                            }, () => resolve({uniqueness: true}))
            }, 600);

      });
    }
}

export function notEmptyValidator(control) {
  if(control.value == null || control.value.length===0) {
    return {
      notEmpty: true
    }
  }

  return null
}

export function zipCodeValidator(control) {
  var valid = /^\d{5}$/.test(control.value);
  return !valid ? { invalidZip: true }: null;
}

export function symbolValidator(control) {
  if(!control.value)
    return null;
  var valid = control.value.length < 10 && control.value.length >0;
  return !valid ? { invalidSymbol: true}:null;
}

export function factorValidator(control) {
    var valid = /^([+-]?\d+(\.\d+(e[+-]\d+)?)?(e[+-]\d+)?)$/.test(control.value);
    return !valid ? {invalidFactor: true }:null;
}

export function numberValidator(control){
  var valid = /^([+-]?\d+(\.\d+(e[+-]\d+)?)?(e[+-]\d+)?)$/.test(control.value);
  return !valid ? {invalidFactor: true }:null;
} 

export function createFormulaValidator(formula:Formula){
  return function(control){
    return null;
  }
}
export function createMeasureValidator(required:boolean, onlyUnit:boolean=false){
  return function(control):any {
    if(!control.value)
      return null;
    var mea = control.value as Measure;
    if(!required && !mea.isProperty() && !mea.isUnit())
      return null;
    if(onlyUnit){
      var valid = mea.isUnit();
      return !valid ? {onlyUnit: true}:null;
    }
    else{
      var valid = mea.isUnit() || mea.isProperty()
      return !valid ? {required: true}:null;
    }
  }
}


export function createUniqueNameValidator(service:DataService, component:any) {
  let val = new ResourceValidator(service, component);
  return val.validateName.bind(val);
}


  export function createUniqueSymbolValidator(service:DataService, component:any) {
    let val = new ResourceValidator(service, component);
    return val.validateSymbol.bind(val);
}


export function remoteValidator(resource:BaseResource, field:string) {
  return function(control) {
    if(!resource.hasError() || !resource.error_messages[field])
    {
      return null;
     }
     else{
       return {serverErrors: resource.error_messages[field]}
     }
   }
}
