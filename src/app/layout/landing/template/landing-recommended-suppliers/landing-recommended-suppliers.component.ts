import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-landing-recommended-suppliers',
  templateUrl: './landing-recommended-suppliers.component.html',
  styleUrls: ['./landing-recommended-suppliers.component.scss']
})
export class LandingRecommendedSuppliersComponent implements OnInit {

  @Input()
  suppliers: Array<any> = [];

  @Output()
  onViewDetial: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
