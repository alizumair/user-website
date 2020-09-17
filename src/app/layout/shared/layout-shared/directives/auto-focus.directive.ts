import { Directive, Input, AfterContentInit, ElementRef, AfterContentChecked, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterContentInit {

  private focus = true;

  @Input()
  set appAutofocus(condition: boolean) {
    this.focus = condition !== false;
  }

  constructor(private el: ElementRef) { 
  }

  ngAfterContentInit() {
    if (this.focus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
        this.el.nativeElement.style.backgroundColor = 'red'
      })
    }

  }
}