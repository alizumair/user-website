import { LoaderService } from './services/loader/loader.service';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { WINDOW } from './services/window/window.service';
import { isPlatformServer, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  load: boolean = false;

  constructor(
    private loaderService: LoaderService,
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformId: string) {
    this.loaderService.pageRefresh.next(true);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.setFavicon();
      document.getElementById("splash_screen").style.display = "none";
    }
  }

  setFavicon() {
    if (isPlatformServer(this.platformId)) return;
    const icon = this.window.localStorage.getItem('favicon');
    if (icon) {
      let link = this.window.document.getElementById('favicon');
      link.setAttribute('href', icon);
    }
  }

}
