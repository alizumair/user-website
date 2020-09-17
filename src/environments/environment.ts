// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // ONBOARDING_BASE_API_URL: 'https://codebrew.royoapps.com/v1/common',

  // BASE_API_URL: 'https://api.royoapps.com',

  // AGENT_BASE_API_URL: 'https://onboarding-agent.royoapps.com',

  // ONBOARDING_TRACK_BASE_URL: 'https://codebrew.royoapps.com',


  ONBOARDING_BASE_API_URL: 'https://onboarding-livebkend.royoapps.com/v1/common',

  BASE_API_URL: 'https://api-saas.royoapps.com',

  AGENT_BASE_API_URL: 'https://onboarding-liveagent.royoapps.com',

  ONBOARDING_TRACK_BASE_URL: 'https://onboarding-livebkend.royoapps.com',


  DIALOGFLOW_API_URL_V2: 'https://dialogflow.googleapis.com/v2',

  INSTANCE_SELECTION: true,

  // FIREBASE: {
  //   apiKey: "AIzaSyBDRuECPQxMDSNk10A_wQpXnsEFKHJouaM",
  //   authDomain: "royo-977f3.firebaseapp.com",
  //   databaseURL: "https://royo-977f3.firebaseio.com",
  //   projectId: "royo-977f3",
  //   storageBucket: "royo-977f3.appspot.com",
  //   messagingSenderId: "907248328957",
  //   appId: "1:907248328957:web:2c6ded397ad18a871e1e94",
  //   measurementId: "G-C5MEVC617D"
  // },

  FIREBASE: {
    apiKey: "AIzaSyBKobBfA6Xv_G1YjUpbDfjqB7O6QitTKFk",
    authDomain: "royo-1579097488371.firebaseapp.com",
    databaseURL: "https://royo-1579097488371.firebaseio.com",
    projectId: "royo-1579097488371",
    storageBucket: "royo-1579097488371.appspot.com",
    messagingSenderId: "330441983518",
    appId: "1:330441983518:web:74bc74aea638653617100f",
    measurementId: "G-KHV1BXGSY5"
  },

  CYBERSOURCE_API_URL: 'https://apitest.cybersource.com/flex/v1/tokens',

  CONVERGEPAY_API_URL: 'https://api.demo.convergepay.com/hosted-payments'

};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
