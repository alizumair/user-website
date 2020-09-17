export const GlobalVariable = {

	SITE_NAME: " ",
	CURRENCY: '$',
	CURRENCY_NAME: 'USD',
	device_token: 'web_brower_token',
	device_type: 2,
	COUNTRY: '',
	PHONE_NUMBER: '',
	EMAIL: '',
	UNIQUE_ID: '',
	IS_MOBILE: false,
	AGENT_DB_KEY: '',

	// PATTERNS: {
	// email: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
	// colors: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
	// },

	SECRET_DB_KEY: '',

	facebook_appId: '',

	google_clientId: '',

	imageType: ['image/jpg', 'image/jpeg', 'image/png'],

	BLOCK_HEADERS: ['https://apitest.cybersource.com/flex/v1/tokens', 'https://api.cybersource.com/flex/v1/tokens', 'https://testsecureacceptance.cybersource.com/pay', 'https://codebrew.royoapps.com/v1/common/client/user/track/info', 'https://jsonip.com'],

	BLOCK_ERRORS: ['https://codebrew.royoapps.com/v1/common/client/user/track/info', 'https://jsonip.com'],

	flowData: [],

	admin_domain: '',

	DIALOGFLOW_PROJECT_ID: '',

	decimal_quantity_step: 0.15,

	INSTANCE_OPTIONS: {
		default: { user: 'https://api.royoapps.com', agent: 'https://onboarding-agent.royoapps.com' },
		monu: { user: 'https://monu-api.royodev.tk', agent: 'https://monu-agent.royodev.tk' },
		ishan: { user: 'https://ishan-api.royodev.tk', agent: 'https://ishan-agent.royodev.tk' },
		gagan: { user: 'https://gagan-api.royodev.tk', agent: 'https://gagan-agent.royodev.tk' }
	},

	FIREBASE_CONFIG: {
		apiKey: "AIzaSyBDRuECPQxMDSNk10A_wQpXnsEFKHJouaM",
		authDomain: "royo-977f3.firebaseapp.com",
		databaseURL: "https://royo-977f3.firebaseio.com",
		projectId: "royo-977f3",
		storageBucket: "royo-977f3.appspot.com",
		messagingSenderId: "907248328957",
		appId: "1:907248328957:web:2c6ded397ad18a871e1e94",
		measurementId: "G-C5MEVC617D"
	}

}



export const TableBookingStatus = {
	'': '',
	0: 'Pending',
	1: 'Confirm',
}