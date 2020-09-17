import { environment } from './../../../environments/environment';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from "@angular/common/http";
import { map } from 'rxjs/operators';
import { LoaderService } from '../loader/loader.service';
import { GlobalVariable } from './../../core/global';
import { DataCacheService } from '../data-cache/data-cache.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(
    private http: HttpClient,
    private loader: LoaderService,
    private data_cache: DataCacheService) { }

  getDBKey(url: string, params?: { [x: string]: any; }): Observable<any> {
    let _params = params ? { params: this.appendParams(params) } : {};
    return this.http.get<HttpClient>(environment.ONBOARDING_BASE_API_URL + url, _params)
  }

  /******************** HTTP Requests ********************/
  getData(url: string, params?: { [x: string]: any; }, backGroundUrls?: boolean, is_cache?: boolean): Observable<any> {
    if (!!this.data_cache.get(url) && is_cache) {
      return new Observable(observer => observer.next(this.data_cache.get(url)));
    } else {
      let _params = params ? { params: this.appendParams(params) } : {};
      if (backGroundUrls) {
        this.loader.backGroundUrls.push(environment.BASE_API_URL + url);
      }
      return this.http.get<any>(environment.BASE_API_URL + url, _params)
        .pipe(
          map((response: any) => {
            if (response['status'] === 200 || response['status'] === 4) {
              if (is_cache) {
                this.data_cache.put(url, response);
              }
              return response;
            }
          })
        );
    }
  }

  postData(url: string, data: { [x: string]: any; }, backGroundUrls?: boolean): Observable<any> {
    if (backGroundUrls) {
      this.loader.backGroundUrls.push(environment.BASE_API_URL + url);
    }
    return this.http.post<HttpClient>(environment.BASE_API_URL + url, data)
      .pipe(
        map(response => {
          if (response['status'] === 200) {
            return response;
          }
        })
      );
  }

  putData(url: string, data: { [x: string]: any; }, backGroundUrls?: boolean): Observable<any> {
    if (backGroundUrls) {
      this.loader.backGroundUrls.push(environment.BASE_API_URL + url);
    }
    return this.http.put<HttpClient>(environment.BASE_API_URL + url, data)
      .pipe(
        map(response => {
          if (response['status'] === 200) return response;
        })
      );
  }

  deleteData(url: string, id: string): Observable<any> {
    return this.http.delete<HttpClient>(environment.BASE_API_URL + url + '/' + id)
      .pipe(
        map(response => {
          if (response['status'] === 200) return response;
        })
      );
  }

  postAgentData(url: string, data: { [x: string]: any; }, _headers: any, backGroundUrls?: boolean): Observable<any> {
    if (backGroundUrls) {
      this.loader.backGroundUrls.push(environment.AGENT_BASE_API_URL + url);
    }
    let headers = new HttpHeaders();
    _headers.forEach(element => {
      headers = headers.append(element.key, element.value);
    });
    return this.http.post<HttpClient>(environment.AGENT_BASE_API_URL + url, data, { headers: headers })
      .pipe(
        map(response => {
          if (response['statusCode'] === 200) {
            return response;
          }
        })
      );
  }

  getAgentData(url: string, params, _headers: any, backGroundUrls?: boolean): Observable<any> {
    let _params = this.appendParams(params);

    if (backGroundUrls) {
      this.loader.backGroundUrls.push(environment.AGENT_BASE_API_URL + url);
    }
    let headers = new HttpHeaders();
    _headers.forEach(element => {
      headers = headers.append(element.key, element.value);
    });
    return this.http.get<HttpClient>(environment.AGENT_BASE_API_URL + url, { headers: headers, params: _params })
      .pipe(
        map(response => {
          if (response['statusCode'] === 200) {
            return response;
          }
        })
      );
  }

  /******************** HTTP Request For Dialog Flow ********************/
  dialogFlowMsg(access_token, data: { [x: string]: any; }): Observable<any> {
    const api_path = environment.DIALOGFLOW_API_URL_V2 + `/projects/${GlobalVariable.DIALOGFLOW_PROJECT_ID}/agent/sessions/1234:detectIntent`;
    this.loader.backGroundUrls.push(api_path);
    if (!GlobalVariable.BLOCK_HEADERS.includes(api_path)) {
      GlobalVariable.BLOCK_HEADERS.push(api_path);
    }
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${access_token}`);
    return this.http.post<HttpClient>(api_path, data, { headers: headers })
  }

  getDialogFlowAgent(access_token): Observable<any> {
    const api_path = environment.DIALOGFLOW_API_URL_V2 + `/projects/${GlobalVariable.DIALOGFLOW_PROJECT_ID}/agent`;
    this.loader.backGroundUrls.push(api_path);
    if (!GlobalVariable.BLOCK_HEADERS.includes(api_path)) {
      GlobalVariable.BLOCK_HEADERS.push(api_path);
    }
    let headers = new HttpHeaders();
    headers = headers.append('Authorization', `Bearer ${access_token}`);
    return this.http.get<HttpClient>(api_path, { headers: headers });
  }

  /******************** HTTP Formdata ********************/
  appendFormData(myFormData: { [x: string]: any; }): FormData {
    let fd = new FormData();
    for (let key in myFormData) {
      fd.append(key, myFormData[key]);
    }
    return fd;
  }

  /******************** HTTP Params ********************/
  appendParams(myParams: { [x: string]: any; }): HttpParams {
    let params = new HttpParams();
    for (let key in myParams) {
      params = params.append(key, myParams[key]);
    }
    return params;
  }
}