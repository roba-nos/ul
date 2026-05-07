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
    vibrate: data.vibrate || [100, 50, 100],
    badge: data.icon || 'https://via.placeholder.com/128'
  };

  e.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', e => {
    e.notification.close();
    const urlToOpen = e.notification.data.url;
    
    e.waitUntil(
        clients.openWindow(urlToOpen)
    );
});
