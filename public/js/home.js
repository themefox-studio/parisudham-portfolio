document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchSiteData();
    
    if (data.pageContent) {
        document.getElementById('home-about-text').innerText = data.pageContent.homeAbout || '';
        
        if (data.pageContent.brochureUrl) {
            const btn = document.getElementById('home-brochure-btn');
            btn.href = data.pageContent.brochureUrl;
            btn.style.display = 'inline-block';
        }

        const socialContainer = document.getElementById('social-links');
        if (socialContainer) {
            let sHtml = '';
            if (data.pageContent.facebookUrl) sHtml += `<a href="${data.pageContent.facebookUrl}" target="_blank" style="color:#fbc02d; font-weight:bold;">Facebook</a>`;
            if (data.pageContent.instagramUrl) sHtml += `<a href="${data.pageContent.instagramUrl}" target="_blank" style="color:#fbc02d; font-weight:bold;">Instagram</a>`;
            socialContainer.innerHTML = sHtml;
        }

        const revWidget = document.getElementById('google-review-widget-html');
        if (revWidget && data.pageContent.googleReviewHtml) {
            revWidget.innerHTML = data.pageContent.googleReviewHtml;
            revWidget.style.padding = '0'; // Let widget control padding
            revWidget.style.background = 'transparent';
            revWidget.style.boxShadow = 'none';
        } else if (revWidget) {
            revWidget.innerHTML = '<p style="color:#777; font-style:italic;">No reviews configured yet.</p>';
        }
    }

    // New Arrivals
    const naWrapper = document.getElementById('new-arrivals-wrapper');
    if (naWrapper && data.products) {
        const newArrivals = data.products.filter(p => p.isNewArrival).sort((a,b) => (a.order||0) - (b.order||0));
        
        if(newArrivals.length > 0) {
            naWrapper.innerHTML = newArrivals.map(prod => `
                <div class="swiper-slide">
                    <div class="category-card" onclick="window.location.href='product.html?id=${prod.id}'">
                        <div class="cat-img" style="position:relative;">
                            <span style="position:absolute; top:10px; right:10px; background:#b71c1c; color:#fff; padding:4px 10px; border-radius:20px; font-size:0.8rem; font-weight:bold; z-index:10;">NEW</span>
                            <img src="${prod.image || 'images/placeholder-prod.png'}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <div class="cat-info">
                            <h3>${prod.name}</h3>
                        </div>
                    </div>
                </div>
            `).join('');
            
            new Swiper('.product-swiper', {
                slidesPerView: 1,
                spaceBetween: 20,
                navigation: { nextEl: '.product-next', prevEl: '.product-prev' },
                pagination: { el: '.product-pagination', clickable: true },
                breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 4 } }
            });
        } else {
            naWrapper.innerHTML = '<p>No new arrivals yet.</p>';
        }
    }

    // Categories Slider
    const catWrapper = document.getElementById('categories-wrapper');
    if (catWrapper && data.categories) {
        const sortedCats = [...data.categories].sort((a,b) => (a.order||0) - (b.order||0));
        catWrapper.innerHTML = sortedCats.map(cat => `
            <div class="swiper-slide">
                <div class="category-card" onclick="window.location.href='categories.html#${cat.id}'">
                    <div class="cat-img">
                        <img src="${cat.image || 'images/placeholder-cat.png'}">
                    </div>
                    <div class="cat-info">
                        <h3>${cat.name}</h3>
                    </div>
                </div>
            </div>
        `).join('');

        new Swiper('.category-swiper', {
            slidesPerView: 2,
            spaceBetween: 20,
            pagination: { el: '.cat-pagination', clickable: true },
            breakpoints: { 768: { slidesPerView: 4 }, 1024: { slidesPerView: 5 } }
        });
    }

    // Testimonials
    const testWrapper = document.getElementById('testimonials-wrapper');
    if (testWrapper && data.testimonials && data.testimonials.length > 0) {
        testWrapper.innerHTML = data.testimonials.map(t => `
            <div class="swiper-slide">
                <div style="background: rgba(255,255,255,0.1); padding: 30px; border-radius: 8px; max-width: 600px; margin: 0 auto;">
                    <div style="color:#fbc02d; font-size:1.5rem; margin-bottom:10px;">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
                    <p style="font-size:1.2rem; font-style:italic; margin-bottom:20px;">"${t.text}"</p>
                    <h4 style="color:#fff;">- ${t.name}</h4>
                </div>
            </div>
        `).join('');

        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            pagination: { el: '.test-pagination', clickable: true },
            autoplay: { delay: 5000 }
        });
    } else if (testWrapper) {
        testWrapper.innerHTML = '<p>No testimonials yet.</p>';
    }
});
