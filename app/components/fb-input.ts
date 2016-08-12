import {Component, Input, OnChanges} from "@angular/core";
import {IONIC_DIRECTIVES } from "ionic-angular";

@Component({
  selector: 'fb-input',
  template: `<ion-item> 
                  <label>{{labelText}}</label>
                  <ng-content></ng-content>
                  
                  <p>
                  <span *ngIf="errorMessage">
                             {{errorMessage}}
                  </span>
                  </p>
             </ion-item>
            `,
  directives: [IONIC_DIRECTIVES]
})
export class FBInput implements OnChanges {
  @Input()
  labelText:string = '';
  @Input()
  inputErrors:any;
  @Input()
  errorDefs:any;
  
  errorMessage:string = '';
  
  ngOnChanges(changes:any):void {
    var errors:any = changes.inputErrors.currentValue;
    this.errorMessage = '';
    if (errors) {
      Object.keys(this.errorDefs).some(key => {
        if (errors[key]) {
          this.errorMessage = this.errorDefs[key];
          return true;
        }
      });
    }
  }
}