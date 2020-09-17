import { MessagingService } from './../../../services/messaging/messaging.service';
import { GlobalVariable } from './../../../core/global';
import { UtilityService } from './../../../services/utility/utility.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {

  orderId: any = '';
  isLoading: boolean = false;
  constructor(
    private utilityService: UtilityService,
    private message: MessagingService,
    private httpService: HttpService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.checkError();
  }

  ngOnInit() {
    const payload: any = this.utilityService.getLocalData('gop', true);
    if (payload) {
      switch (payload['gateway_unique_id']) {
        case 'myfatoorah':
          payload['payment_token'] = this.route.snapshot.queryParams['paymentId'];
          break;

        case 'tap':
          payload['payment_token'] = this.route.snapshot.queryParams['tap_id'];
          break;

        case 'converge':
          payload['payment_token'] = this.route.snapshot.queryParams['ssl_txn_id'];
          break;

        case 'windcave':
          payload['payment_token'] = this.route.snapshot.queryParams['result'];
          break;

        case 'mpaisa':
          payload['payment_token'] = this.route.snapshot.queryParams['tID'];
          break;
      }

      let transactionType = this.utilityService.getLocalData('transactionType')

      if (transactionType == 'wallet') {
        this.isLoading = true;
        this.httpService.postData(ApiUrl.addWalletMoney, payload).subscribe((response) => {
          this.router.navigate(['/', 'account', 'my-wallet']).then(() => {
            if (response && response.status == 200) {
              this.message.toast('success', 'money added');
            } else {
              this.message.toast('success', 'payment failed');
            }
            this.utilityService.setLocalData('transactionType', null);
            this.utilityService.setLocalData('gop', null);
          });
        }, (err) => {
          this.router.navigate(['/', 'account', 'my-wallet']).then(() => {
            this.message.toast('success', 'payment failed');
            this.utilityService.setLocalData('transactionType', null);
            this.utilityService.setLocalData('gop', null);
          });
        })
      } else if (transactionType == 'subscription') {
        this.httpService.postData(ApiUrl.buySubscription, payload).subscribe((response) => {
          if (response) {
            this.router.navigate(['/', 'account', 'subscriptions']).then(() => {
              if (response && response.status == 200) {
                this.message.toast('success', 'subscription added');
              } else {
                this.message.toast('success', 'payment failed');
              }
              this.utilityService.setLocalData('transactionType', null);
              this.utilityService.setLocalData('gop', null);
            });
          }
          this.isLoading = false;
        }, (err) => this.router.navigate(['/', 'account', 'subscriptions']).then(() => {
          this.message.toast('success', 'payment failed');
          this.utilityService.setLocalData('transactionType', null);
          this.utilityService.setLocalData('gop', null);
        }))
      }
      else {
        this.httpService.postData(ApiUrl.generateOrder, payload, false)
          .subscribe(response => {
            if (!!response && response.data) {
              this.orderId = response.data;
              localStorage.removeItem('gop');
              this.utilityService.setCart([]);
            }
          });
      }
    }
  }

  onViewOrder(): void {
    this.router.navigate(['/orders/order-detail'], { queryParams: { orderId: this.orderId } });
  }

  checkError() {
    if (this.route.snapshot.queryParams['rCode'] == 111) {
      return this.router.navigate(['/', 'failure']);
    }
  }

}
