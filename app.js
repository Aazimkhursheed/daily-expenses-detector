class DesktopExpensesApp {
    constructor() {
        this.expenses = [];
        this.apiBase = "http://localhost:4000/api";
        this.currency = { symbol: "₹" };
        this.currentScreen = "dashboard";
        this.init();
    }

    async init() {
        await this.fetchExpenses();
        this.renderSidebar();
        this.renderMainContent();
        this.updateHeader();
    }

    /* ================= API CALLS ================= */

    async fetchExpenses() {
        const user = this.getUserInfo();
        if (!user) return;

        const res = await fetch(`${this.apiBase}/expenses/${user.id}`);
        this.expenses = await res.json();
    }

    async createExpense(data) {
        await fetch(`${this.apiBase}/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        await this.fetchExpenses();
        this.renderMainContent();
    }

    async deleteExpense(id) {
        if (!confirm("Delete expense?")) return;
        await fetch(`${this.apiBase}/expenses/${id}`, {
            method: "DELETE"
        });
        await this.fetchExpenses();
        this.renderMainContent();
    }

    /* ================= UI ================= */

    renderMainContent() {
        const main = document.getElementById("mainContent");
        main.innerHTML = `
            <h2>Dashboard</h2>
            <h3>Total: ${this.currency.symbol}${this.getTotalExpenses()}</h3>
            ${this.renderExpenses()}
        `;
    }

    renderExpenses() {
        return this.expenses.map(e => `
            <div class="expense-item">
                <span>${e.description}</span>
                <span>${this.currency.symbol}${e.amount}</span>
                <button onclick="app.deleteExpense('${e._id}')">Delete</button>
            </div>
        `).join("");
    }

    /* ================= ADD ================= */

    addExpense(amount, category, description, date) {
        const user = this.getUserInfo();
        this.createExpense({
            userId: user.id,
            amount,
            category,
            description,
            date
        });
    }

    /* ================= UTILS ================= */

    getTotalExpenses() {
        return this.expenses.reduce((a, e) => a + e.amount, 0);
    }

    getUserInfo() {
        return JSON.parse(localStorage.getItem("userAuth"));
    }

    logout() {
        localStorage.removeItem("userAuth");
        window.location.href = "login.html";
    }

    updateHeader() {
        const user = this.getUserInfo();
        if (user) {
            document.querySelector(".user-name").textContent = user.name || "User";
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    window.app = new DesktopExpensesApp();
});
