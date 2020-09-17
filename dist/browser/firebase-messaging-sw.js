importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.6.0/firebase-messaging.js');

var apiKey = new URL(location).searchParams.get('apiKey');
var authDomain = new URL(location).searchParams.get('authDomain');
var databaseURL = new URL(location).searchParams.get('databaseURL');
var projectId = new URL(location).searchParams.get('projectId');
var storageBucket = new URL(location).searchParams.get('storageBucket');
var messagingSenderId = new URL(location).searchParams.get('messagingSenderId');
var appId = new URL(location).searchParams.get('appId');
var measurementId = new URL(location).searchParams.get('measurementId');

if (apiKey && authDomain && databaseURL && projectId && storageBucket && messagingSenderId && appId && measurementId) {
  
  firebase.initializeApp({
    apiKey: apiKey,
    authDomain: authDomain,
    databaseURL: databaseURL,
    projectId: projectId,
    storageBucket: storageBucket,
    messagingSenderId: messagingSenderId,
    appId: appId,
    measurementId: measurementId
  });

  const messaging = firebase.messaging();

  messaging.setBackgroundMessageHandler(function (payload) {
    console.log('Handling background message ', payload);
    let order_data = JSON.parse(payload.notification.body).data;
    return self.registration.showNotification('You Have A New Order', {
      body: 'Order no: ' + order_data.orderId + ' | Placed On: ' + order_data.Date,
    });
  });


  self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(self.clients.openWindow(event.notification.data));
  });

}
