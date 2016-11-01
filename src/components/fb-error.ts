import { Component, Input } from "@angular/core";

@Component({
  selector: 'fb-error',
  template: `<ion-item *ngIf="fcontrol && fcontrol.pending">
                        <p>Checking ...</p>
                    </ion-item>        
                    <ion-item *ngIf="fcontrol && !fcontrol.valid && !fcontrol.pending && (!fcontrol.pristine )">
                        <p>{{getErrorMessage(fcontrol)}}</p>
                    </ion-item>
            `,
})
export class FBError {
  @Input()
  fcontrol:any;

  errorDefs={required: 'This field is required',
          maxlength: 'The value should be at maximum 50 characters',
          minlength: 'The value should be at least 2 characters',
          uniqueness:'This value already taken',
          onlyUnit: 'The measure should be unit not property'}
  constructor(){

  }

  ngOnInit(){

  }

  getErrorMessage(con){
    return this.errorDefs[Object.keys(con.errors)[0]]
  }
}