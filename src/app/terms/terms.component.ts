import { UtilityService } from './../services/utility/utility.service';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-terms',
  template: `<div > <header class="term-header">{{heading}}</header> <div class="container" [innerHtml]="terms | safe: 'html'"></div> </div>`,
  styleUrls: ['./terms.component.scss']
})
export class TermsComponent implements OnInit {

  heading: string = '';
  terms: string;

  constructor(
    private route: ActivatedRoute,
    private util: UtilityService
  ) { }

  ngOnInit() {

    let langData = this.util.getLocalData('langData', true) || { id: this.util.handler.languageId };
    let data = this.route.snapshot.data.termsAndPolicy;
    let termsAndPolicy = data.find(item => item.language_id == langData.id);
    let type = this.route.snapshot.data.type;

    switch (type) {
      case 1:
        this.terms = termsAndPolicy['terms_and_conditions'];
        this.heading = 'Terms And Conditions'
        break;
      case 2:
        this.terms = termsAndPolicy['faq'];
        this.heading = 'Privacy Policy'
        break;
      case 3:
        this.terms = termsAndPolicy['about_us'];
        this.heading = 'About Us'
        break;
      case 4:
        this.terms = termsAndPolicy['faqs'];
        this.heading = "FAQ's"
        break;
    }
  }

}
