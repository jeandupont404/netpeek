const ADSENSE_CLIENT = 'ca-pub-5983443345513035';
const ADSENSE_SRC = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + ADSENSE_CLIENT;

document.addEventListener('DOMContentLoaded', () => {
    initCookieConsent();
    fetchIP();
    initAffiliateTracking();
});

async function fetchIP() {
    const spinner = document.getElementById('spinner');
    const ipEl = document.getElementById('ip-address');

    if (!spinner || !ipEl) return;

    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;

        spinner.classList.add('hidden');
        ipEl.textContent = ip;

        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined && val !== null && val !== '') el.textContent = val;
        };

        set('info-ip', ip);

        try {
            const geoRes = await fetch(`https://ipwho.is/${ip}`);
            const geo = await geoRes.json();

            if (geo.success) {
                const loc = [geo.city, geo.region, geo.country].filter(Boolean).join(', ');
                set('info-location', loc);
                set('info-isp', geo.connection && (geo.connection.isp || geo.connection.organisation));
                set('info-timezone', geo.timezone && (geo.timezone.id || geo.timezone.utc));
                set('info-coords', `${geo.latitude}, ${geo.longitude}`);
                set('info-as', (geo.connection && geo.connection.asn) ? `AS${geo.connection.asn}` : '-');
            }
        } catch (geoErr) {
            console.error('Geolocation error:', geoErr);
        }

    } catch (err) {
        spinner.classList.add('hidden');
        ipEl.textContent = 'Error fetching IP';
        console.error('IP fetch error:', err);
    }
}

function copyIP() {
    const ip = document.getElementById('ip-address');
    const btn = document.getElementById('copy-btn');
    if (!ip) return;

    const text = ip.textContent;

    const done = () => {
        if (btn) {
            btn.textContent = 'Copied!';
            btn.classList.add('copied');
            setTimeout(() => {
                btn.textContent = 'Copy IP';
                btn.classList.remove('copied');
            }, 2000);
        }
    };

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else {
        fallbackCopy(text, done);
    }
}

function fallbackCopy(text, done) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    done();
}

/* ---------- Password Generator ---------- */
function generatePassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[array[i] % chars.length];
    }
    return password;
}

function generateAndShowPassword() {
    const out = document.getElementById('password-output');
    const btn = document.getElementById('password-btn');
    if (!out) return;

    const password = generatePassword(16);
    out.textContent = password;

    navigator.clipboard.writeText(password).catch(() => {});
    if (btn) {
        const original = btn.textContent;
        btn.textContent = 'Copied to clipboard!';
        setTimeout(() => { btn.textContent = original; }, 2000);
    }
}

/* ---------- DNS Lookup (Google DNS-over-HTTPS) ---------- */
async function performDNSLookup() {
    const input = document.getElementById('dns-domain');
    const results = document.getElementById('dns-results');
    const btn = document.getElementById('dns-btn');
    if (!input || !results) return;

    const domain = input.value.trim();
    if (!domain) return;

    if (btn) { btn.disabled = true; btn.textContent = 'Looking up...'; }
    results.textContent = '';

    try {
        const types = ['A', 'AAAA', 'CNAME', 'MX', 'NS', 'TXT'];
        let html = '';
        let anyFound = false;

        for (const type of types) {
            const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`);
            const data = await res.json();

            if (data.Status === 0 && data.Answer && data.Answer.length) {
                anyFound = true;
                const values = data.Answer.map(r => escapeHtml(r.data)).join('<br>');
                html += `<div class="dns-type"><strong>${type}</strong></div><div class="dns-value">${values}</div>`;
            }
        }

        results.innerHTML = anyFound
            ? html
            : '<p>No DNS records found for this domain.</p>';
    } catch (err) {
        console.error('DNS lookup error:', err);
        results.textContent = 'Error performing DNS lookup.';
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Lookup DNS'; }
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ---------- Latency Test ---------- */
async function testLatency() {
    const input = document.getElementById('latency-url');
    const results = document.getElementById('latency-results');
    const btn = document.getElementById('latency-btn');
    if (!input || !results) return;

    let url = input.value.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

    if (btn) { btn.disabled = true; btn.textContent = 'Testing...'; }
    results.textContent = '';

    const start = Date.now();
    try {
        const res = await fetch(url, { mode: 'no-cors', cache: 'no-store' });
        const ms = Date.now() - start;
        const ok = res.type === 'opaque' ? true : res.ok;
        results.innerHTML = ok
            ? `Server reachable. Round-trip time: <strong>${ms} ms</strong>`
            : `Server responded with HTTP ${res.status}. RTT: <strong>${ms} ms</strong>`;
    } catch (err) {
        console.error('Latency test error:', err);
        results.textContent = 'Could not reach the target server.';
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Test Latency'; }
    }
}

/* ---------- Affiliate click tracking ---------- */
function initAffiliateTracking() {
    document.querySelectorAll('a.vpn-card').forEach(link => {
        link.addEventListener('click', function () {
            const vpn = this.dataset.affiliate;
            console.log(`Affiliate click: ${vpn}`);
            if (typeof gtag !== 'undefined') {
                gtag('event', 'affiliate_click', {
                    vpn_provider: vpn,
                    page_url: window.location.href
                });
            }
        });
    });
}

/* ---------- Cookie consent (RGPD / GDPR) ---------- */
const COOKIE_CONSENT_KEY = 'netpeek_cookie_consent';

function getCookieConsent() {
    try {
        const val = localStorage.getItem(COOKIE_CONSENT_KEY);
        return val === 'accepted' ? 'accepted' : val === 'declined' ? 'declined' : null;
    } catch (e) {
        return null;
    }
}

function setCookieConsent(value) {
    try {
        localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch (e) {
        document.cookie = COOKIE_CONSENT_KEY + '=' + value + ';max-age=31536000;path=/';
    }
}

function loadAdSense() {
    if (document.querySelector('script[data-adsense="consent"]')) return;
    const s = document.createElement('script');
    s.async = true;
    s.src = ADSENSE_SRC;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-adsense', 'consent');
    document.head.appendChild(s);
}

function initCookieConsent() {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;

    const consent = getCookieConsent();
    if (consent === 'accepted') {
        loadAdSense();
        return;
    }
    if (consent === 'declined') {
        return;
    }

    banner.classList.add('visible');

    const acceptBtn = document.getElementById('cookie-accept');
    const declineBtn = document.getElementById('cookie-decline');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            setCookieConsent('accepted');
            banner.classList.remove('visible');
            loadAdSense();
        });
    }
    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            setCookieConsent('declined');
            banner.classList.remove('visible');
        });
    }
}
