let siteData = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Check Auth
    try {
        const authRes = await fetch('/api/check-auth');
        const authData = await authRes.json();
        if (!authData.authenticated) {
            window.location.href = 'login.html';
            return;
        }
        currentUser = authData.user;
        if (currentUser.role === 'admin') {
            document.getElementById('users-menu-item').style.display = 'block';
        }
    } catch (e) {
        window.location.href = 'login.html';
        return;
    }

    // 2. Load Data
    await loadData();
});

async function logout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.href = 'login.html';
}

async function loadData() {
    try {
        const res = await fetch('/api/data');
        siteData = await res.json();
        
        // Also fetch users if admin
        if (currentUser.role === 'admin') {
            const uRes = await fetch('/api/admin/users');
            if (uRes.ok) siteData.users = await uRes.json();
        }

        renderProductsTable();
        renderCategoriesTable();
        renderTestimonialsTable();
        populatePageContentForm();
        if(currentUser.role === 'admin') renderUsersTable();

    } catch (e) {
        console.error("Error loading data", e);
    }
}

async function saveAllDataToServer() {
    try {
        const res = await fetch('/api/admin/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(siteData)
        });
        if (!res.ok) throw new Error("Save failed");
        await loadData();
    } catch (err) {
        console.error("Save failed", err);
        alert("Failed to save data.");
    }
}

function switchTab(tabId, linkElem) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    
    document.querySelectorAll('.tab-link').forEach(el => el.classList.remove('active'));
    linkElem.classList.add('active');
}

function openModal(htmlContent) {
    document.getElementById('modal-content-area').innerHTML = htmlContent;
    document.getElementById('generic-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('generic-modal').style.display = 'none';
}

async function uploadFile(fileInputId) {
    const fileInput = document.getElementById(fileInputId);
    if (!fileInput || fileInput.files.length === 0) return null;
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    
    const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData
    });
    const data = await res.json();
    return data.url || null;
}

