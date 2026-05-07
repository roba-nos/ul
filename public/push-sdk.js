// ====================================================
// Smart Push SDK Pro - OneSignal Style
// ====================================================
const SUPABASE_FUNCTIONS_URL = 'https://rtcnheqqzvvdbrdmpzsr.supabase.co/functions/v1';
const SUPABASE_ANON_KEY      = 'sb_publishable_urB1hflL5FDePpONRZ--EA_5b8jmxuz';

const PushNotificationTool = {
    init(options = {}) {
        this.options = {
            primaryColor: '#6366f1',
            secondaryColor: '#ec4899',
            promptTitle: 'هل تود استقبال آخر العروض والتحديثات؟',
            promptMsg: 'فعل التنبيهات الآن لتبقى على اطلاع بكل جديد فوراً.',
            allowText: 'سماح ✅',
            denyText: 'ليس الآن',
            ...options
        };
        
        this.injectStyles();
        
        // التحقق من الاشتراك الحالي
        if (!localStorage.getItem('push_subscribed')) {
            setTimeout(() => this.showSlidePrompt(), 2000);
        }
    },

    injectStyles() {
        const css = `
            .sp-prompt {
                position: fixed; top: -150px; left: 50%; transform: translateX(-50%);
                width: 90%; max-width: 450px; background: rgba(15, 23, 42, 0.9);
                backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px; padding: 20px; z-index: 9999999;
                display: flex; flex-direction: column; gap: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.4);
                transition: top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Cairo', sans-serif; direction: rtl;
            }
            .sp-prompt.active { top: 20px; }
            .sp-header { display: flex; align-items: center; gap: 12px; }
            .sp-title { color: #fff; font-weight: 700; font-size: 0.95rem; }
            .sp-msg { color: #94a3b8; font-size: 0.8rem; line-height: 1.4; }
            .sp-actions { display: flex; gap: 10px; justify-content: flex-end; }
            .sp-btn {
                padding: 8px 18px; border-radius: 10px; border: none; font-weight: 700;
                font-size: 0.8rem; cursor: pointer; transition: 0.3s;
            }
            .sp-btn-allow { background: linear-gradient(135deg, #6366f1, #ec4899); color: #fff; }
            .sp-btn-deny { background: rgba(255,255,255,0.05); color: #94a3b8; }
            .sp-btn:hover { transform: translateY(-2px); opacity: 0.9; }
        `;
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

        // إضافة خط كايرو
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    },

    showSlidePrompt() {
        const prompt = document.createElement('div');
        prompt.className = 'sp-prompt';
        prompt.id = 'sp-prompt';
        prompt.innerHTML = `
            <div class="sp-header">
                <div style="font-size: 1.5rem;">🔔</div>
                <div>
                    <div class="sp-title">${this.options.promptTitle}</div>
                    <div class="sp-msg">${this.options.promptMsg}</div>
                </div>
            </div>
            <div class="sp-actions">
                <button class="sp-btn sp-btn-deny" onclick="PushNotificationTool.closePrompt()">${this.options.denyText}</button>
                <button class="sp-btn sp-btn-allow" onclick="PushNotificationTool.subscribeDirectly()">${this.options.allowText}</button>
            </div>
        `;
        document.body.appendChild(prompt);
        setTimeout(() => prompt.classList.add('active'), 100);
    },

    closePrompt() {
        const prompt = document.getElementById('sp-prompt');
        if (prompt) {
            prompt.classList.remove('active');
            setTimeout(() => prompt.remove(), 600);
        }
    },

    async subscribeDirectly() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        
        if (isIOS) {
            // توجيه مستخدمي الأيفون لصفحة التعليمات (لأنهم يحتاجون Add to Home Screen)
            window.location.href = 'https://roba-nos.github.io/ul/public/subscribe.html?domain=' + window.location.hostname;
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') return this.closePrompt();

            this.closePrompt();
            
            // تسجيل الـ SW (يجب أن يكون الملف متاحاً في موقع العميل)
            const reg = await navigator.serviceWorker.register('/sw.js');
            
            // جلب المفتاح VAPID
            const keyRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/vapid-key`, { headers: { 'apikey': SUPABASE_ANON_KEY } });
            const { publicKey } = await keyRes.json();

            // الاشتراك
            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicKey)
            });

            // الحفظ في Supabase
            await fetch(`${SUPABASE_FUNCTIONS_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
                body: JSON.stringify({ subscription: sub.toJSON(), domain: window.location.hostname })
            });

            localStorage.setItem('push_subscribed', 'true');
            console.log('✅ Subscribed successfully!');

        } catch (err) {
            console.error('❌ Push error:', err);
            // إذا فشل (مثلاً SW غير موجود)، نفتح صفحة الاشتراك كخيار بديل
            window.open('https://roba-nos.github.io/ul/public/subscribe.html?domain=' + window.location.hostname, 'SmartPush', 'width=420,height=520');
        }
    },

    urlBase64ToUint8Array(b64) {
        const pad = '='.repeat((4 - b64.length % 4) % 4);
        const base64 = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
        const raw = atob(base64);
        return Uint8Array.from([...raw].map(c => c.charCodeAt(0)));
    }
};

window.PushNotificationTool = PushNotificationTool;
PushNotificationTool.init();
