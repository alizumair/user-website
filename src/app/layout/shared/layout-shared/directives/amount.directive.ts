import {Directive, ElementRef, HostListener} from '@angular/core';

@Directive({
    selector: '[appAmount]'
})
export class AmountDirective {
    // Allow decimal numbers and negative values
    private regex: RegExp = new RegExp(/^\d+\.?\d{0,2}$/g);
    // Allow key codes for special events. Reflect :
    // Backspace, tab, end, home
    private specialKeys: Array<string> = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight'];

    constructor(private el: ElementRef) {
    }

    @HostListener('keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        // Allow Backspace, tab, end, and home keys
        if (this.el.nativeElement.value === 0) {
            this.specialKeys = ['Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];
        } else {
            this.specialKeys = ['Backspace', 'Tab', 'End', 'Home', 'Delete', 'ArrowLeft', 'ArrowRight'];
        }

        if (this.specialKeys.indexOf(event.key) !== -1) {
            return;
        }
        const current: string = this.el.nativeElement.value;
        const next: string = current.concat(event.key);
        if (next && !String(next).match(this.regex)) {
            event.preventDefault();
        }
    }
}