// ================= PRODUCTS =================
function renderProductsTable() {
    const tbody = document.querySelector('#products-table tbody');
    tbody.innerHTML = '';
    
    // Sort by order
    const sorted = [...(siteData.products || [])].sort((a,b) => (a.order||0) - (b.order||0));

    sorted.forEach(prod => {
        const cat = (siteData.categories||[]).find(c => c.id === prod.categoryId);
        const catName = cat ? cat.name : 'Unknown';
        
        tbody.innerHTML += `
            <tr>
                <td>${prod.order || 0}</td>
                <td><img src="${prod.image || 'images/placeholder-prod.png'}" style="width:50px; height:50px; object-fit:cover;"></td>
                <td>${prod.name}</td>
                <td>${catName}</td>
                <td>${prod.isNewArrival ? 'Yes' : 'No'}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size:0.8rem" onclick="editProduct('${prod.id}')">Edit</button>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size:0.8rem; background-color: #d32f2f; border-color: #d32f2f" onclick="deleteProduct('${prod.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

function openProductModal(id = null) {
    let prod = { id: '', name: '', categoryId: '', description: '', features: [], image: '', isNewArrival: false, order: 0 };
    if (id) prod = siteData.products.find(p => p.id === id);

    const catOptions = (siteData.categories||[]).map(c => `<option value="${c.id}" ${prod.categoryId===c.id?'selected':''}>${c.name}</option>`).join('');

    const html = `
        <h3>${id ? 'Edit' : 'Add'} Product</h3>
        <form onsubmit="saveProduct(event, '${id || ''}')">
            <div class="form-group"><label>Name</label><input type="text" id="p-name" value="${prod.name}" required></div>
            <div class="form-group"><label>Category</label><select id="p-cat" required>${catOptions}</select></div>
            <div class="form-group"><label>Order (Display Priority)</label><input type="number" id="p-order" value="${prod.order}"></div>
            <div class="form-group"><label>Description</label><textarea id="p-desc">${prod.description||''}</textarea></div>
            <div class="form-group"><label>Features (comma separated)</label><input type="text" id="p-feat" value="${(prod.features||[]).join(', ')}"></div>
            <div class="form-group">
                <label><input type="checkbox" id="p-new" ${prod.isNewArrival ? 'checked' : ''}> Mark as New Arrival</label>
            </div>
            <div class="form-group"><label>Image Upload</label><input type="file" id="p-file" accept="image/*"></div>
            <div class="form-group"><label>Or Image URL</label><input type="text" id="p-url" value="${prod.image||''}"></div>
            
            <div style="margin-top: 20px; display:flex; justify-content:space-between;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
    openModal(html);
}

const editProduct = (id) => openProductModal(id);

async function saveProduct(e, id) {
    e.preventDefault();
    let imageUrl = document.getElementById('p-url').value;
    const uploadedUrl = await uploadFile('p-file');
    if (uploadedUrl) imageUrl = uploadedUrl;

    const newProd = {
        id: id || 'prod-' + Date.now(),
        name: document.getElementById('p-name').value,
        categoryId: document.getElementById('p-cat').value,
        order: parseInt(document.getElementById('p-order').value) || 0,
        description: document.getElementById('p-desc').value,
        features: document.getElementById('p-feat').value.split(',').map(s=>s.trim()).filter(s=>s),
        isNewArrival: document.getElementById('p-new').checked,
        image: imageUrl
    };

    if (id) {
        const idx = siteData.products.findIndex(p => p.id === id);
        if(idx !== -1) siteData.products[idx] = newProd;
    } else {
        siteData.products.push(newProd);
    }
    
    closeModal();
    await saveAllDataToServer();
}

function deleteProduct(id) {
    if(confirm("Delete this product?")) {
        siteData.products = siteData.products.filter(p => p.id !== id);
        saveAllDataToServer();
    }
}

// ================= CATEGORIES =================
function renderCategoriesTable() {
    const tbody = document.querySelector('#categories-table tbody');
    tbody.innerHTML = '';
    const sorted = [...(siteData.categories || [])].sort((a,b) => (a.order||0) - (b.order||0));

    sorted.forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td>${cat.order || 0}</td>
                <td><img src="${cat.image || 'images/placeholder-cat.png'}" style="width:50px; height:50px; object-fit:cover;"></td>
                <td>${cat.name}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size:0.8rem" onclick="editCategory('${cat.id}')">Edit</button>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size:0.8rem; background-color: #d32f2f; border-color: #d32f2f" onclick="deleteCategory('${cat.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

function openCategoryModal(id = null) {
    let cat = { id: '', name: '', image: '', order: 0 };
    if (id) cat = siteData.categories.find(c => c.id === id);

    const html = `
        <h3>${id ? 'Edit' : 'Add'} Category</h3>
        <form onsubmit="saveCategory(event, '${id || ''}')">
            <div class="form-group"><label>Name</label><input type="text" id="c-name" value="${cat.name}" required></div>
            <div class="form-group"><label>Order ID (for sorting)</label><input type="text" id="c-id-input" value="${cat.id}" ${id?'disabled':''} required></div>
            <div class="form-group"><label>Order (Display Priority)</label><input type="number" id="c-order" value="${cat.order}"></div>
            <div class="form-group"><label>Image Upload</label><input type="file" id="c-file" accept="image/*"></div>
            <div class="form-group"><label>Or Image URL</label><input type="text" id="c-url" value="${cat.image||''}"></div>
            
            <div style="margin-top: 20px; display:flex; justify-content:space-between;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
    openModal(html);
}

const editCategory = (id) => openCategoryModal(id);

async function saveCategory(e, id) {
    e.preventDefault();
    let imageUrl = document.getElementById('c-url').value;
    const uploadedUrl = await uploadFile('c-file');
    if (uploadedUrl) imageUrl = uploadedUrl;

    const newCat = {
        id: id || document.getElementById('c-id-input').value.toLowerCase().replace(/\\s+/g, '-'),
        name: document.getElementById('c-name').value,
        order: parseInt(document.getElementById('c-order').value) || 0,
        image: imageUrl
    };

    if (id) {
        const idx = siteData.categories.findIndex(c => c.id === id);
        if(idx !== -1) siteData.categories[idx] = newCat;
    } else {
        siteData.categories.push(newCat);
    }
    
    closeModal();
    await saveAllDataToServer();
}

function deleteCategory(id) {
    if(confirm("Delete this category? Products within it may lose their category link.")) {
        siteData.categories = siteData.categories.filter(c => c.id !== id);
        saveAllDataToServer();
    }
}


// ================= TESTIMONIALS =================
function renderTestimonialsTable() {
    const tbody = document.querySelector('#testimonials-table tbody');
    tbody.innerHTML = '';
    
    (siteData.testimonials || []).forEach(t => {
        tbody.innerHTML += `
            <tr>
                <td>${t.name}</td>
                <td>${t.rating}/5</td>
                <td>${t.text.substring(0, 50)}...</td>
                <td>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size:0.8rem" onclick="editTestimonial('${t.id}')">Edit</button>
                    <button class="btn btn-primary" style="padding: 5px 10px; font-size:0.8rem; background-color: #d32f2f; border-color: #d32f2f" onclick="deleteTestimonial('${t.id}')">Delete</button>
                </td>
            </tr>
        `;
    });
}

function openTestimonialModal(id = null) {
    let t = { id: '', name: '', text: '', rating: 5, image: '' };
    if (id) t = siteData.testimonials.find(x => x.id === id);

    const html = `
        <h3>${id ? 'Edit' : 'Add'} Testimonial</h3>
        <form onsubmit="saveTestimonial(event, '${id || ''}')">
            <div class="form-group"><label>Customer Name</label><input type="text" id="t-name" value="${t.name}" required></div>
            <div class="form-group"><label>Rating (1-5)</label><input type="number" min="1" max="5" id="t-rating" value="${t.rating}" required></div>
            <div class="form-group"><label>Review Text</label><textarea id="t-text" rows="3" required>${t.text}</textarea></div>
            <div style="margin-top: 20px; display:flex; justify-content:space-between;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
    openModal(html);
}

const editTestimonial = (id) => openTestimonialModal(id);

async function saveTestimonial(e, id) {
    e.preventDefault();
    const newT = {
        id: id || 'test-' + Date.now(),
        name: document.getElementById('t-name').value,
        rating: parseInt(document.getElementById('t-rating').value) || 5,
        text: document.getElementById('t-text').value,
        image: ''
    };

    if (id) {
        const idx = siteData.testimonials.findIndex(x => x.id === id);
        if(idx !== -1) siteData.testimonials[idx] = newT;
    } else {
        if(!siteData.testimonials) siteData.testimonials = [];
        siteData.testimonials.push(newT);
    }
    closeModal();
    await saveAllDataToServer();
}

function deleteTestimonial(id) {
    if(confirm("Delete this testimonial?")) {
        siteData.testimonials = siteData.testimonials.filter(x => x.id !== id);
        saveAllDataToServer();
    }
}


// ================= PAGE CONTENT =================
function populatePageContentForm() {
    const pc = siteData.pageContent || {};
    document.getElementById('pc-about').value = pc.homeAbout || '';
    document.getElementById('pc-brochure').value = pc.brochureUrl || '';
    document.getElementById('pc-facebook').value = pc.facebookUrl || '';
    document.getElementById('pc-instagram').value = pc.instagramUrl || '';
    document.getElementById('pc-google-review').value = pc.googleReviewHtml || '';
}

async function savePageContent(e) {
    e.preventDefault();
    
    let brochureUrl = document.getElementById('pc-brochure').value;
    const uploadedUrl = await uploadFile('pc-brochure-file');
    if (uploadedUrl) brochureUrl = uploadedUrl;

    siteData.pageContent = {
        homeAbout: document.getElementById('pc-about').value,
        brochureUrl: brochureUrl,
        facebookUrl: document.getElementById('pc-facebook').value,
        instagramUrl: document.getElementById('pc-instagram').value,
        googleReviewHtml: document.getElementById('pc-google-review').value
    };

    await saveAllDataToServer();
    alert("Page content saved successfully!");
    document.getElementById('pc-brochure').value = brochureUrl;
}

// ================= USERS =================
function renderUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    
    (siteData.users || []).forEach(u => {
        tbody.innerHTML += `
            <tr>
                <td>${u.username}</td>
                <td>${u.role}</td>
                <td>
                    <button class="btn btn-outline" style="padding: 5px 10px; font-size:0.8rem" onclick="editUser('${u.id}')">Edit / Change Password</button>
                    ${u.username !== 'admin' ? `<button class="btn btn-primary" style="padding: 5px 10px; font-size:0.8rem; background-color: #d32f2f; border-color: #d32f2f" onclick="deleteUser('${u.id}')">Delete</button>` : ''}
                </td>
            </tr>
        `;
    });
}

function openUserModal(id = null) {
    let u = { id: '', username: '', role: 'manager' };
    if (id) u = siteData.users.find(x => x.id === id);

    const html = `
        <h3>${id ? 'Edit' : 'Add'} User</h3>
        <form onsubmit="saveUser(event, '${id || ''}')">
            <div class="form-group"><label>Username</label><input type="text" id="u-username" value="${u.username}" ${id==='admin-1'?'disabled':''} required></div>
            <div class="form-group"><label>Role</label>
                <select id="u-role" ${id==='admin-1'?'disabled':''}>
                    <option value="manager" ${u.role==='manager'?'selected':''}>Website Manager</option>
                    <option value="admin" ${u.role==='admin'?'selected':''}>Admin</option>
                </select>
            </div>
            <div class="form-group"><label>${id?'New Password (leave blank to keep current)':'Password'}</label><input type="password" id="u-pass" ${!id?'required':''}></div>
            <div style="margin-top: 20px; display:flex; justify-content:space-between;">
                <button type="button" class="btn btn-outline" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
    openModal(html);
}

const editUser = (id) => openUserModal(id);

async function saveUser(e, id) {
    e.preventDefault();
    const newU = {
        id: id || 'user-' + Date.now(),
        username: document.getElementById('u-username').value,
        role: document.getElementById('u-role').value
    };
    
    const pass = document.getElementById('u-pass').value;
    if (pass) newU.newPassword = pass;

    if (id) {
        const idx = siteData.users.findIndex(x => x.id === id);
        // Preserve username and role for master admin if attempted to change
        if(id === 'admin-1') {
            newU.username = 'admin';
            newU.role = 'admin';
        }
        if(idx !== -1) siteData.users[idx] = { ...siteData.users[idx], ...newU };
    } else {
        if(!siteData.users) siteData.users = [];
        siteData.users.push(newU);
    }
    closeModal();
    await saveAllDataToServer();
}

function deleteUser(id) {
    if(id === 'admin-1') return alert("Cannot delete primary admin.");
    if(confirm("Delete this user?")) {
        siteData.users = siteData.users.filter(x => x.id !== id);
        saveAllDataToServer();
    }
}
