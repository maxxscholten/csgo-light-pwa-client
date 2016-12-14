var request = require('request');
var firebase = require('firebase');
const webpush = require('web-push');
var express = require('express');
var app = express();

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

//console.log(vapidKeys)

//remove `{{  }}` when you are providing keys

webpush.setGCMAPIKey('AAAAEE0IBS8:APA91bFDO1uAbbRvwaFD3NsrN0zVa70E5eZKTxjad3-hHM2ondL4EfgxKhK1ecBFdhvgH-wIwwoZSCPyG9mPvEA_DaUi9Jk6ion_id6CqtcKiXMf5Bdyzmr5SjX0zOBnzRp8hIoPP28qbYH30unWOSRJNy6L1o_NIg');

webpush.setVapidDetails(
    'mailto:maxxscholten@gmail.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);


// This is the same output of calling JSON.stringify on a PushSubscription
// TODO the keys are to be obtained yourself and filled out
const pushSubscription = {
    endpoint: 'https://android.googleapis.com/gcm/send/d3Yv2xKfa94:APA91bHua6UyxjLgvbOr2tWlah6sumokMJn8rm08pNjMNwZeqP4JQenv_mPiUWiw2bmosc0psuCtNIafBZ_c_1ift-nNGOVQmfeJT7vzdxmXfmKg_3Y42vGN7yX35SwkNFIJDAwU03JX',
    keys: {
        auth: 'Ohgw1MyAxWRH7h-9NKwnbQ==',
        p256dh: 'BFfQaIfz9IKbRN2Yw4gi6xrpVLiX4uJ3htrMpfQvQ2wyMCBdoeq97Gby7OZBOh4QI64244uGqCWoFJ-JWcQAdbQ='
    }
};


devicesList.on("value", function(data) {
    var deviceIsOn = false;
    var deviceStatus, deviceName;
    var devicesListData = data.val();
    for (var key in devicesListData) {
        // skip loop if the property is from prototype
        if (!devicesListData.hasOwnProperty(key)) continue;

        var obj = devicesListData[key];
        console.log(obj.lightStatus);
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
  webpush.sendNotification(pushSubscription, notificationMsg)
      .then(function(result) {
          console.log(result)
      }).catch(function(error) {
          console.log('error', error)
      })
}




app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});