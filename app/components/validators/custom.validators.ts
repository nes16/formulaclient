import {Observable} from 'rxjs/Rx';
import {DataService} from '../../services/data-service';
/*
source:https://raw.githubusercontent.com/restlet/restlet-sample-angular2-forms/master/app/validators/custom.validators.ts

*/

export function notEmptyValidator(control) {
  if(control.value == nul l || control.value.length===0) {
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

export function createUniqueNameValidator(service:DataService, resourceType:string, component) {
  return function(control) {
    return new Promise((resolve, reject) => {
      service.findByName(resourceType, control.value).subscribe(
    	  data => {
          if (data.length === 0 || (data.length === 1 &&
                component.company.id === data[0].id)) {
            resolve(null);
          } else {
            resolve({uniqueName: true});
          }
        },
        err => {
          resolve({uniqueName: true});
        }
      });
    });
  };
}