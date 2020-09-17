import { UserService } from './../../../services/user/user.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { MessagingService } from './../../../services/messaging/messaging.service';
import { HttpService } from './../../../services/http/http.service';
import { StyleVariables } from './../../../core/theme/styleVariables.model';
import { Subscription } from 'rxjs';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit } from '@angular/core';
import { ApiUrl } from './../../../core/apiUrl';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss']
})
export class FeedbackComponent implements OnInit {

  form: FormGroup;
  showError: boolean = false;
  styleSubscription: Subscription;
  style: StyleVariables;
  suggestions: Array<any> = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private message: MessagingService,
    private util: UtilityService,
    private userService: UserService
  ) { }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
    });
    this.makeForm();
    this.getSuggestions();
  }

  getSuggestions() {
    let params = {
      offset: 0,
      limit: 100
    }
    this.http.getData(ApiUrl.getSuggestions, params)
      .subscribe(response => {
        if (!!response && response.data) {
          this.suggestions = response.data.data;
          this.suggestions.forEach(el => {
            el['checked'] = false;
          });
        }
      });
  }

  selectSuggestion(suggestion) {
    suggestion['checked'] = !suggestion['checked'];
  }

  makeForm() {
    this.form = this.fb.group({
      'name': ['', Validators.compose([Validators.required])],
      'phone': ['', Validators.compose([Validators.required, Validators.minLength(6), Validators.maxLength(20)])],
      'description': [''],
      'new_suggestions': [''],
      'email_id': ['', Validators.compose([Validators.required, Validators.email])],
    });
  }

  onSubmit(value) {
    this.showError = true;
    if (this.form.valid) {
      this.isLoading = true;
      let selectedSuggestions = [];
      this.suggestions.forEach(el => {
        if( el.checked) {
          selectedSuggestions.push(el.name);
        }
      });
      this.suggestions
      let formData = {
        name: value.name,
        phone: value.phone,
        description: value.description,
        new_suggestions: value.new_suggestions,
        email_id: value.email_id,
        suggestions_assigned: selectedSuggestions.length ? selectedSuggestions.join(',') : '',
        from_user_id: this.userService.currentUserValue.id,
        from_user_type: 'USER'
      }
      this.http.postData(ApiUrl.submitFeedback, formData)
        .subscribe(response => {
          this.isLoading = false;
          if (!!response && response.data) {
            this.message.toast('success', `Feedback Submitted`);
            this.form.reset();
            this.suggestions.forEach(el => {
              el['checked'] = false;
            });
            this.showError = false;
          }
        }, error => { this.isLoading = false });

    }
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
  }

}
