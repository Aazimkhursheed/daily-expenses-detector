class AdminPanel {
  constructor() {
    this.init();
  }

  async init() {
    // Check authentication
    const currentUser = await this.getCurrentUser();
    if (!currentUser || currentUser.role !== 'admin') {
      alert('Access Denied: Admins only');
      window.location.href = 'index.html';
      return;
    }

    this.loadUsers();
  }

  async getCurrentUser() {
    try {
      const response = await fetch('http://localhost:4000/api/auth/me');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.error('Auth check failed', e);
    }
    return null;
  }

  async loadUsers() {
    try {
      const usersRes = await fetch('http://localhost:4000/api/admin/users');
      const expensesRes = await fetch('http://localhost:4000/api/admin/expenses');

      const users = await usersRes.json();
      const expenses = await expensesRes.json();

      this.renderUsers(users);
      this.updateStats(users, expenses);
    } catch (e) {
      console.error('Failed to load data', e);
      alert('Failed to load admin data');
    }
  }

  renderUsers(users) {
    const tbody = document.getElementById('userTableBody');
    tbody.innerHTML = users.map(user => `
            <tr>
                <td>
                    <div style="font-weight: 500;">${user.name || 'No Name'}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">${user.phone || ''}</div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="badge badge-${user.role}">${user.role.toUpperCase()}</span>
                </td>
                <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                <td>
                    ${user.role !== 'admin' ? `
                    <button class="btn" style="padding: 4px 8px; font-size: 0.8rem; background: #e74c3c; color: white;" onclick="admin.deleteUser('${user._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                    ` : '<span style="font-size: 0.8rem; opacity: 0.5;">Protected</span>'}
                </td>
            </tr>
        `).join('');
  }

  updateStats(users, expenses) {
    document.getElementById('totalUsers').textContent = users.length;

    // Calculate total platform expenses
    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    document.getElementById('totalExpenses').textContent = '₹' + totalAmount.toLocaleString('en-IN');
  }

  async deleteUser(id) {
    if (confirm('Are you sure you want to delete this user? All their data will be lost.')) {
      try {
        await fetch(`http://localhost:4000/api/admin/users/${id}`, { method: 'DELETE' });
        this.loadUsers(); // Reload
      } catch (e) {
        alert('Failed to delete user');
      }
    }
  }

  async systemReset() {
    const code = prompt("WARNING: This will delete ALL users and ALL expenses (except admins). Type 'DELETE' to confirm:");
    if (code === 'DELETE') {
      try {
        const res = await fetch('http://localhost:4000/api/admin/reset', { method: 'DELETE' });
        const data = await res.json();
        alert(data.message);
        this.loadUsers();
      } catch (e) {
        alert('Reset failed');
      }
    }
  }
  async openProfileModal() {
    const user = await this.getCurrentUser();
    if (user) {
      document.getElementById('adminName').textContent = user.name || 'Admin';
      document.getElementById('adminEmail').textContent = user.email || 'admin@ded.com';
    }
    document.getElementById('profileModal').style.display = 'flex';
  }

  closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
  }

  async logout() {
    if (confirm('Logout from Admin Panel?')) {
      await fetch('http://localhost:4000/api/auth/logout');
      window.location.href = 'login.html';
    }
  }
}

const admin = new AdminPanel();
