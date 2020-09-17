import { FormControl } from '@angular/forms';

export interface IInputValidator {
    email: RegExp;
    mobile: RegExp;
    password: RegExp;
    isEmailValid: (value: string) => string;
    isMobileValid: (value: string | number) => string;

    isPasswordValid: (value: string) => string;
    noWhitespaceValidator: (control: FormControl) => { [key: string]: boolean } | null;
}