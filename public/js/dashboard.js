// Configuration
const FUNCTIONS_URL = 'https://rtcnheqqzvvdbrdmpzsr.supabase.co/functions/v1';
const ANON_KEY = 'sb_publishable_urB1hflL5FDePpONRZ--EA_5b8jmxuz';
const HEADERS = { 'Content-Type': 'application/json', 'apikey': ANON_KEY };

// --- Theme Management ---
function toggleTheme() {
    const body = document.documentElement;
    const current = body.getAttribute('data-theme');
    const target = current === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', target);
    localStorage.setItem('dashboard_theme', target);
    updateThemeIcon(target);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('theme-icon');
    if (icon) icon.className = theme === 'light' ? 'fas fa-sun' : 'fas fa-moon';
}

// --- Shared Templates Data ---
const DEFAULT_TEMPLATES = [
    { id: 't1', faIcon: 'fab fa-instagram', title: 'جديدنا على إنستغرام!', body: 'تابعوا أحدث التنسيقات والمنتجات الجديدة على حسابنا.. ✨', icon: 'https://cdn-icons-png.flaticon.com/512/174/174855.png' },
    { id: 't2', faIcon: 'fab fa-tiktok', title: 'فيديو تيك توك جديد', body: 'شاهد الآن خلف الكواليس وتجهيز الطلبيات في فيديو جديد.. 🎬', icon: 'https://cdn4.iconfinder.com/data/icons/social-media-flat-7/64/Social-media_Tiktok-512.png' },
    { id: 't3', faIcon: 'fas fa-ring', title: 'خواتم فضة عيار 925', body: 'اكتشفوا تشكيلتنا الجديدة من الخواتم الفاخرة بأسعار منافسة.. 💎', icon: 'https://www.ulsilver.com/favicon.ico', url: 'https://www.ulsilver.com/collections/rings' },
    { id: 't4', faIcon: 'fas fa-gem', title: 'سلاسل مطلية بالذهب', body: 'أضيفي لمسة سحرية لإطلالتك مع مجموعتنا الفريدة.. ✨', icon: 'https://www.ulsilver.com/favicon.ico', url: 'https://www.ulsilver.com/collections/necklaces' },
    { id: 't7', faIcon: 'fas fa-kaaba', title: 'صيام يوم عرفة', body: 'ذكر فإن الذكرى تنفع المؤمنين.. لا تنسوا صيام يوم عرفة. 🤲', icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233630.png' },
    { id: 't8', faIcon: 'fas fa-heart', title: 'عيد الأم - هديتها عندنا', body: 'أمي هي جنتي.. عبر عن حبك لها بأجمل قطعة مجوهرات. ❤️', icon: 'https://cdn-icons-png.flaticon.com/512/10433/10433604.png' },
    { id: 't9', faIcon: 'fas fa-rose', title: 'عيد الحب - Valentine', body: 'عبر عن مشاعرك بهدية تدوم للأبد.. تشكيلة خاصة تنتظركم. 🌹', icon: 'https://cdn-icons-png.flaticon.com/512/833/833472.png' }
];

function getAllTemplates() {
    const custom = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    return [...DEFAULT_TEMPLATES, ...custom];
}

function saveCustomTemplate(template) {
    const custom = JSON.parse(localStorage.getItem('custom_templates') || '[]');
    template.id = 'c' + Date.now();
    custom.push(template);
    localStorage.setItem('custom_templates', JSON.stringify(custom));
    showToast('تم حفظ القالب بنجاح! ❤️');
}

// Apply theme on load
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('dashboard_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
});

// --- Notification System (Toast) ---
function showToast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}" style="color: ${type === 'success' ? '#22c55e' : '#ef4444'}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-20px)';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// --- Common Data Fetching ---
async function fetchStats() {
    // 1. محاولة جلب البيانات من الذاكرة السريعة أولاً (للسرعة الصاروخية)
    const cached = sessionStorage.getItem('stats_cache');
    if (cached) {
        const cachedData = JSON.parse(cached);
        console.log('🚀 Quick Load from Cache:', cachedData);
        // نحدث الواجهة فوراً بالبيانات المخزنة
        updateUI(cachedData);
    }

    try {
        const res = await fetch(`${FUNCTIONS_URL}/stats`, { headers: HEADERS });
        const data = await res.json();
        
        // 2. تحديث الذاكرة بالبيانات الجديدة
        sessionStorage.setItem('stats_cache', JSON.stringify(data));
        console.log('📊 Stats Updated in Background:', data);
        return data;
    } catch (e) {
        console.error('❌ Stats Fetch Error:', e);
        return cached ? JSON.parse(cached) : { total: 0, sites: {} };
    }
}

function updateUI(data) {
    const totalSubs = document.getElementById('total-subs');
    const totalSites = document.getElementById('total-sites');
    if (totalSubs) totalSubs.innerText = data.total || 0;
    if (totalSites) totalSites.innerText = Object.keys(data.sites || {}).length;
}

// --- Notification Sending ---
async function sendNotification(payload) {
    if (!payload.title || !payload.message) {
        showToast('يرجى ملء البيانات المطلوبة', 'error');
        return;
    }
    try {
        const res = await fetch(`${FUNCTIONS_URL}/send-notification`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        showToast(`تم الإرسال لـ ${result.count} مشترك بنجاح! ✨`);
        return result;
    } catch (e) {
        showToast('حدث خطأ أثناء الإرسال', 'error');
        throw e;
    }
}
