import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { GlobalVariable } from './../../../../../core/global';
import { ApiUrl } from './../../../../../core/apiUrl';
import { HttpService } from './../../../../../services/http/http.service';
import { ValidationService } from './../../../../../services/validation/validation.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { DynamicDialogRef } from "primeng/dynamicdialog";

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss']
})
export class EmailComponent implements OnInit {

  emailForm: FormGroup;
  isSubmitted: boolean = false;

  constructor(
    public dialogRef: DynamicDialogRef,
    private validation: ValidationService,
    private httpService: HttpService,
    private messageService: MessagingService,
    private fb: FormBuilder
  ) { }

  ngOnInit() {
    this.emailForm = this.fb.group({
      email: new FormControl('', [Validators.required, Validators.pattern(this.validation.email)]),
      subject: new FormControl('', [Validators.required, Validators.maxLength(200)]),
      body: new FormControl('', [Validators.required, Validators.maxLength(1000)])
    })
  }

  onSend(): void {
    this.isSubmitted = true;
    if (this.emailForm.invalid) {
      setTimeout(() => {
        this.isSubmitted = false;
      }, 300000);
      return;
    }

    this.httpService.postData(ApiUrl.sendEmail, {
      receiverEmail: GlobalVariable.EMAIL,
      senderEmail: this.emailForm.controls.email.value,
      subject: this.emailForm.controls.subject.value,
      content: this.emailForm.controls.body.value
    }).subscribe((response) => {
      if (response && response.status == 200) {
        this.messageService.toast('success', 'Email Sent Successfully')
      }
      this.close();
    }, (err) => {
      console.log('error', err)
    })

  }

  get controls() { return this.emailForm.controls; }

  close() {
    this.dialogRef.close();
  }
}
