import { environment } from './../../../environments/environment';
import { UtilityService } from './../utility/utility.service';
import { StyleVariables } from './../../core/theme/styleVariables.model';
import { Injectable } from '@angular/core';
import swal, { SweetAlertResult } from 'sweetalert2';
import { TranslateService } from '@ngx-translate/core';
import { GlobalVariable } from './../../core/global';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  style: StyleVariables;

  constructor(
    private util: UtilityService,
    private translate: TranslateService
  ) {

    this.util.getStyles.subscribe(style => {
      this.style = style;
    });
  }

  /******************* toast messages ********************/
  toast(type: any, title: string) {
    const toast = swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      showCloseButton: true,
      animation: false,
      timer: 6000,
      // customClass: 'uk-animation-slide-left-medium'
    });
    toast.fire({
      icon: type,
      title: title,
    });
  }

  /******************* confirmation dialog box (returns a promise) ********************/
  async confirm(title: string, text?: string, addremoveFromCartClass?: boolean): Promise<SweetAlertResult> {
    const result: SweetAlertResult = await swal.fire({
      title: `${this.translate.instant('Are You Sure You Want To')} ${title}?`,
      text: text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: this.style.primaryColor,
      cancelButtonColor: this.style.secondaryColor,
      confirmButtonText: this.translate.instant('Yes'),
      animation: false,
      allowOutsideClick: false,
      // customClass: 'uk-animation-slide-top-small'
      customClass: {
        confirmButton: addremoveFromCartClass ? 'removeFromCartGA' : ''
      }
    });
    return result;
  }

  /******************* alert dialog box with button ********************/
  alert(type: any, title: string, text?: string) {
    swal.fire({
      icon: type,
      title: title,
      text: text,
      confirmButtonColor: this.style.primaryColor,
      confirmButtonText: this.translate.instant('Ok'),
      // customClass: 'uk-animation-slide-top-small'
    });
  }


  /******************* FOR DEVELOPMENT: SELECTION OF BACKEND INSTANCES ********************/
  async backendInstance() {
    let options = {};
    Object.keys(GlobalVariable.INSTANCE_OPTIONS).forEach(key => {
      options[key] = GlobalVariable.INSTANCE_OPTIONS[key].user;
    });
    const { value: instance } = await swal.fire({
      title: 'Select Backend Instance',
      input: 'select',
      inputOptions: options,
      confirmButtonColor: this.style.primaryColor,
      cancelButtonColor: this.style.secondaryColor,
      showCancelButton: true
    })
    let current_instance: any = instance;
    if (current_instance) {
      environment.BASE_API_URL = GlobalVariable.INSTANCE_OPTIONS[current_instance].user;
      environment.AGENT_BASE_API_URL = GlobalVariable.INSTANCE_OPTIONS[current_instance].agent;
    }
  }

}
