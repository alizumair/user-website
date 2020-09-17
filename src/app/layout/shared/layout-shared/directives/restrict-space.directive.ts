import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appRestrictSpace]'
})
export class RestrictSpaceDirective {

  constructor(
    private el: ElementRef
  ) { }

  @HostListener('keydown', ['$event']) onValueInput(event: any) {
    if (event.keyCode == 32) {
      return event.preventDefault();
    }
    return true;
  }

}
