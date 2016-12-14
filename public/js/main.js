'use strict';

//Checking if browser supports serviceWorker
if ('serviceWorker' in navigator) {
  console.log('Service Worker is supported on this browser');


  navigator.serviceWorker.register('sw.js').then(function(serviceWorkerRegistration) {
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription().then(function(subscription) {
          // If a subscription was found, return it.
          if (subscription) {
            return subscription;
          }

          // Otherwise, subscribe the user (userVisibleOnly allows to specify
          // that we don't plan to send notifications that don't have a
          // visible effect for the user).
          return serviceWorkerRegistration.pushManager.subscribe({
            userVisibleOnly: true
          });
      }).then(function(subscription) {
          console.log(serviceWorkerRegistration.pushManager.getSubscription());
          $.post('/push', {subscription: subscription.toJSON()});
      });
  });
}
