'use strict';

const request = require('request');
const firebase = require('firebase');
const webpush = require('web-push');
const express = require('express');
const bodyParser = require('body-parser');
const urlsafeBase64 = require('urlsafe-base64');
const base64 = require('hi-base64');
var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

var config = {
    apiKey: "AIzaSyC0tCAZrwbLvTc9QU-9slLuixAb2nsGm78",
    authDomain: "csgo-light.firebaseapp.com",
    databaseURL: "https://csgo-light.firebaseio.com",
    storageBucket: "csgo-light.appspot.com",
    messagingSenderId: "70011847983"
};
firebase.initializeApp(config);
var piDevice = firebase.database().ref('devices/maxxPi');
var devicesList = firebase.database().ref('devices');

// VAPID keys should only be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();
const vapidPublicKey = vapidKeys.publicKey;

//remove `{{  }}` when you are providing keys

webpush.setGCMAPIKey('AAAAEE0IBS8:APA91bFDO1uAbbRvwaFD3NsrN0zVa70E5eZKTxjad3-hHM2ondL4EfgxKhK1ecBFdhvgH-wIwwoZSCPyG9mPvEA_DaUi9Jk6ion_id6CqtcKiXMf5Bdyzmr5SjX0zOBnzRp8hIoPP28qbYH30unWOSRJNy6L1o_NIg');

webpush.setVapidDetails(
    'mailto:maxxscholten@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

var pushSubscription = null;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index', {vapidPublicKey: vapidPublicKey});
});

app.post('/push', function(request, response) {
  pushSubscription = request.body.subscription;
  response.send('OK');
});


devicesList.on("value", function(data) {
    var deviceIsOn = false;
    var deviceStatus, deviceName;
    var devicesListData = data.val();
    for (var key in devicesListData) {
        // skip loop if the property is from prototype
        if (!devicesListData.hasOwnProperty(key)) continue;

        var obj = devicesListData[key];
        if (obj.lightStatus == 1) {
            deviceIsOn = true;
            deviceStatus = obj.lightStatus;
            deviceName = key;
        }
    }
    if (deviceIsOn) {
        sendNotification(deviceStatus, deviceName);
    }

}, function(errorObject) {
    console.log("The read failed: " + errorObject.code);
});


function sendNotification(deviceStatus, deviceName){
  deviceStatus == 1 ? deviceStatus = 'on' : 'off';
  var notificationMsg = deviceName + ' is ' + deviceStatus;
  console.log(notificationMsg);
  webpush.sendNotification(pushSubscription, notificationMsg);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});