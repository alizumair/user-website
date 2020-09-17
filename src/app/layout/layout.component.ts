import { ApiUrl } from './../core/apiUrl';
import { GlobalVariable } from './../core/global';
import { environment } from './../../environments/environment';
import { MessagingService } from './../services/messaging/messaging.service';
import { LocationService } from './../services/location/location.service';
import { AppSettings } from "./../shared/models/appSettings.model";
import { StyleVariables } from "./../core/theme/styleVariables.model";
import { StyleConstants } from "./../core/theme/styleConstants.model";
import { UtilityService } from "./../services/utility/utility.service";
import { HttpService } from "./../services/http/http.service";
import { Component, OnInit, HostListener, Inject, PLATFORM_ID, NgZone, AfterViewInit, OnDestroy } from "@angular/core";
import { Router } from "@angular/router";
import { AppHandler } from "./../shared/models/appHandler.model";
import { ApiKeys } from "../shared/models/apiKeys.model";
import { Subscription } from "rxjs";
import { WINDOW } from "../services/window/window.service";
import { DOCUMENT, isPlatformBrowser } from "@angular/common";
import { FcmService } from '../services/fcm/fcm.service';
import { FirebaseAnalyticsService } from '../services/firebase-analytics/firebase-analytics.service';
import { UserService } from '../services/user/user.service';
import { AuthService } from 'angularx-social-login';
import { Meta } from '@angular/platform-browser';

declare var fbq: any;

@Component({
  selector: "app-layout",
  templateUrl: "./layout.component.html",
  styleUrls: ["./layout.component.scss"]
})
export class LayoutComponent implements OnInit, AfterViewInit, OnDestroy {
  body: StyleConstants;
  style: StyleVariables;
  settings: AppSettings;
  handler: AppHandler;
  apiKeys: ApiKeys;
  nav_fixed: boolean = false;
  dialogFlowData: any;
  hiJiffy_link: string = '';
  layout_background = '';
  isLoading: boolean = true;

  styleSubscription: Subscription;
  getDataSubscription: Subscription;
  settingSubscription: Subscription;
  socialUserSubscription: Subscription;
  locationSubscription: Subscription;

  fix_search: boolean = false;

  rtl: 0 | 1 = 0;
  is_instance_selection: boolean = environment.INSTANCE_SELECTION;

  isMobile: boolean = GlobalVariable.IS_MOBILE;
  userSubscription: Subscription;
  userData: any;

  isBrowser: boolean = false;

  constructor(
    private ngZone: NgZone,
    private http: HttpService,
    public util: UtilityService,
    private location: LocationService,
    public router: Router,
    private firebaseMessageService: FcmService,
    private message: MessagingService,
    private user: UserService,
    private socialAuthService: AuthService,
    @Inject(DOCUMENT) private document,
    @Inject(WINDOW) private window: Window,
    @Inject(PLATFORM_ID) private platformId: string,
    private firebaseAnalyticsSvc: FirebaseAnalyticsService,
    private meta: Meta
  ) {
    this.body = new StyleConstants();
    this.style = new StyleVariables();
  }

  @HostListener("window:scroll", ["$event"])
  onScroll() {
    if (Math.ceil(this.window.pageYOffset) >= 180) this.nav_fixed = true;
    else this.nav_fixed = false;

    if (Math.ceil(this.window.pageYOffset) >= 500) this.fix_search = true;
    else this.fix_search = false;
  }

  ngOnInit() {
    this.styleSubscription = this.util.getStyles.subscribe(style => {
      this.style = style;
      this.body.fontFamily = style.fontFamily;
      this.body.backgroundColor = style.backgroundColor;
    });

    this.socialUserSubscription = this.user.logoutSocialUser
      .subscribe(logout => {
        if (logout) {
          this.socialAuthService.signOut();
          this.user.logoutSocialUser.next(false);
        }
      });

    this.userSubscription = this.user.currentUser
      .subscribe(user => {
        if (!!user && user['access_token']) {
          this.userData = user;
          this.getDialogGlowAgentToken();
        } else {
          this.userData = null;
        }
      });

    this.isLoading = true;
    this.settingSubscription = this.util.getSettings.subscribe(
      (settings: AppSettings) => {
        this.settings = settings;
        if (this.settings) {
          if (settings.app_type == 1 && (!settings.default_address.latitude || !settings.default_address.longitude) && !this.util.getLocalData('user_location', true)) {
            this.router.navigate(['/address']);
            return;
          }
          this.isLoading = false;
          if (this.settings.app_type != 1) {
            this.util.callGetData.next(true);
          }
          if (this.settings.app_type == 1 && this.settings.header_theme == 2 && this.settings.default_address.latitude == this.util.handler.latitude && this.settings.default_address.longitude == this.util.handler.longitude) {
            this.detectLocation();
          }
          if (this.settings.placeholder['website_background'].web) {
            this.layout_background = `url(${this.settings.placeholder['website_background'].web})`;
          }

          if (this.settings.selected_template == 3) {
            this.body.backgroundColor = 'transparent';
          }
          if (this.settings.is_custom_category_template === '1') {
            this.body.backgroundColor = "rgb(242 255 255)";
          }
        }
      }
    );

    let langData = this.util.getLocalData('langData', true) ? this.util.getLocalData('langData', true) : {};
    this.util.handler.languageId = langData['id'] || this.util.handler.languageId;
    this.util.handler.rtl = langData['rtl'] || this.util.handler.rtl;
    setTimeout(() => { this.rtl = this.util.handler.rtl }, 0);

    if (isPlatformBrowser(this.platformId)) {
      this.isBrowser = true;
      this.initializeFirebase();
      this.tawkInit();
      this.hiJiffyInit();
      this.facebookPixel();
      this.oribitInit();
      this.pinterestMeta();
      this.zendeskInit();
      this.gtmInit();
      this.addGoogleSearchMetaTag();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.firebaseAnalyticsSvc.firebaseAnalyticsEvents('first_open', 'first_open');
    }
  }

