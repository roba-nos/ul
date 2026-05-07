self.addEventListener('push', e => {
  const data = e.data.json();
  console.log('Push Received...', data);
  
  const options = {
    body: data.message,
    icon: data.icon || 'https://via.placeholder.com/128',
    image: data.image || '', // الصورة الكبيرة
    data: {
        url: data.url || '/'
    },
    vibrate: [200, 100, 200],
    badge: data.icon || 'https://via.placeholder.com/128',
    actions: [
        { action: 'open', title: '🔗 فتح الرابط' },
        { action: 'close', title: '✖ إغلاق' }
    ]
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    if (e.action === 'close') return;

    const urlToOpen = e.notification.data.url;
    e.waitUntil(
        clients.openWindow(urlToOpen)
    );
});
