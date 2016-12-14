'use strict';

//Checking if browser supports serviceWorker
if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported on this browser');

  navigator.serviceWorker.register('sw.js').then(function() {
    return navigator.serviceWorker.ready;
  }).then((serviceWorkerRegistration) => {
    serviceWorkerRegistration.pushManager.getSubscription()
    .then((subscription) => {
      console.log(subscription.toJSON());
      $.post('/push', {
        subscription: subscription.toJSON()
      });

    });
  }).then(function(reg) {
    console.log('Service Worker is ready to go!');
    reg.pushManager.subscribe(
      {
        userVisibleOnly: true,
        applicationServerKey: window.vapidPublicKey
      }
    ).then(function(sub) {
      //console.log(JSON.stringify(sub));
    });
  }).catch(function(error) {
    console.log('Service Worker failed to boot', error);
  });
}
