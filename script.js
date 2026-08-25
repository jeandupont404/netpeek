document.addEventListener('DOMContentLoaded', () => {
    fetchIP();
});

async function fetchIP() {
    const spinner = document.getElementById('spinner');
    const ipEl = document.getElementById('ip-address');

    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        const ip = ipData.ip;

        spinner.classList.add('hidden');
        ipEl.textContent = ip;

        document.getElementById('info-ip').textContent = ip;

        const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,regionName,city,zip,lat,lon,timezone,isp,org,as`);
        const geo = await geoRes.json();

        if (geo.status === 'success') {
            document.getElementById('info-location').textContent = `${geo.city}, ${geo.regionName}, ${geo.country}`;
            document.getElementById('info-isp').textContent = geo.isp;
            document.getElementById('info-timezone').textContent = geo.timezone;
            document.getElementById('info-coords').textContent = `${geo.lat}, ${geo.lon}`;
            document.getElementById('info-as').textContent = geo.as;
        }

    } catch (err) {
        spinner.classList.add('hidden');
        ipEl.textContent = 'Error fetching IP';
        console.error('IP fetch error:', err);
    }
}

// Affiliate click tracking
document.querySelectorAll('.affiliate-link').forEach(link => {
    link.addEventListener('click', function () {
        const vpn = this.dataset.vpn;
        console.log(`Affiliate click: ${vpn}`);
        // Optionnel : envoyer un event à Google Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'affiliate_click', {
                vpn_provider: vpn,
                page_url: window.location.href
            });
        }
    });
});

function copyIP() {
    const ip = document.getElementById('ip-address').textContent;
    const btn = document.getElementById('copy-btn');

    navigator.clipboard.writeText(ip).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy IP';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = ip;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = 'Copy IP';
            btn.classList.remove('copied');
        }, 2000);
    });
}
