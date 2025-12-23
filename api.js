const API = {
  BASE_URL: "/api",

  /* ================= USER ================= */

  async getUser() {
    try {
      const res = await fetch(`${this.BASE_URL}/auth/me`, {
        credentials: "include"
      });
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      console.error("Error fetching user", err);
      return null;
    }
  },

  async login(credentials) {
    const res = await fetch(`${this.BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
      credentials: "include"
    });
    return await res.json();
  },

  async updateUser(data) {
    const res = await fetch(`${this.BASE_URL}/auth/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    return await res.json();
  },

  async logout() {
    await fetch(`${this.BASE_URL}/auth/logout`, {
      credentials: "include"
    });
  },

  /* ================= EXPENSES ================= */

  async getExpenses(userId) {
    const res = await fetch(`${this.BASE_URL}/expenses/${userId}`);
    return await res.json();
  },

  async addExpense(expense) {
    const res = await fetch(`${this.BASE_URL}/expenses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense)
    });
    return await res.json();
  },

  async deleteExpense(expenseId) {
    await fetch(`${this.BASE_URL}/expenses/${expenseId}`, {
      method: "DELETE"
    });
  },

  async clearExpenses(userId) {
    await fetch(`${this.BASE_URL}/expenses/clear/${userId}`, {
      method: "DELETE"
    });
  }
};

// Expose globally
window.API = API;
