document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');
    
    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await res.json();
        if (res.ok && data.success) {
            window.location.href = 'admin.html';
        } else {
            errorMsg.innerText = data.error || 'Login failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.innerText = 'Server error';
        errorMsg.style.display = 'block';
    }
});
