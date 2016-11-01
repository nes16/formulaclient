import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { Directive, forwardRef } from '@angular/core';
import { UnitSelector } from './unit';

const UNIT_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => UnitValueAccessor),
    multi: true
};
@Directive({
  selector: 'fl-unit-sel',
  host: { '(change)': 'onChange($event)'/*, '(blur)': 'onTouched()'*/ },
  providers: [UNIT_VALUE_ACCESSOR]
})
export class UnitValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(public host: UnitSelector) {

  }

  writeValue(value: any): void {
    this.host.writeValue(value);
  }
 
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}