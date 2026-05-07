// ====================================================
// Smart Push SDK
// ====================================================
const SUPABASE_FUNCTIONS_URL = 'https://rtcnheqqzvvdbrdmpzsr.supabase.co/functions/v1';
const SUPABASE_STORAGE_URL   = 'https://rtcnheqqzvvdbrdmpzsr.supabase.co/storage/v1/object/public/public-site';
const SUPABASE_ANON_KEY      = 'sb_publishable_urB1hflL5FDePpONRZ--EA_5b8jmxuz';

const PushNotificationTool = {

  init() {
    this.addBellIcon();
  },

  addBellIcon() {
    if (document.getElementById('push-bell-icon')) return;

    const bell = document.createElement('div');
    bell.id = 'push-bell-icon';
    bell.innerHTML = '🔔';
    Object.assign(bell.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      background: 'linear-gradient(135deg, #6366f1, #ec4899)',
      borderRadius: '50%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: 'white',
      fontSize: '22px',
      cursor: 'pointer',
      boxShadow: '0 4px 15px rgba(99,102,241,0.5)',
      zIndex: '999999',
      transition: 'transform 0.3s',
    });
    bell.onmouseover = () => bell.style.transform = 'scale(1.15)';
    bell.onmouseout  = () => bell.style.transform = 'scale(1)';
    bell.onclick     = () => this.openSubscriptionPopup();
    document.body.appendChild(bell);
  },

  openSubscriptionPopup() {
    const domain = window.location.hostname || 'unknown';
    const w = 420, h = 520;
    const left = (screen.width  / 2) - (w / 2);
    const top  = (screen.height / 2) - (h / 2);
    window.open(
      `${SUPABASE_STORAGE_URL}/subscribe.html?domain=${domain}`,
      'SmartPush',
      `width=${w},height=${h},top=${top},left=${left}`
    );
  }
};

// تشغيل تلقائي
if (document.readyState === 'complete') {
  PushNotificationTool.init();
} else {
  window.addEventListener('load', () => PushNotificationTool.init());
}

window.PushNotificationTool = PushNotificationTool;
