self.addEventListener('push', event => {
  let minute;
  try { minute = event.data.json().minute; } catch { return; }
  if (![1, 2, 3].includes(minute)) return;
  event.waitUntil(self.registration.showNotification('GameTrace notification test', {
    body: minute + (minute === 1 ? ' minute' : ' minutes') + ' after enabling the test.',
    tag: 'gametrace-dev-test-' + minute,
    icon: '/icons/gametrace-official-192.png'
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow('/'));
});
