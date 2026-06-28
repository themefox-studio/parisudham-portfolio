const API_URL = '/api';

async function fetchSiteData() {
    return window.STATIC_DB || { categories: [], products: [], siteDetails: {} };
}

function updateFooter(siteDetails) {
    if (!siteDetails) return;
    const contactDiv = document.getElementById('footer-contact');
    if (contactDiv && siteDetails.contact) {
        contactDiv.innerHTML = `
            <h4>Contact Us</h4>
            <p>${siteDetails.contact.address}</p>
            <p>Ph: ${siteDetails.contact.phone1}, ${siteDetails.contact.phone2}</p>
            <p>Web: ${siteDetails.contact.website}</p>
        `;
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchSiteData();
    updateFooter(data.siteDetails);
});
