import { ValidationService } from './../../../services/validation/validation.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Component, OnInit, Inject, OnDestroy, Input, ElementRef, ViewChild } from '@angular/core';
import { HttpService } from './../../../services/http/http.service';
import { BotMessage } from './../../../shared/models/botMessage.model';
import { DOCUMENT } from "@angular/common";
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { UtilityService } from './../../../services/utility/utility.service';
import { Subscription } from 'rxjs';
import { ApiUrl } from '../../../core/apiUrl';
import { MessagingService } from './../../../services/messaging/messaging.service';

@Component({
  selector: 'app-chat-bot',
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.scss']
})
export class ChatBotComponent implements OnInit, OnDestroy {

  @Input() dialogFlowData: any;
  @Input() userData: any;
  @ViewChild('closeNewAddress', { static: false }) closeNewAddress: ElementRef;

  messages: Array<BotMessage> = [];
  message: string = '';
  styleSubscription: Subscription;
  style: StyleVariables;
  address: Array<any> = [];

  form: FormGroup;
  showError: boolean = false;
  isLoading: boolean = false;
  display: string = 'none';
  selectedAddressId: any = '';

  constructor(
    private util: UtilityService,
    private router: Router,
    private fb: FormBuilder,
    private validator: ValidationService,
    private messageService: MessagingService,
    private http: HttpService,
    @Inject(DOCUMENT) private document) {

    this.messages = [
      new BotMessage('BOT', 'Welcome!', [])
    ];
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(
      (style: StyleVariables) => {
        this.style = style;
      });

    this.getAddress();
    this.makeNewAddressForm();
  }

  getAddress() {
    let obj = {
      accessToken: this.userData.access_token,
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }

    this.http.postData(ApiUrl.address.getAddress, obj, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.address = response.data.address;
        }
      });
  }

  sendMessage() {
    if (!this.message.trim()) {
      this.messages.push(
        new BotMessage('BOT', 'Please type something, I will try to help you out', [])
      );
      return;
    }
    this.messages.push(
      new BotMessage('USER', this.message, [])
    );

    this.scrollDiv();

    let param_data = {
      queryInput: {
        text: {
          text: this.message,
          languageCode: this.dialogFlowData.agent.defaultLanguageCode
        }
      },
      queryParams: {
        timeZone: this.dialogFlowData.agent.timeZone
      }
    };
    this.http.dialogFlowMsg(this.dialogFlowData.access_token, param_data)
      .subscribe(response => {
        let itemArr: Array<any> = [];
        if (!!response['queryResult'].webhookPayload) {
          itemArr = response['queryResult'].webhookPayload.richResponse.items;
        }
        this.messages.push(
          new BotMessage('BOT', response['queryResult'].fulfillmentText, itemArr, 0)
        );

        this.scrollDiv();

      });
    this.message = '';
  }

  scrollDiv() {
    setTimeout(() => {
      let msgDiv = this.document.getElementById('chatWindow');
      msgDiv.scrollTop = msgDiv.scrollHeight + 200;
    }, 100);
  }

  closeChatBot(data) {
    switch (data.type) {
      case 0:
        if(data.product) {
          this.messages.push(
            new BotMessage('USER', `Selected: ${data.product.name}`, [], -1)
          );
        }
        if(this.address.length) {
          this.messages.push(
            new BotMessage('BOT', `${this.userData.firstname}, Please Select Location`, this.address, 1)
          );
        } else {
          this.messages.push(
            new BotMessage('BOT', `${this.userData.firstname}, Please Add A New Address`, [], 1)
          );
        }

        this.scrollDiv();
        break;

      case 1:
        this.messages.push(
          new BotMessage('USER', data.address, [], -1)
        );
        this.messages.push(
          new BotMessage('BOT', 'Do You Wish To Proceed With This Order?', [], 2)
        );
        this.selectedAddressId = data.address_id;
        this.scrollDiv();
        break;

      case 2:
        this.messages.push(
          new BotMessage('USER', `${data.answer == 1 ? 'Yes' : 'No'}`, [], -1)
        );
        if(data.answer == 1) {
          this.messages.push(
            new BotMessage('BOT', 'How Would You Like To Pay?', [], 3)
          );
        } else {
          this.messages.push(
            new BotMessage('BOT', 'What Else Can I Help You With?', [], -1)
          );
        }
        this.scrollDiv();
        break;

      case 3:
        if (data.answer == 1) {
          this.messages = [];
          this.router.navigate(['/cart'], { queryParams: { p_mode : '1'} });
          this.closeChat();
        } else {
          this.confirmOrder();
          this.closeChat();
        }
        break;

        case 4: 
        this.display = 'block';
        break
    }
  }

  confirmOrder() {
    this.messageService.confirm('Place Order Now')
      .then(data => {
        if(data.value) {
          this.messages = [];
          this.router.navigate(['/cart'], { queryParams: { place_order : '1', adrs_id: this.selectedAddressId } });
        }
      });
  }

  makeNewAddressForm() {
    this.form = this.fb.group({
      'name': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'houseNo': ['', Validators.compose([Validators.required, this.validator.noWhitespaceValidator])],
      'addressLineFirst': ['', Validators.compose([Validators.required])],
      'latitude': ['', Validators.compose([Validators.required])],
      'longitude': ['', Validators.compose([Validators.required])],
      'phone_number': ['', Validators.compose([Validators.required, Validators.pattern(this.validator.mobile)])]
    });
  }

  onAdd(value) {
    if (this.form.invalid) {
      this.showError = true;
      setTimeout(() => {
        this.showError = false;
      }, 300000);
      return;
    }
    let payload = {
      name: value.name.trim(),
      addressLineFirst: value.houseNo.trim(),
      customer_address: value.addressLineFirst.trim(),
      phone_number: value.phone_number,
      accessToken: this.userData.access_token,
      latitude: value.latitude,
      longitude: value.longitude,
      languageId: this.util.handler.languageId
    }

    this.isLoading = true;
    this.http.postData(ApiUrl.address.addAddress, payload)
      .subscribe(response => {
        if (response && response.status === 200) {
          this.address.push(response.data);
          this.form.reset();
          this.closeNewAddress.nativeElement.click();
          this.closeChatBot({type: 0});
        }
        this.isLoading = false;
      }, (err) => {
        this.isLoading = false;
      });
  }

  onAddressSearch(data) {
    this.form.controls.addressLineFirst.setValue(data.formatted_address);
    this.form.controls.latitude.setValue(data.lat);
    this.form.controls.longitude.setValue(data.lng);
  }
  

  closeChat() {
    this.document.getElementById("chatBotWindow").style.bottom = "-200%";
  }

  ngOnDestroy() {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
  }
}
