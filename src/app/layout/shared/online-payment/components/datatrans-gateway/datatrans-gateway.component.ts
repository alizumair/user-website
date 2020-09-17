import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ScriptModel } from './../../../../../shared/models/script.model';
import { PaymentBaseComponent } from './../payment-base.component';
import { ScriptService } from './../../../../../services/script/script.service';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalVariable } from './../../../../../core/global';

declare const SecureFields: any;

@Component({
  selector: 'app-datatrans-gateway',
  templateUrl: './datatrans-gateway.component.html',
  styleUrls: ['./datatrans-gateway.component.scss']
})
export class DatatransGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  style: StyleVariables;
  styleSubscription: Subscription;

  submitted: boolean = false;
  loading: boolean = false;

  secureFields: any;
  paymentForm: FormGroup;

  cvvInvalid: boolean = false;
  ccInvalid: boolean = false;

  constructor(
    private util: UtilityService,
    private scriptService: ScriptService,
    private formBuilder: FormBuilder,
    private message: MessagingService
  ) {
    super();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    });

    this.paymentForm = this.formBuilder.group({
      exp_year: ['', [Validators.required]],
      exp_month: ['', [Validators.required]],
    });

    const key = this.gateway.key_value_front.find((item) => item.for_front == 1 && item.key == "datatrans_web_merchant_id");
    if (!key) return;

    const datatransScript = new ScriptModel('datatrans', 'https://pay.sandbox.datatrans.com/upp/payment/js/secure-fields-2.0.0.min.js');

    this.scriptService.loadScript(datatransScript).then((script: ScriptModel) => {
      if (!script.isLoaded) {
        this.onError.emit('unable to load datatrans script');
        return;
      }

      this.secureFields = new SecureFields();
      this.secureFields.initPay(key.value,
        {
          cardNumber: "cardNumberPlaceholder",
          cvv: "cvvPlaceholder"
        });
    });
  }

  submitPayment() {
    this.ccInvalid = false;
    this.cvvInvalid = false;

    if (this.paymentForm.invalid) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
      }, 1000 * 60 * 10);
      return;
    }
    this.submitted = false;

    if (this.paymentForm.value.exp_month > 12) {
      this.message.toast('error', 'Invalid Month');
      return;
    }

    let date = new Date();
    if (this.paymentForm.value.exp_year < date.getFullYear().toString().substr(-2)) {
      this.message.toast('error', 'Invalid Year');
      return;
    }

    if (this.paymentForm.value.exp_month < date.getMonth() + 1 && this.paymentForm.value.exp_year <= date.getFullYear().toString().substr(-2)) {
      this.message.toast('error', 'Invalid Expiry');
      return;
    }

    var self = this;

    this.secureFields.on("validate", function (event) {
      self.ccInvalid = !event.fields.cardNumber.valid;
      self.cvvInvalid = !event.fields.cvv.valid;
    });

    this.secureFields.on("success", function (data) {
      if (data.transactionId) {
        self.onSuccess.emit({
          'paymentGatewayId': 'datatrans',
          'token': data.transactionId
        });
      }
    });

    this.secureFields.submit({
      amount: Math.round(this.order.amount),
      expm: this.paymentForm.value.exp_month,
      expy: this.paymentForm.value.exp_year,
      currency: GlobalVariable.CURRENCY_NAME
    });

    this.secureFields.on("error", function(data) {
      self.message.toast('error', data.error);
    });
  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}
