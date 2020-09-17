import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { WINDOW } from '../window/window.service';

@Injectable({
  providedIn: 'root'
})
export class GoogleTagManagerService {

  constructor(
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document
  ) { }

  init(gtmId: string): Promise<any> {
    return new Promise((resolve, reject) => {

      let scriptElement: any = this.document.createElement('script');
      const headScript = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer',"${gtmId}");`;

      const bodyScript = `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>`;

      scriptElement.text = headScript;

      if (scriptElement.readyState) {  //IE
        scriptElement.onreadystatechange = () => {
          if (scriptElement.readyState === "loaded" || scriptElement.readyState === "complete") {
            scriptElement.onreadystatechange = null;
            this.document.body.innerHTML = bodyScript + this.document.body.innerHTML;
            return resolve();
          }
        };
      } else {  //Others
        scriptElement.onload = () => {
          this.document.body.innerHTML = bodyScript + this.document.body.innerHTML;
          return resolve();
        };
      }
      scriptElement.onerror = (error: any) => {
        return reject(error);
      };
      this.document.getElementsByTagName('head')[0].appendChild(scriptElement);
    })
  }

}
