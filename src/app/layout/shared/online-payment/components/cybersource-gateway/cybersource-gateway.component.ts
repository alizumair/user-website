import { environment } from './../../../../../../environments/environment';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { PaymentBaseComponent } from './../payment-base.component';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-cybersource-gateway',
  templateUrl: './cybersource-gateway.component.html',
  styleUrls: ['./cybersource-gateway.component.scss']
})
export class CybersourceGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  style: StyleVariables;
  styleSubscription: Subscription;
  showAddCard: boolean = false;
  paymentForm: FormGroup;
  submitted: boolean = false;
  card_type: string = '';
  loading: boolean = false;

  constructor(
    private http_client: HttpClient,
    private util: UtilityService,
    private http: HttpService,
    private formBuilder: FormBuilder,
    private message: MessagingService
  ) {
    super();
    this.style = new StyleVariables();
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    });

    if (this.settings.card_gateway['cybersource'] == 1) {
      this.showAddCard = true;
    } else {
      this.createPaymentForm()
    }
  }

  createPaymentForm() {
    this.paymentForm = this.formBuilder.group({
      exp_year: ['', [Validators.required, Validators.minLength(4)]],
      exp_month: ['', [Validators.required]],
      cvc: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(4)]],
      number: ['', [Validators.required]]
    })
  }

  submitPayment() {
    if (this.paymentForm.invalid) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
      }, 1000 * 60 * 10);
      return;
    }

    this.getCaptureContext();
  }

  monthFormatter(n) {
    return n.length > 1 ? n : '0' + n;
  }

  getCaptureContext() {
    this.loading = true;
    this.http.getData(ApiUrl.getCaptureContext, {})
      .subscribe(response => {
        if (!!response && response.data) {
          const captureContext = response.data.keyId;

          let params = {
            keyId: captureContext,
            cardInfo: {
              cardNumber: this.paymentForm.value.number,
              cardExpirationMonth: this.monthFormatter(this.paymentForm.value.exp_month),
              cardExpirationYear: this.paymentForm.value.exp_year,
              securityCode: this.paymentForm.value.cvc,
              cardType: this.card_type
            }
          }

          this.http_client.post<HttpClient>(environment.CYBERSOURCE_API_URL, params)
            .subscribe(response => {
              if (!!response) {
                this.onSuccess.emit({
                  'paymentGatewayId': 'cybersource',
                  'token': response['token']
                });
              }
              this.loading = false;
            }, err => {
              this.loading = false;
              this.message.alert('error', err.error.responseStatus.details[0].message);
            });

        }
      });
  }

  ccChange(event: BehaviorSubject<any>) {
    let event_subscription = event.subscribe(res => {
      switch (res) {
        case 'visa':
          this.card_type = '001';
          break;
        case 'mastercard': case 'eurocard':
          this.card_type = '002';
          break;
        case 'amex':
          this.card_type = '003';
          break;
        case 'discover':
          this.card_type = '004';
          break;
        case 'dinersclub':
          this.card_type = '005';
          break;
        case 'jcb':
          this.card_type = '007';
          break;
        case 'dankort':
          this.card_type = '034';
          break;
        case 'maestro':
          this.card_type = '042';
          break;
        case 'rupay':
          this.card_type = '061';
          break;
        default:
          this.card_type = '001';
      }
    });
    event_subscription.unsubscribe();
  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}
