import { ApiUrl } from './../../../../../core/apiUrl';
import { GlobalVariable } from './../../../../../core/global';
import { UtilityService } from './../../../../../services/utility/utility.service';
import { HttpService } from './../../../../../services/http/http.service';
import { QuestionsModel, OptionsModel } from './../../../../../shared/models/questions.model';
import { StyleVariables } from './../../../../../core/theme/styleVariables.model';
import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-questions',
  templateUrl: './questions.component.html',
  styleUrls: ['./questions.component.scss'],
  animations: [
    trigger('fade', [
      transition('void => *', [
        style({ opacity: 0 }),
        animate('500ms ease-in-out', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class QuestionsComponent implements OnInit, OnDestroy {

  styleSubscription: Subscription;
  style: StyleVariables;
  questions: Array<any> = [];
  questionIndex: number = 0;
  isLoading: boolean = false;
  selectedOptions: Array<number> = [];
  selectedQuestions: Array<QuestionsModel> = [];
  currency: string = '';

  constructor(
    private http: HttpService,
    private util: UtilityService,
    public dialogRef: DynamicDialogRef,
    public config: DynamicDialogConfig) {
    this.currency = GlobalVariable.CURRENCY;
  }

  ngOnInit() {

    this.styleSubscription = this.util.getStyles.subscribe(style => {
      if (!!style) {
        this.style = style;
      }
    });
    this.getQuestions();
  }

  getQuestions(): void {
    let params = {
      categoryId: this.config.data.cat_id,
      languageId: this.util.handler.languageId
    }
    this.isLoading = true;
    this.http.getData(ApiUrl.getQuestions, params)
      .subscribe(response => {
        if (!!response && response.data) {
          this.questions = response.data.questionList;
          this.questions.forEach(question => question.optionsList.forEach(option => option.isSelected = false));
        }
        this.isLoading = false;
      }, error => { this.isLoading = false; });
  }

  selectOption(index: number): void {
    let ques_type: number = this.questions[this.questionIndex].questionTypeSelection;
    if (ques_type == 1) {
      this.selectedOptions = [];
      this.questions[this.questionIndex].optionsList.forEach((option) => option.isSelected = false);
      this.questions[this.questionIndex].optionsList[index].isSelected = true;
    }
    if (this.selectedOptions.includes(index)) {
      this.selectedOptions.splice(this.selectedOptions.indexOf(index), 1);
    } else {
      this.selectedOptions.push(index);
    }
  }


  submit(): void {
    if (!this.selectedOptions.length) return;
    let question = new QuestionsModel(this.questions[this.questionIndex]);
    question.optionsList = this.questions[this.questionIndex].optionsList.filter(option => option.isSelected).map(option => new OptionsModel(option));
    this.selectedQuestions.push(question);
    if (this.questions.length > this.questionIndex + 1) {
      this.questionIndex++;
      this.selectedOptions = [];
      this.questions[this.questionIndex].optionsList.forEach((option, index) => {
        if (option.isSelected) { this.selectedOptions.push(index); }
      })
    } else {
      this.dialogRef.close(true);
      this.util.setLocalData('ques_data', this.selectedQuestions, true);
    }
  }

  close(): void {
    this.dialogRef.close(false);
  }

  onBack(): void {
    this.questionIndex--;
    this.selectedOptions = [];
    this.questions[this.questionIndex].optionsList.forEach((option, index) => {
      if (option.isSelected) { this.selectedOptions.push(index); }
    });
  }

  ngOnDestroy() {
    this.styleSubscription.unsubscribe();
  }
}
