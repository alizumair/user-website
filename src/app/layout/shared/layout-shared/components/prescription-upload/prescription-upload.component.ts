import { Router } from '@angular/router';
import { UserService } from './../../../../../services/user/user.service';
import { ApiUrl } from './../../../../../core/apiUrl';
import { GlobalVariable } from './../../../../../core/global';
import { LocalizationPipe } from './../../../../../shared/pipes/localization.pipe';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { MessagingService } from './../../../../../services/messaging/messaging.service';
import { HttpService } from './../../../../../services/http/http.service';
import { AppSettings } from './../../../../../shared/models/appSettings.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-prescription-upload',
  templateUrl: './prescription-upload.component.html',
  styleUrls: ['./prescription-upload.component.scss']
})
export class PrescriptionUploadComponent implements OnInit, OnDestroy {

  addressList: Array<any> = [];
  selectedAreaIndex: number = -1;

  isDialogClose: boolean = false;
  isLoading: boolean = false;
  imageType: Array<string> = [];
  image: string = '';
  prescriptionForm: FormGroup;
  styleSubscription: Subscription;
  settingsSubscription: Subscription;
  style: StyleVariables;
  settings: AppSettings;
  file = {}

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig,
    private http: HttpService,
    private message: MessagingService,
    private util: UtilityService,
    private localization: LocalizationPipe,
    private translate: TranslateService,
    private userService: UserService,
  ) {
    this.imageType = GlobalVariable.imageType;
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles
      .subscribe((style: StyleVariables) => {
        this.style = style;
      });

    this.settingsSubscription = this.util.getSettings
      .subscribe((settings: AppSettings) => {
        this.settings = settings;
      });
    this.getAddress();
    this.initPrescriptionForm();
  }

  initPrescriptionForm() {
    this.prescriptionForm = this.formBuilder.group({
      prescription: [''],
      file: [''],
    });
  }

  getAddress() {
    let obj = {
      accessToken: this.userService.getUserToken,
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude
    }

    this.isLoading = true;

    this.http.postData(ApiUrl.address.getAddress, obj, true)
      .subscribe(response => {
        if (!!response && response.data) {
          this.addressList = response.data.address;
          let index = response.data.address.findIndex((add) => add.is_default == 1);
          if (index > -1) {
            this.selectedAreaIndex = index;
          } if (this.addressList.length) {
            this.selectedAreaIndex = 0;
          }
        }
        this.isLoading = false;
      }, err => this.isLoading = false);
  }

  get form() { return this.prescriptionForm.controls; }



  onImageSelect(event: any): void {
    if (event.target.files && event.target.files[0]) {
      let file = event.target.files[0];
      if (this.imageType.includes(file.type)) {
        if ((file.size / Math.pow(1024, 2)) <= 1) {
          this.prescriptionForm.value.file = file;
          this.file = file;
          let reader: FileReader = new FileReader();
          reader.readAsDataURL(event.target.files[0]);
          reader.onload = (e: any) => {
            this.image = e.target.result;
          }
        } else this.message.toast('warning', this.translate.instant('Image Size Must Be Less Than 1mb'));
      } else this.message.toast('warning', this.translate.instant('Invalid File Type'));
    }
  }

  onAddressSelect(index: any) {
    this.selectedAreaIndex = index;
  }

  onSubmit(): void {
    if (this.selectedAreaIndex <= -1) {
      this.message.toast('warning', this.translate.instant('Please Select Address'));
      return
    }

    if (this.prescriptionForm.invalid) {
      return;
    }

    if (!this.prescriptionForm.value.file && !this.prescriptionForm.value.prescription) {
      this.message.alert('warning', this.translate.instant('Fields Are Empty'));
      return;
    }

    this.isLoading = true;
    let formObj = {
      file: this.file,
      prescription: this.prescriptionForm.value.prescription,
      supplier_branch_id: this.config.data.supplier_branch_id,
      deliveryId: this.addressList[this.selectedAreaIndex].id
    }
    let formData = this.http.appendFormData(formObj);
    this.http.postData(ApiUrl.supplierPrescriptionUpload, formData)
      .subscribe(response => {
        if (!!response && response.data) {
          this.close();
          this.message.toast('success', `${this.localization.transform('prescription_value')} ${this.translate.instant('Submitted Successfully')}`);
        }
        this.isLoading = false;
      }, err => { this.isLoading = false; });
  }

  removeImage(i: number): void {
    this.image = '';
    this.prescriptionForm.value.file = '';
    this.prescriptionForm.controls['file'].reset();
  }

  close(): void {
    this.isDialogClose = true;
    this.dialogRef.close();
  }

  ngOnDestroy() {
    if (!!this.settingsSubscription) this.settingsSubscription.unsubscribe();
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
  }

}
