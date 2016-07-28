import {Host,Component,Input,Output,OnInit,EventEmitter,ElementRef} from '@angular/core';
import {NgClass,Control,NG_VALUE_ACCESSOR, ControlValueAccessor} from '@angular/common';
import {Directive,  Renderer, Self, forwardRef, Provider} from '@angular/core';
import {UnitSelector} from './unit';

const UNIT_VALUE_ACCESSOR = new Provider(
    NG_VALUE_ACCESSOR, {useExisting: forwardRef(() => UnitValueAccessor), multi: true});

@Directive({
  selector: 'fl-unit-sel',
  host: { '(change)': 'onChange($event)'/*, '(blur)': 'onTouched()'*/ },
  providers: [UNIT_VALUE_ACCESSOR]
})
export class UnitValueAccessor implements ControlValueAccessor {
  onChange = (_) => {};
  onTouched = () => {};

  constructor(private host: UnitSelector) {

  }

  writeValue(value: any): void {
    this.host.writeValue(value);
  }
 
  registerOnChange(fn: (_: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
}