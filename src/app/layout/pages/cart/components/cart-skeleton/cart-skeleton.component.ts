import { Component, OnInit } from '@angular/core';
import { UtilityService } from '../../../../../services/utility/utility.service';

@Component({
  selector: 'app-cart-skeleton',
  templateUrl: './cart-skeleton.component.html',
  styleUrls: ['./cart-skeleton.component.scss']
})
export class CartSkeletonComponent implements OnInit {

  constructor(
    public util: UtilityService
  ) { }

  ngOnInit() {
  }

}