  initializeFirebase() {
    const token = this.util.getLocalData('fcm_token');
    if (!token) {
      this.firebaseMessageService.requestPermission();
    }
    this.firebaseMessageService.receiveMessage();
  }

  pinterestMeta() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.pinterest_content_id) {
        document.querySelector('meta[name="p:domain_verify"]').setAttribute("content", key.pinterest_content_id);
      }
    });
  }

  segment() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.segment_key) {
        (function () {
          var analytics = window['analytics'] = window['analytics'] || [];
          if (analytics.initialize) return;
          if (analytics.invoked) {
            if (window.console && console.error) {
              console.error('Segment snippet included twice.');
            }
            return;
          }
          analytics.invoked = true;
          analytics.methods = [
            'trackSubmit',
            'trackClick',
            'trackLink',
            'trackForm',
            'pageview',
            'identify',
            'reset',
            'group',
            'track',
            'ready',
            'alias',
            'debug',
            'page',
            'once',
            'off',
            'on',
            'addSourceMiddleware',
            'addIntegrationMiddleware',
            'setAnonymousId',
            'addDestinationMiddleware'
          ];
          analytics.factory = function (method) {
            return function () {
              var args = Array.prototype.slice.call(arguments);
              args.unshift(method);
              analytics.push(args);
              return analytics;
            };
          };
          for (var i = 0; i < analytics.methods.length; i++) {
            var key = analytics.methods[i];
            analytics[key] = analytics.factory(key);
          }
          analytics.load = function (key, options) {
            var script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://cdn.segment.com/analytics.js/v1/' + key + '/analytics.min.js';
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(script, first);
            analytics._loadOptions = options;
          };
          analytics.SNIPPET_VERSION = '4.1.0';
          analytics.load(key.segment_key);//OWDhPdp8cx1OdKc3OyiMTMhdtPSQUwdp
          analytics.page();
        })();
      }
    });
  }

  facebookPixel() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.facebook_pixel_id) {
        !function (f, b, e, v, n, t, s) {
          if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ?
              n.callMethod.apply(n, arguments) : n.queue.push(arguments)
          };
          if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
          n.queue = []; t = b.createElement(e); t.async = !0;
          t.src = v; s = b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t, s)
        }
        if (!!fbq) {
          const scriptLink = this.document.createElement('script');
          scriptLink.id = `fb-pixel`;
          scriptLink.setAttribute("type", "text/javascript");
          scriptLink.setAttribute("src", 'https://connect.facebook.net/en_US/fbevents.js');
          document.getElementsByTagName('head')[0].appendChild(scriptLink);
          // (window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');          
          fbq('init', key.facebook_pixel_id);
          fbq('track', 'PageView');
          let img = document.createElement('img');
          img.id = 'facebook-pxl'
          img.src = `https://www.facebook.com/tr?id=${key.facebook_pixel_id}&ev=PageView&noscript=1`;
          document.getElementById('fb-pxp-noscript').appendChild(img);
        }
      }
    });
  }

  oribitInit() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.oribi_analytics) {
        !function (b, o, n, g, s, r, c) {
          if (b[s]) return; b[s] = {};
          b[s].scriptToken = key.oribi_analytics; //"XzEwNTA0NTA1NTg";
          b[s].callsQueue = [];
          b[s].api = function () {
            b[s].callsQueue.push(arguments);
          };
          r = o.createElement(n);
          c = o.getElementsByTagName(n)[0];
          r.async = 1; r.src = g; r.id = s + n;
          c.parentNode.insertBefore(r, c);
        }
        const scriptLink = this.document.createElement('script');
        scriptLink.id = `oribi_analytics`;
        scriptLink.setAttribute("type", "application/javascript");
        scriptLink.setAttribute("src", `https://cdn.oribi.io/${key.oribi_analytics}/oribi.js`);
        // scriptLink.setAttribute("text", text);
        document.getElementsByTagName('head')[0].appendChild(scriptLink);
      }
    });
  }

  zendeskInit() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.zendesk_key) {
        let script = this.document.createElement('script');
        script.id = 'ze-snippet';
        script.type = 'text/javascript';
        script.src = `https://static.zdassets.com/ekr/snippet.js?key=${key.zendesk_key}`;
        this.document.getElementsByTagName('head')[0].appendChild(script);
      }
    });
  }

  tawkInit() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.tawk_site_id) {
        var Tawk_API = Tawk_API || {}, Tawk_LoadStart = new Date();
        (() => {
          var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
          s1.async = true;
          s1.src = `https://embed.tawk.to/${key.tawk_site_id}/default`;
          s1.charset = 'UTF-8';
          s1.setAttribute('crossorigin', '*');
          s0.parentNode.insertBefore(s1, s0);
        })();

        if (GlobalVariable.IS_MOBILE) {
          setTimeout(() => {
            if (this.document.getElementById('tawkchat-container')) {
              this.document.getElementById('tawkchat-container').style.setProperty("bottom", "50px", "important");
            }
          }, 1500);
        }
      }
    });
  }

  hiJiffyInit() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.hijiffy_token) {

        window['HiJiffyWidget'] = window['HiJiffyWidget'] || {};
        window['HiJiffyWidget'].Token = key.hijiffy_token; //z9e8wNcDLcw7Vv
        window['HiJiffyWidget'].AppId = 'hj-' + Math.random().toString(36).substr(2, 16);

        (function (doc, script, time, el) {
          time = Math.floor(new Date().getTime() / 60000);
          el = doc.createElement('div');
          el.id = window['HiJiffyWidget'].AppId;
          doc.getElementsByTagName('body')[0].appendChild(el);

          script = doc.createElement('script');
          script.async = true;
          script.type = 'text/javascript';
          script.src = 'https://widget.hijiffy.com/build.js?t=' + time;
          doc.getElementsByTagName('head')[0].appendChild(script);
        }(document));
      }
    });
  }

  addGoogleSearchMetaTag() {
    this.util.getKeys.subscribe(key => {
      if (!!key && key.google_search_content_id) {
        this.meta.addTags([
          { name: 'google-site-verification', content: key.google_search_content_id }
        ]);
      }
    });
  }

  /****************** Chat Bot ******************/
  getDialogGlowAgentToken() {
    if (isPlatformBrowser(this.platformId) && !!GlobalVariable.DIALOGFLOW_PROJECT_ID) {
      this.http.getData(ApiUrl.getDialogFlowToken, {})
        .subscribe(response => {
          if (!!response && response.data) {
            this.getDialogFlowAgent(response.data.token);
          }
        });
    }
  }

  getDialogFlowAgent(token) {
    this.http.getDialogFlowAgent(token)
      .subscribe(response => {
        if (response) {
          this.dialogFlowData = {
            access_token: token,
            agent: response
          };
        }
      });
  }

  openChatBot() {
    this.document.getElementById("chatBotWindow").style.bottom = "0%";
  }

  detectLocation() {
    this.location.openTracker().subscribe((address) => {
      this.ngZone.run(() => {
        this.util.setUserLocation(address);
        this.router.navigate(['/']);
      })
    }, (err) => {
      // this.message.alert('error', err.message);
    });
  }

  openInstanceSelection() {
    if (this.is_instance_selection) {
      this.message.backendInstance();
    }
  }

  gtmInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.util.getKeys.subscribe(key => {
        if (!!key && key.gtm) {
          var text = `window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', ${key.gtm});
        `
          const scriptLink = this.document.createElement('script');
          scriptLink.id = `gtm_analytics`;
          scriptLink.setAttribute("type", "application/javascript");
          scriptLink.setAttribute("src", `https://www.googletagmanager.com/gtag/js?id=${key.gtm}`);
          scriptLink.text = text;
          document.getElementsByTagName('head')[0].appendChild(scriptLink);
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (!!this.styleSubscription) this.styleSubscription.unsubscribe();
    if (!!this.getDataSubscription) this.getDataSubscription.unsubscribe();
    if (!!this.settingSubscription) this.settingSubscription.unsubscribe();
    if (!!this.socialUserSubscription) this.socialUserSubscription.unsubscribe();
    if (!!this.locationSubscription) this.locationSubscription.unsubscribe();
  }

}
