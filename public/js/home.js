document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchSiteData();
    
    if (data.pageContent) {
        const homeAboutText = document.getElementById('home-about-text');
        if(homeAboutText) homeAboutText.innerText = data.pageContent.homeAbout || '';
        
        const btn = document.getElementById('home-brochure-btn');
        if (data.pageContent.brochureUrl && btn) {
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
            revWidget.style.padding = '0';
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
                            <span class="badge-new">NEW</span>
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
                <div class="test-slide-content">
                    <p class="test-text">"${t.text}"</p>
                    <hr class="test-divider">
                    <div class="test-author-info">
                        <h4>${t.name}</h4>
                        <span>Kochi, Keralam</span>
                    </div>
                </div>
            </div>
        `).join('');

        new Swiper('.testimonial-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            speed: 800,
            navigation: { nextEl: '.test-next', prevEl: '.test-prev' },
            autoplay: { delay: 5000, disableOnInteraction: false }
        });

    } else if (testWrapper) {
        testWrapper.innerHTML = '<p>No testimonials yet.</p>';
    }

    // Number Counter Animation for Stats
    const statsSection = document.querySelector('.stats-strip');
    const statNums = document.querySelectorAll('.stat-num');

    if (statsSection && statNums.length > 0) {
        let started = false;

        const startCounting = () => {
            statNums.forEach(stat => {
                if (!stat.hasAttribute('data-target')) {
                    const text = stat.innerText.trim();
                    const target = parseInt(text.replace(/[^0-9]/g, '')) || 0;
                    const suffix = text.replace(/[0-9]/g, '').trim();
                    stat.setAttribute('data-target', target);
                    stat.setAttribute('data-suffix', suffix);
                    stat.innerText = '0' + suffix;
                }
                
                const target = parseInt(stat.getAttribute('data-target'));
                const suffix = stat.getAttribute('data-suffix');
                
                let current = 0;
                const duration = 2000;
                const frameRate = 30;
                const totalFrames = Math.round(duration / frameRate);
                const increment = target / totalFrames;

                const updateCount = () => {
                    current += increment;
                    if (current >= target) {
                        stat.innerText = target + suffix;
                    } else {
                        stat.innerText = Math.ceil(current) + suffix;
                        setTimeout(updateCount, frameRate);
                    }
                };
                
                updateCount();
            });
        };

        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !started) {
                started = true;
                startCounting();
            }
        }, { threshold: 0.4 });

        observer.observe(statsSection);
    }
});
