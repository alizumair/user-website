import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { HttpService } from '../http/http.service';
import { ApiUrl } from '../../core/apiUrl';
import { retry, map } from 'rxjs/operators';
import { rejects } from 'assert';
import { UtilityService } from '../utility/utility.service';

@Injectable({
  providedIn: 'root'
})
export class TermsAndPolicyService implements Resolve<any>{

  constructor(
    private http: HttpService,
    private utilService: UtilityService
  ) { }

  resolve() {
    return new Promise((resolve, reject) => {
      this.utilService.getSettings.subscribe((settings) => {
        if (settings) {
          this.http.getData(ApiUrl.getTermsConditions, {}, true, false).pipe(map(response => response.data)).subscribe((response) => {
            return resolve(response);
          }, (err) => {
            return reject(err);
          });

        }
      })
    })
  }
}
