// ============================================
// CONFIGURATION DES LIENS D'AFFILIATION
// Remplace les URLs ci-dessous par tes vrais liens
// ============================================

const AFFILIATE_CONFIG = {
    nordvpn: {
        name: "NordVPN",
        url: "https://nordvpn.com/pricing/?fid=TA",
        commission: "~$100/inscription"
    },
    surfshark: {
        name: "Surfshark",
        url: "https://surfshark.com/pricing?aff_id=TA",
        commission: "~$40/inscription"
    },
    expressvpn: {
        name: "ExpressVPN",
        url: "https://expressvpn.com/order?aff_id=TA",
        commission: "~$35/inscription"
    }
};

// Application automatique des liens
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.affiliate-link').forEach(link => {
        const vpn = link.dataset.vpn;
        if (AFFILIATE_CONFIG[vpn]) {
            link.href = AFFILIATE_CONFIG[vpn].url;
        }
    });
});
