document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchSiteData();
    const container = document.getElementById('catalog-container');
    
    if (container && data.categories && data.products) {
        let html = '';
        
        data.categories.forEach(cat => {
            // Find products for this category
            const catProducts = data.products.filter(p => p.categoryId === cat.id);
            
            html += `
                <div class="category-section" id="${cat.id}" style="margin-top: 50px;">
                    <h2 style="border-bottom: 2px solid #b71c1c; padding-bottom: 10px; margin-bottom: 20px;">${cat.name}</h2>
            `;
            
            if (catProducts.length > 0) {
                html += `<div class="category-grid">`;
                catProducts.forEach(prod => {
                    html += `
                        <div class="category-card" onclick="window.location.href='product.html?id=${prod.id}'">
                            <div class="cat-img">
                                <img src="${prod.image || 'images/placeholder-prod.png'}" alt="${prod.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
                            </div>
                            <div class="cat-info">
                                <h3>${prod.name}</h3>
                            </div>
                        </div>
                    `;
                });
                html += `</div>`;
            } else {
                html += `<p>No products currently available in this category.</p>`;
            }
            
            html += `</div>`;
        });
        
        container.innerHTML = html;
        
        // Scroll to category if hash exists in URL
        if(window.location.hash) {
            const el = document.querySelector(window.location.hash);
            if(el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }
});
