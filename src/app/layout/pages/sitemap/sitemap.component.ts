import { ApiUrl } from './../../../core/apiUrl';
import { HttpService } from './../../../services/http/http.service';
import { UtilityService } from './../../../services/utility/utility.service';
import { WINDOW } from './../../../services/window/window.service';
import { Component, OnInit, Inject } from '@angular/core';
import { GlobalVariable } from './../../../core/global';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss']
})
export class SitemapComponent implements OnInit {

  siteName: string = '';
  domain: string = '';
  suppliers: Array<any> = [];
  categories: Array<any> = [];

  sitemap: string = '';

  constructor(
    @Inject(WINDOW) private window: Window,
    private util: UtilityService,
    private http: HttpService
  ) {

    this.siteName = GlobalVariable.SITE_NAME;
    this.domain = this.window.origin;
  }

  ngOnInit() {
    this.getCategories();
    this.getSuppliers();

    this.sitemap = `
    <meta http-equiv="content-type" content="text/xml; charset=UTF-8">
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="https://yammfood.royoapps.com">
    <url>
        <loc>https://yammfood.royoapps.com</loc>
        <lastmod>2020-06-15</lastmod>
    </url>
    <url>
        <loc>https://yammfood.royoapps.com/about</loc>
        <lastmod>2020-06-15</lastmod>
    </url>
    <url>
        <loc>https://yammfood.royoapps.com/faq</loc>
        <lastmod>2020-06-15</lastmod>
    </url>
    <url>
        <loc>https://yammfood.royoapps.com/terms-and-conditions</loc>
        <lastmod>2020-06-15</lastmod>
    </url>
    <url>
        <loc>https://yammfood.royoapps.com/privacy-policy</loc>
        <lastmod>2020-06-15</lastmod>
    </url>
    </urlset>
    `;
  }

  getCategories() {
    this.util.getLanguageCategoryData
      .subscribe(categories => {
        if (categories) {
          categories.english.forEach(category => {
            this.categories.push({
              name: category.name,
              link: `${this.domain}/supplier/supplier-list?cat_id=${category.id}&cat_name=${category.name}`
            });
          });
        }
      })
  }


  getSuppliers() {
    let param_data = {
      languageId: this.util.handler.languageId,
      latitude: this.util.handler.latitude,
      longitude: this.util.handler.longitude,
      search: ''
    };
    this.http.getData(ApiUrl.getHomeSuppliers, param_data)
      .subscribe(response => {
        if (!!response && response.data) {
          response.data.forEach(supplier => {
            this.suppliers.push({
              name: supplier.name,
              link: `${this.domain}/products/listing?supplierId=${supplier.id}&branchId=${supplier.supplier_branch_id}&isBranch=false`
            });
          });
        }
      });
  }

}
