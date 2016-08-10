import { Observable } from 'rxjs/Rx';
import { DataService } from '../../services/data-service';
import { Measure, Formula } from '../../types/standard';
/*
source:https://raw.githubusercontent.com/restlet/restlet-sample-angular2-forms/master/app/validators/custom.validators.ts

*/

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
  return function(control) {
    if(!control.value)
      return null;
    var mea = control.value as Measure;
    if(!required && !mea.isProperty && !mea.isUnit)
      return null;
    if(onlyUnit){
      var valid = mea.isUnit();
      return !valid ? {invalidMeasure: true}:null;
    }
    else{
      var valid = mea.isUnit() || mea.isProperty()
      return !valid ? {invalidMeasure: true}:null;
    }
  }
}


export function createUniqueNameValidator(service:DataService, resourceType:string, component) {

  return function(control) {
    if(component.nameTimeout)
      clearTimeout(component.nameTimeout);
    return new Promise((resolve, reject) => {
                component.nameTimeout = setTimeout(() => {
                  service.isUnique(resourceType, "name", control.value as string, (res, i)=> control.value == res.name)
                        .subscribe(res => {
                          if(res.unique){
                              resolve(null);
                          }
                          else{
                            resolve({uniqueName: true});
                          }
                        }, err=>{
                            resolve({uniqueName: true});
                        }, () => resolve({uniqueName: true}))
          }, 600);

    });
  }



      // service.findByName(resourceType, control.value).subscribe(
    	 //  data => {
      //     if (data.length === 0 || (data.length === 1 &&
      //           component.company.id === data[0].id)) {
      //       resolve(null);
      //     } else {
      //       resolve({uniqueName: true});
      //     }
      //   },
      //   err => {
      //     resolve({uniqueName: true});
      //   }
      // });
}

