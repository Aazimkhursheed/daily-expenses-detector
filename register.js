// Register JS
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('errorMsg');

    if (password !== confirmPassword) {
        errorMsg.textContent = "Passwords do not match";
        errorMsg.style.display = 'block';
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();

        if (res.ok) {
            // Success - Auto login
            // alert('Registration successful! Redirecting to dashboard...');
            if (data.role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            // Error
            errorMsg.textContent = data.message || 'Registration failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = 'Server error. Please try again.';
        errorMsg.style.display = 'block';
    }
});
