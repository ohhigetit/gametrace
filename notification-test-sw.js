self.addEventListener('push', event => {
  let payload;
  try { payload = event.data.json(); } catch { return; }
  const { minute, minutes, title, encouragement, event: name, startsAt, venue, id } = payload;
  if ([45, 30, 15].includes(minutes) && typeof title === 'string') {
    const time = new Date(startsAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    event.waitUntil(self.registration.showNotification(title, {
      body: [name, time, venue].filter(Boolean).join(' · ') + '\n' + encouragement,
      tag: ['gametrace-dev-reminder', id, startsAt, minutes].join(':'),
      icon: '/icons/gametrace-official-192.png'
    }));
    return;
  }
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
