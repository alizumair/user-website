import { Injectable } from '@angular/core';
import { IInputValidator } from '../../core/models/input-validator.interface';
import { FormControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidationService implements IInputValidator {

  constructor() { }

  private textLength = 100;
  private passwordMinLength = 8;
  private passwordMaxLength = 16;
  private portNumberLength = 6;
  private pinCodeLength = 6;

  number: RegExp = /^[0-9]*$/;
  bssid: RegExp = /^(([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}[,]?)+$/;
  // tslint:disable-next-line:max-line-length
  email: RegExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  numberWithTwoDecimals: RegExp = /^[0-9]+(\.[0-9]{1,2})?$/;
  // tslint:disable-next-line:max-line-length
  ipAddress: RegExp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  // tslint:disable-next-line:max-line-length
  mobile: RegExp = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

  password: RegExp = /^(?=.*[A-z])(?=.*[0-9])\S{8,16}$/;
  isMobileValid(value: string | number): string {
    const identity = `${value}`;
    if (!identity.match(/^\d{10}$/) &&
      !identity.match(/^(\+\d{1,3}[- ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {
      return 'invalid mobile number';
    }
  }

  isEmailValid(value: string): string {
    if (!this.email.test(value)) {
      return 'Invalid email address';
    }
  }

  isPasswordValid(value: string): string {
    if (!value) {
      return 'invalid password';
    }

    if (value.length < this.passwordMinLength) {
      return `atleast ${this.passwordMinLength} characters are required`;
    }

    if (value.length > this.passwordMaxLength) {
      return `maximum allowed characters are  ${this.passwordMaxLength}`;
    }

    if (!this.password.test(value)) {
      return 'Password should have 8 character and one number';
    }
  }

  noWhitespaceValidator(control: FormControl): { [key: string]: boolean } | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
  }
}

class Status {
  state: string
  0: number;
}
