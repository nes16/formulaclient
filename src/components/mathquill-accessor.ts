import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MathQ } from './mathquill';

export const MQ_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MathQValueAccessor),
    multi: true
};

@Directive({
  selector: 'mathq',
  host: { '(change)': 'onChange($event)'/*, '(blur)': 'onTouched()'*/ },
  providers: [MQ_VALUE_ACCESSOR]
})
export class MathQValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(public host: MathQ) {

  }

  writeValue(value: any): void {
    this.host.writeValue(value);
  }
 
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}