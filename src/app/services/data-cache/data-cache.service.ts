import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';

const maxAge = 15 * 60 * 1000;
@Injectable({
  providedIn: 'root'
})
export class DataCacheService {

  private requests = new Map();

  constructor() { }

  put(url: string, response: HttpResponse<any> | any): void {
    this.requests.set(url, { response, updatedOn: Date.now() });
  }

  get(url: string): HttpResponse<any> | undefined {
    const cached = this.requests.get(url);
    if (!cached) {
      return undefined;
    }
    const isExpired = cached.updatedOn < (Date.now() - maxAge);
    if (isExpired) {
      this.removeKey(url);
      return undefined;
    }
    return cached.response;
  }

  hasKey(url: string): boolean {
    return this.requests.has(url);
  }

  invalidateCache(): void {
    return this.requests.clear();
  }

  removeKey(url: string) {
    return this.requests.delete(url);
  }

}
