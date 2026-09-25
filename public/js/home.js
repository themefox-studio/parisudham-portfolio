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
            const fb = data.pageContent.facebookUrl || '#';
            const ig = data.pageContent.instagramUrl || '#';
            const tw = data.pageContent.twitterUrl || '#';
            const yt = data.pageContent.youtubeUrl || '#';
            const wa = data.pageContent.whatsappUrl || '#';
            
            let sHtml = `
                <a href="${fb}" target="_blank" class="social-icon" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
                <a href="${tw}" target="_blank" class="social-icon" aria-label="Twitter/X">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                </a>
                <a href="${yt}" target="_blank" class="social-icon" aria-label="YouTube">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"></polygon></svg>
                </a>
                <a href="${wa}" target="_blank" class="social-icon" aria-label="WhatsApp">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"></path></svg>
                </a>
            `;
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

