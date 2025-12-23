class LoginManager {
    constructor() {
        this.currentMethod = 'email';
        this.phoneNumber = '';
        this.resendTimeout = 60;
        this.isLoading = false;
        this.apiBase = "/api";

        this.init();
    }

    async init() {
        this.attachEventHandlers();
        await this.checkExistingAuth();
    }

    /* ================= AUTH CHECK ================= */

    async checkExistingAuth() {
        try {
            const res = await fetch(`${this.apiBase}/auth/me`, {
                credentials: "include"
            });
            if (res.ok) {
                const user = await res.json();
                this.redirectUser(user.role);
            }
        } catch (err) {
            // not logged in
        }
    }

    /* ================= EVENTS ================= */

    attachEventHandlers() {
        document.querySelectorAll('.method-btn').forEach(btn => {
            btn.addEventListener('click', e => {
                this.switchMethod(e.target.dataset.method);
            });
        });

        document.getElementById('phoneForm')?.addEventListener('submit', e => {
            e.preventDefault();
            this.sendOTP();
        });

        document.getElementById('verifyOtp')?.addEventListener('click', () => {
            this.verifyOTP();
        });

        document.getElementById("loginBtn")?.addEventListener("click", () => {
            this.handleEmailLogin();
        });

        document.getElementById('customGoogleBtn')?.addEventListener('click', () => {
            this.handleGoogleLogin();
        });

        document.getElementById('passwordToggle')?.addEventListener('click', () => {
            this.togglePasswordVisibility();
        });
    }

    togglePasswordVisibility() {
        const input = document.getElementById('password');
        const icon = document.querySelector('#passwordToggle i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    switchMethod(method) {
        this.currentMethod = method;
        document.querySelectorAll('.method-btn').forEach(btn =>
            btn.classList.toggle('active', btn.dataset.method === method)
        );
        document.querySelectorAll('.login-section').forEach(sec =>
            sec.classList.toggle('active', sec.id === method + 'Login')
        );
    }

    /* ================= EMAIL LOGIN ================= */
    async handleEmailLogin() {
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        if (!email || !password) {
            this.showError("Email and password required");
            return;
        }

        this.showLoading();

        try {
            const res = await fetch(`${this.apiBase}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include", // 🔥 REQUIRED
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();
            console.log(data);


            if (!res.ok || !data.success) {
                throw new Error(data.message || "Login failed");
            }

            this.showSuccess("Login successful");

            // 🔁 REDIRECT
            this.redirectUser(data.role);
        } catch (err) {
            this.showError(err.message || "Login failed");
        } finally {
            this.hideLoading();
        }
    }

    /* ================= GOOGLE LOGIN ================= */

    async handleGoogleLogin() {
        this.showLoading();
        try {
            const res = await fetch(`${this.apiBase}/auth/google`, {
                method: "POST",
                credentials: "include"
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            this.redirectUser(data.role);
        } catch {
            this.showError("Google login failed");
        }
        this.hideLoading();
    }

    /* ================= PHONE OTP ================= */

    async sendOTP() {
        const phone = document.getElementById('phoneNumber').value.trim();
        if (!/^[0-9]{10}$/.test(phone)) {
            return this.showError("Invalid phone number");
        }

        this.phoneNumber = phone;
        this.showLoading();

        try {
            const res = await fetch(`${this.apiBase}/auth/send-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone })
            });

            if (!res.ok) throw new Error("OTP send failed");
            document.getElementById('phoneStep').style.display = 'none';
            document.getElementById('otpStep').style.display = 'block';
        } catch {
            this.showError("Failed to send OTP");
        }
        this.hideLoading();
    }

    async verifyOTP() {
        const otp = Array.from(document.querySelectorAll('.otp-digit'))
            .map(i => i.value).join('');

        if (otp.length !== 6) return this.showError("Invalid OTP");

        this.showLoading();
        try {
            const res = await fetch(`${this.apiBase}/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ phone: this.phoneNumber, otp })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message);

            this.redirectUser(data.role);
        } catch {
            this.showError("OTP verification failed");
        }
        this.hideLoading();
    }

    /* ================= REDIRECT ================= */

    redirectUser(role) {
        setTimeout(() => {
            if (role === "admin") {
                window.location.href = "admin.html";
            } else {
                window.location.href = "index.html";
            }
        }, 800);
    }

    /* ================= UI HELPERS ================= */

    showLoading() {
        this.isLoading = true;
        document.getElementById('loadingSpinner')?.style.setProperty('display', 'block');
    }

    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingSpinner')?.style.setProperty('display', 'none');
    }

    showError(msg) {
        const el = document.getElementById('errorMessage');
        if (el) {
            el.querySelector('.error-text').textContent = msg;
            el.style.display = 'flex';
        }
    }

    showSuccess(msg) {
        const el = document.getElementById('successMessage');
        if (el) {
            el.querySelector('.success-text').textContent = msg;
            el.style.display = 'flex';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});
