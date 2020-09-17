import { AppSettings } from './../../shared/models/appSettings.model';
import { StyleVariables } from './../../core/theme/styleVariables.model';
import { GlobalVariable } from './../../core/global';
import { UtilityService } from './../../services/utility/utility.service';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input, SimpleChanges, OnChanges, SimpleChange, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs';

declare const $: any;

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit, OnChanges, OnDestroy {

  @Output() closeAuth = new EventEmitter<boolean>();
  @ViewChild('closeModal', { static: false }) closeModal: ElementRef;
  @ViewChild('openForgot', { static: false }) openForgot: ElementRef;
  @Input() authType: string;

  siteName: string = '';
  registrationUrl: string = '';
  styleSubscription: Subscription;
  settingSubscription: Subscription;
  style: StyleVariables;
  isLogin: boolean = true;
  forgotPassword: boolean = false;
  otherLogins: boolean = true;
  inCompleteProfile: any = {};
  settings: AppSettings;

  constructor(private util: UtilityService) {

    this.style = new StyleVariables();
    this.siteName = GlobalVariable.SITE_NAME;
    this.registrationUrl = `${GlobalVariable.admin_domain}/#!/supplier-registration`;
  }

  ngOnInit() {
    this.authTypeCheck(this.authType);

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.settingSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        if(settings) {
          this.settings = settings;
        }
      });
  }

  ngOnChanges(changes: SimpleChanges) {
    const name: SimpleChange = changes.authType.currentValue;
    this.authTypeCheck(name);
  }

  authTypeCheck(type: any) {
    switch (type) {
      case 'LOGIN':
        this.isLogin = true;
        break;
      case 'SIGNUP':
        this.isLogin = false;
        break;
    }
  }

  close() {
    this.closeModal.nativeElement.click();
  }

  openModal() {
    $("#auth").modal('show');
  }

  closeAuthModal() {
    this.closeAuth.emit(false);
  }

  closeModalFromChild(event: boolean) {
    if (event) this.close();
  }

  openForgotPassword() {
    this.forgotPassword = true;
  }

  onInCompleteProfile(data?: any) {
    this.inCompleteProfile = data;
    this.isLogin = false;
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
    this.settingSubscription.unsubscribe();
    this.close();
    this.isLogin = false;
    this.forgotPassword = false;
  }

}
