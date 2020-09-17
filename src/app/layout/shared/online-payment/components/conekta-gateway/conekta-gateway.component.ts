import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { StyleVariables } from '../../../../../core/theme/styleVariables.model';
import { UtilityService } from '../../../../../services/utility/utility.service';
import { ScriptService } from '../../../../../services/script/script.service';
import { ScriptModel } from '../../../../../shared/models/script.model';
import { PaymentBaseComponent } from '../payment-base.component';

declare const Conekta: any;

@Component({
  selector: 'app-conekta-gateway',
  templateUrl: './conekta-gateway.component.html',
  styleUrls: ['./conekta-gateway.component.scss']
})
export class ConektaGatewayComponent extends PaymentBaseComponent implements OnInit, OnDestroy {

  isLoading: boolean = true;
  showAddCard: boolean = false;

  paymentForm: FormGroup;
  submitted: boolean = false;
  style: StyleVariables;

  styleSubscription: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private scriptService: ScriptService,
    private utilService: UtilityService
  ) {
    super();
    this.style = new StyleVariables();
  }

  ngOnInit() {
    this.makeSubscription();

    if (this.settings.card_gateway['conekta'] == 1) {
      this.showAddCard = true;
    } else {
      const { key, value } = this.gateway.key_value_front.find((item) => item.for_front == 1);

      const script = new ScriptModel('conekta', 'https://cdn.conekta.io/js/latest/conekta.js');

      this.scriptService.loadScript(script).then((script: ScriptModel) => {
        if (!script.isLoaded) {
          console.log('unable to load conekta script');
          this.onError.emit('unable to load conekta script');
          return;
        }
        Conekta.setPublicKey(value);
        this.createPaymentForm();
        this.isLoading = false;
      });
    }
  }

  makeSubscription() {
    this.styleSubscription = this.utilService.getStyles.subscribe((style: StyleVariables) => {
      this.style = style;
    })
  }

  private validateCardNumber(control: FormControl): { [key: string]: boolean } | null {
    if (Conekta.card.validateNumber(control.value)) {
      return null;
    } else {
      return { 'cardNumber': true };
    }
  }

  private validateCVC(control: FormControl): { [key: string]: boolean } | null {
    if (Conekta.card.validateCVC(control.value)) {
      return null;
    } else {
      return { 'cvc': true };
    }
  }

  createPaymentForm() {
    this.paymentForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      exp_year: ['', [Validators.required, Validators.minLength(4)]],
      exp_month: ['', [Validators.required]],
      cvc: ['', [Validators.required, this.validateCVC]],
      number: ['', [Validators.required, this.validateCardNumber]]
    })
  }

  addCard() {
    if (this.paymentForm.invalid) {
      this.submitted = true;
      setTimeout(() => {
        this.submitted = false;
      }, 1000 * 60 * 10);
      return;
    }

    const self = this;

    const successResponseHandler = (token) => {
      self.onSuccess.emit({ 'paymentGatewayId': 'conekta', 'token': token.id });
    };

    const errorResponseHandler = function (error) {
      self.onError.emit(error.message);
    };

    Conekta.Token.create({
      card: this.paymentForm.value,
    }, successResponseHandler, errorResponseHandler);

  }

  onCardSelect($event) {
    this.onSuccess.emit($event);
  }

  ngOnDestroy(): void {
    if (this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}

