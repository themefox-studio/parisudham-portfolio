document.addEventListener('DOMContentLoaded', async () => {
    const data = await fetchSiteData();
    const container = document.getElementById('product-detail-container');
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (container && data.products && productId) {
        const product = data.products.find(p => p.id === productId);
        
        if (product) {
            const category = data.categories.find(c => c.id === product.categoryId);
            const catName = category ? category.name : 'Unknown Category';
            
            let featuresHtml = '';
            if (product.features && product.features.length > 0) {
                featuresHtml = `
                    <h3>Features</h3>
                    <ul class="features-list">
                        ${product.features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                `;
            }
            
            container.innerHTML = `
                <a href="categories.html#${product.categoryId}" class="btn btn-outline" style="margin-bottom: 20px;">&larr; Back to Category</a>
                <div class="product-detail">
                    <div class="product-img">
                        <img src="${product.image || 'images/placeholder-prod.png'}" alt="${product.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9InNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5OTk5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4='">
                    </div>
                    <div class="product-info">
                        <span class="cat-badge">${catName}</span>
                        <h1>${product.name}</h1>
                        <p style="font-size: 1.1rem; color: #555; margin-bottom: 20px;">${product.description || 'No description available.'}</p>
                        ${featuresHtml}
                    </div>
                </div>
            `;
            document.title = `${product.name} | Parisudham`;
        } else {
            container.innerHTML = `<p>Product not found.</p>`;
        }
    } else if (container) {
        container.innerHTML = `<p>Invalid product ID.</p>`;
    }
});
