// ====================================================
// Smart Push SDK Pro - OneSignal Style (Anti-Redirect)
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
        
        if (!localStorage.getItem('push_subscribed')) {
            setTimeout(() => this.showSlidePrompt(), 2000);
        }
    },

    injectStyles() {
        const css = `
            .sp-prompt {
                position: fixed; top: -150px; left: 50%; transform: translateX(-50%);
                width: 90%; max-width: 450px; background: rgba(15, 23, 42, 0.95);
                backdrop-filter: blur(15px); border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px; padding: 20px; z-index: 9999999;
                display: flex; flex-direction: column; gap: 15px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                transition: top 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                font-family: 'Cairo', sans-serif; direction: rtl; text-align: right;
            }
            .sp-prompt.active { top: 20px; }
            .sp-modal-overlay {
                position: fixed; inset: 0; background: rgba(0,0,0,0.8);
                backdrop-filter: blur(5px); z-index: 99999999;
                display: none; justify-content: center; align-items: center; padding: 20px;
            }
            .sp-modal {
                background: #1e293b; width: 100%; max-width: 400px;
                border-radius: 24px; padding: 30px; border: 1px solid rgba(255,255,255,0.1);
                color: #fff; text-align: center; font-family: 'Cairo', sans-serif;
            }
            .sp-btn {
                padding: 10px 20px; border-radius: 12px; border: none; font-weight: 700;
                cursor: pointer; transition: 0.3s; font-family: inherit;
            }
            .sp-btn-allow { background: linear-gradient(135deg, #6366f1, #ec4899); color: #fff; }
            .sp-btn-deny { background: rgba(255,255,255,0.05); color: #94a3b8; }
        `;
        const style = document.createElement('style');
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);
    },

    showSlidePrompt() {
        if (document.getElementById('sp-prompt')) return;
        const prompt = document.createElement('div');
        prompt.className = 'sp-prompt';
        prompt.id = 'sp-prompt';
        prompt.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="font-size: 1.8rem;">🔔</div>
                <div>
                    <div style="color: #fff; font-weight: 700; font-size: 0.95rem;">${this.options.promptTitle}</div>
                    <div style="color: #94a3b8; font-size: 0.8rem; margin-top: 4px;">${this.options.promptMsg}</div>
                </div>
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button class="sp-btn sp-btn-deny" onclick="PushNotificationTool.closePrompt()">${this.options.denyText}</button>
                <button class="sp-btn sp-btn-allow" onclick="PushNotificationTool.handleAction()">${this.options.allowText}</button>
            </div>
        `;
        document.body.appendChild(prompt);
        setTimeout(() => prompt.classList.add('active'), 100);
    },

    closePrompt() {
        const p = document.getElementById('sp-prompt');
        if (p) { p.classList.remove('active'); setTimeout(() => p.remove(), 600); }
    },

    async handleAction() {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
        const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
        const isBlogger = window.location.hostname.includes('blogspot.com');
        const isUlSilver = window.location.hostname.includes('ulsilver.com');

        // إذا كان أيفون، بلوجر، أو موقع ulsilver (الذي يمنع تعديل sw.js)
        if ((isIOS && !isStandalone) || isBlogger || isUlSilver) {
            if (isBlogger || isUlSilver) {
                // فتح نافذة الاشتراك المنبثقة كجسر
                window.open('https://roba-nos.github.io/ul/public/subscribe.html?domain=' + window.location.hostname, 'SmartPush', 'width=420,height=520');
                this.closePrompt();
            } else {
                this.showIOSGuide();
            }
            return;
        }

        this.subscribeDirectly();
    },

    showIOSGuide() {
        this.closePrompt();
        const overlay = document.createElement('div');
        overlay.className = 'sp-modal-overlay';
        overlay.style.display = 'flex';
        overlay.id = 'sp-ios-modal';
        overlay.innerHTML = `
            <div class="sp-modal">
                <div style="font-size: 3.5rem; margin-bottom: 20px;">📲</div>
                <h3 style="margin-bottom: 15px;">خطوة واحدة للأيفون!</h3>
                <p style="font-size: 0.9rem; color: #94a3b8; margin-bottom: 25px; line-height: 1.6;">لتفعيل الإشعارات، آبل تطلب منك إضافة الموقع للشاشة الرئيسية أولاً:</p>
                <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 15px; text-align: right; margin-bottom: 20px;">
                    <p style="margin-bottom: 10px;">1️⃣ اضغط على زر <b>المشاركة (Share)</b> <img src="https://cdn-icons-png.flaticon.com/512/702/702132.png" width="18">.</p>
                    <p>2️⃣ اختر <b>"إضافة للشاشة الرئيسية"</b>.</p>
                </div>
                <button class="sp-btn sp-btn-deny" style="width: 100%" onclick="document.getElementById('sp-ios-modal').remove()">فهمت، سأفعل ذلك ✅</button>
            </div>
        `;
        document.body.appendChild(overlay);
    },

    async subscribeDirectly() {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                alert('⚠️ يجب الموافقة على طلب الإشعارات لكي تصلك التنبيهات.');
                return this.closePrompt();
            }

            this.closePrompt();
            
            let reg;
            try { reg = await navigator.serviceWorker.register('/sw.js'); } 
            catch (e) { reg = await navigator.serviceWorker.register('sw.js'); }
            
            const keyRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/vapid-key`, { headers: { 'apikey': SUPABASE_ANON_KEY } });
            const { publicKey } = await keyRes.json();

            const sub = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicKey)
            });

            // الحفظ في قاعدة البيانات
            const saveRes = await fetch(`${SUPABASE_FUNCTIONS_URL}/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
                body: JSON.stringify({ subscription: sub.toJSON(), domain: window.location.hostname })
            });

            if (saveRes.ok) {
                localStorage.setItem('push_subscribed', 'true');
                alert('✅ تم تفعيل الإشعارات بنجاح! ستظهر الآن في قائمة المشتركين.');
            } else {
                throw new Error('فشل الحفظ في قاعدة البيانات.');
            }

        } catch (err) {
            console.error('❌ Push Error Details:', err);
            alert('⚠️ حدث خطأ أثناء تفعيل الإشعارات: ' + err.message);
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
