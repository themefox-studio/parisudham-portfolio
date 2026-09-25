document.addEventListener('DOMContentLoaded', () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 1000, // Super smooth duration
            easing: 'ease-out-cubic',
            once: false,    // Trigger animations every time you scroll up and down
            mirror: true,   // Animate elements out while scrolling past them
            offset: 100,    // Offset from original trigger point
        });
    }
});
const API_URL = '/api';

async function fetchSiteData() {
    try {
        const response = await fetch(`${API_URL}/data`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (error) {
        console.error("Error fetching data", error);
        return { categories: [], products: [], siteDetails: {} };
    }
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

    // Hamburger menu toggle logic
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navActions = document.querySelector('.nav-actions');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            if (navActions) navActions.classList.toggle('active');
        });
    }
});

