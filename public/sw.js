
self.addEventListener('install', (e) => {
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : { title: 'Trade Alert', body: 'New signal' };
  const title = data.title || 'Trade Alert';
  const options = {
    body: data.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
