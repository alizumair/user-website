import { ValidationService } from './../../../../../services/validation/validation.service';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaymentBaseComponent } from './../payment-base.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mumybene-gateway',
  templateUrl: './mumybene-gateway.component.html',
  styleUrls: ['./mumybene-gateway.component.scss']
})
export class MumybeneGatewayComponent extends PaymentBaseComponent implements OnInit {


  mobileNumberForm: FormGroup;
  showError: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private validator: ValidationService,
  ) {
    super();
  }

  ngOnInit() {
    this.createForm();
  }

  createForm() {
    this.mobileNumberForm = this.formBuilder.group({
      'mobile_no': ['', Validators.compose([Validators.required, Validators.pattern(this.validator.mobile)])]
    })
  }

  onSubmit() {
    if (this.mobileNumberForm.invalid) {
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 60000)
      return;
    }
    this.onSuccess.emit({
      'paymentGatewayId': 'mumybene',
      'mobile_no': this.mobileNumberForm.value['mobile_no']
    });
  }

  close() {
    this.onClose.emit(false);
  }

}
