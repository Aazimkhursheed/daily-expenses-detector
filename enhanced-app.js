// Enhanced Daily Expenses Detector with All Features
class EnhancedExpensesApp {
    constructor() {
        this.expenses = []; // Initialize empty, load async
        this.currentSection = 'dashboard';
        this.isRecording = false;
        this.recognition = null;
        this.charts = [];
        this.currentUser = null;

        // Indian Rupee formatting
        this.currency = {
            symbol: '₹',
            code: 'INR'
        };

        // Categories with Indian context
        this.categories = [
            { name: 'Food', color: '#FF6B6B', icon: '🍽️' },
            { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
            { name: 'Bills', color: '#45B7D1', icon: '📄' },
            { name: 'Shopping', color: '#96CEB4', icon: '🛍️' },
            { name: 'Entertainment', color: '#FECA57', icon: '🎬' },
            { name: 'Healthcare', color: '#FF9FF3', icon: '⚕️' },
            { name: 'Education', color: '#54A0FF', icon: '📚' },
            { name: 'Travel', color: '#5F27CD', icon: '✈️' }
        ];

        // Updated quick actions with your specified amounts
        this.quickActions = [
            { name: 'Tea/Coffee', category: 'Food', amount: 20, icon: '☕' },
            { name: 'Lunch', category: 'Food', amount: 120, icon: '🍽️' },
            { name: 'Auto', category: 'Transportation', amount: 80, icon: '🛺' },
            { name: 'Petrol', category: 'Transportation', amount: 1500, icon: '⛽' },
            { name: 'Groceries', category: 'Shopping', amount: 500, icon: '🛒' },
            { name: 'Movie', category: 'Entertainment', amount: 300, icon: '🎬' }
        ];

        // NLP Keywords associated (kept mostly same)
        this.nlpKeywords = {
            'Food': ['restaurant', 'food', 'lunch', 'dinner', 'breakfast', 'chai', 'tea', 'coffee', 'meal', 'snack', 'dosa', 'biryani', 'pizza', 'burger', 'swiggy', 'zomato', 'dhaba'],
            'Transportation': ['uber', 'ola', 'taxi', 'auto', 'bus', 'train', 'metro', 'petrol', 'diesel', 'fuel', 'cab', 'rickshaw', 'flight', 'bike'],
            'Bills': ['electricity', 'water', 'gas', 'internet', 'wifi', 'mobile', 'phone', 'rent', 'bill', 'jio', 'airtel', 'bsnl'],
            'Shopping': ['shopping', 'clothes', 'shirt', 'shoes', 'mall', 'store', 'amazon', 'flipkart', 'myntra', 'grocery', 'vegetables'],
            'Entertainment': ['movie', 'cinema', 'pvr', 'inox', 'netflix', 'amazon prime', 'hotstar', 'game', 'party', 'club'],
            'Healthcare': ['doctor', 'hospital', 'medicine', 'pharmacy', 'apollo', 'fortis', 'medical', 'health', 'checkup'],
            'Education': ['fees', 'books', 'course', 'coaching', 'exam', 'school', 'college', 'university'],
            'Travel': ['hotel', 'booking', 'oyo', 'trip', 'vacation', 'travel', 'tour', 'holiday']
        };

        this.init();
    }

    async init() {
        const user = await API.getUser();
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        this.currentUser = user;
        this.updateUserName(user);

        await this.refreshExpenses(); // Load expenses from server

        this.attachEventHandlers();
        this.renderCurrentSection();
        this.initSpeechRecognition();
    }

    async refreshExpenses() {
        try {
            if (this.currentUser && this.currentUser._id) {
                const data = await API.getExpenses(this.currentUser._id);
                if (Array.isArray(data)) {
                    this.expenses = data;
                }
            }
        } catch (e) {
            console.error("Failed to load expenses", e);
        }
    }

    updateUserName(user) {
        if (user) {
            // const userName = user.name || user.email || 'User';
            // const el = document.getElementById('userName');
            // if (el) el.textContent = userName;

            // Show admin link if role is admin
            if (user.role === 'admin') {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar) {
                    const adminLink = document.createElement('a');
                    adminLink.href = 'admin.html';
                    adminLink.className = 'nav-item';
                    adminLink.innerHTML = '<i class="fas fa-user-shield"></i> Admin Panel';
                    adminLink.style.color = '#e74c3c';

                    // Insert before logout or append
                    sidebar.insertBefore(adminLink, sidebar.lastElementChild);
                }
            }
        }
    }


    attachEventHandlers() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clearModal') {
                this.closeClearModal();
            }
        });
    }

    switchSection(section) {
        this.currentSection = section;

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.section === section);
        });

        this.renderCurrentSection();
    }

    renderCurrentSection() {
        const mainContent = document.getElementById('mainContent');

        // Update Header Title dynamically
        const headerTitle = document.querySelector('.header-left h1');
        if (headerTitle) {
            const titles = {
                'dashboard': 'Dashboard',
                'add-expense': 'Add Expense',
                'history': 'History',
                'analytics': 'Analytics'
            };
            const icon = '<i class="fas fa-wallet"></i> ';
            headerTitle.innerHTML = icon + (titles[this.currentSection] || 'Dashboard');
        }

        if (this.currentSection === 'dashboard') {
            mainContent.innerHTML = this.renderDashboard();
            this.initCharts();
        } else if (this.currentSection === 'add-expense') {
            mainContent.innerHTML = this.renderAddExpense();
            this.attachAddExpenseHandlers();
        } else if (this.currentSection === 'history') {
            mainContent.innerHTML = this.renderHistory();
        } else if (this.currentSection === 'analytics') {
            mainContent.innerHTML = this.renderAnalytics();
            setTimeout(() => this.initAnalyticsCharts(), 100);
        }
    }

    renderDashboard() {
        const totalExpenses = this.getTotalExpenses();
        const monthlyExpenses = this.getMonthlyExpenses();
        const todayExpenses = this.getTodayExpenses();
        const transactionCount = this.expenses.length;

        return `
            <!-- Stats Cards -->
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Total Expenses</div>
                        <div class="stat-icon">
                            <i class="fas fa-wallet"></i>
                        </div>
                    </div>
                    <div class="stat-value">${this.formatCurrency(totalExpenses)}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i> 12% from last month
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">This Month</div>
                        <div class="stat-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                    </div>
                    <div class="stat-value">${this.formatCurrency(monthlyExpenses)}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i> 8% from last month
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Today</div>
                        <div class="stat-icon">
                            <i class="fas fa-calendar-day"></i>
                        </div>
                    </div>
                    <div class="stat-value">${this.formatCurrency(todayExpenses)}</div>
                    <div class="stat-change negative">
                        <i class="fas fa-arrow-down"></i> 5% from yesterday
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Transactions</div>
                        <div class="stat-icon">
                            <i class="fas fa-receipt"></i>
                        </div>
                    </div>
                    <div class="stat-value">${transactionCount}</div>
                    <div class="stat-change positive">
                        <i class="fas fa-arrow-up"></i> ${transactionCount > 0 ? '+3 today' : 'No transactions'}
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <h2 class="section-title">Quick Add Expenses</h2>
                <div class="quick-actions-grid">
                    ${this.quickActions.map(action => `
                        <div class="quick-action-btn" onclick="app.addQuickExpense('${action.name}', '${action.category}', ${action.amount})">
                            <div class="quick-action-name">${action.icon} ${action.name}</div>
                            <div class="quick-action-amount">${this.formatCurrency(action.amount)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Charts and Recent Expenses -->
            <div class="charts-container">
                <div class="chart-card">
                    <h3 class="section-title">Monthly Spending Trend</h3>
                    <div class="chart-container">
                        <canvas id="monthlyChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3 class="section-title">Category Breakdown</h3>
                    <div class="chart-container">
                        <canvas id="categoryChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Recent Expenses -->
            <div class="recent-expenses">
                <div class="recent-header">
                    <h3 class="section-title">Recent Expenses</h3>
                </div>
                ${this.renderRecentExpenses()}
            </div>
        `;
    }

    renderAddExpense() {
        return `
            <h2 class="section-title">Add New Expense</h2>
            
            <div class="input-methods">
                <!-- Text Input -->
                <div class="input-card">
                    <div class="input-header">
                        <div class="input-icon" style="background: #3498db;">
                            <i class="fas fa-keyboard"></i>
                        </div>
                        <h3>Manual Entry</h3>
                    </div>
                    <form id="manualExpenseForm">
                        <div class="form-group">
                            <label>Amount (${this.currency.symbol})</label>
                            <input type="number" id="manualAmount" step="0.01" required placeholder="Enter amount">
                        </div>
                        <div class="form-group">
                            <label>Category</label>
                            <select id="manualCategory" required>
                                <option value="">Select category</option>
                                ${this.categories.map(cat => `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Description</label>
                            <input type="text" id="manualDescription" placeholder="What did you spend on?">
                        </div>
                        <div class="form-group">
                            <label>Date</label>
                            <input type="date" id="manualDate" value="${new Date().toISOString().split('T')[0]}">
                        </div>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Add Expense
                        </button>
                    </form>
                </div>

                <!-- Voice Input -->
                <div class="input-card">
                    <div class="input-header">
                        <div class="input-icon" style="background: #e74c3c;">
                            <i class="fas fa-microphone"></i>
                        </div>
                        <h3>Voice Input</h3>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin-bottom: 20px; color: #7f8c8d;">
                            Say something like: "I spent 50 rupees on tea"
                        </p>
                        <button id="voiceBtn" class="btn voice-btn" onclick="app.toggleVoiceRecording()">
                            <i class="fas fa-microphone"></i>
                            <span id="voiceBtnText">Start Recording</span>
                        </button>
                        <div id="voiceResult" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px; display: none;">
                            <strong>Recognized:</strong> <span id="voiceText"></span>
                        </div>
                    </div>
                </div>

                <!-- Image/Receipt Input -->
                <div class="input-card">
                    <div class="input-header">
                        <div class="input-icon" style="background: #f39c12;">
                            <i class="fas fa-camera"></i>
                        </div>
                        <h3>Receipt Scanner</h3>
                    </div>
                    <div style="text-align: center;">
                        <p style="margin-bottom: 20px; color: #7f8c8d;">
                            Upload a receipt image for automatic processing
                        </p>
                        <input type="file" id="receiptInput" accept="image/*" style="display: none;" onchange="app.processReceipt(event)">
                        <button class="btn btn-primary" onclick="document.getElementById('receiptInput').click()">
                            <i class="fas fa-upload"></i> Upload Receipt
                        </button>
                        <div id="receiptResult" style="margin-top: 15px; display: none;">
                            <div style="padding: 10px; background: #f8f9fa; border-radius: 6px;">
                                <strong>Processed:</strong> <span id="receiptText"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderHistory() {
        const sortedExpenses = [...this.expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 class="section-title">Expense History</h2>
                <button class="btn btn-primary btn-sm" onclick="app.exportToCSV()" style="margin: 0;">
                    <i class="fas fa-download"></i> Export CSV
                </button>
            </div>

            <!-- Search and Filter -->
            <div style="background: var(--surface-color); padding: 20px; border-radius: 12px; margin-bottom: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
                <div style="display: grid; grid-template-columns: 1fr auto; gap: 15px; align-items: center;">
                    <div style="position: relative;">
                        <i class="fas fa-search" style="position: absolute; left: 15px; top: 50%; transform: translateY(-50%); color: #6b7280;"></i>
                        <input type="text" id="expenseSearch" placeholder="Search expenses..." style="width: 100%; padding: 12px 15px 12px 40px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" oninput="app.filterExpenses()">
                    </div>
                    <select id="categoryFilter" style="padding: 12px 15px; border: 2px solid var(--border-color); border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;" onchange="app.filterExpenses()">
                        <option value="">All Categories</option>
                        ${this.categories.map(cat => `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`).join('')}
                    </select>
                </div>
            </div>

            <div class="recent-expenses">
                <div class="recent-header">
                    <h3>All Expenses (<span id="filteredCount">${this.expenses.length}</span> total)</h3>
                </div>
                ${sortedExpenses.map(expense => `
                    <div class="expense-item">
                        <div class="expense-details">
                            <div class="expense-description">${expense.description}</div>
                            <div class="expense-category">${this.getCategoryIcon(expense.category)} ${expense.category} • ${expense.method}</div>
                        </div>
                        <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                        <div class="expense-date">${this.formatDate(expense.date)}</div>
                        <button onclick="app.deleteExpense(${expense.id})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderAnalytics() {
        const categoryTotals = this.getCategoryTotals();
        const topCategory = this.getTopCategory();
        const avgDaily = this.getAverageDailySpending();

        return `
            <h2 class="section-title">Analytics & Insights</h2>
            
            <div class="dashboard-grid">
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Top Category</div>
                        <div class="stat-icon">
                            <i class="fas fa-crown"></i>
                        </div>
                    </div>
                    <div class="stat-value">${topCategory.name}</div>
                    <div class="stat-change">${this.formatCurrency(topCategory.amount)}</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-header">
                        <div class="stat-title">Daily Average</div>
                        <div class="stat-icon">
                            <i class="fas fa-calculator"></i>
                        </div>
                    </div>
                    <div class="stat-value">${this.formatCurrency(avgDaily)}</div>
                    <div class="stat-change">Per day spending</div>
                </div>
            </div>

            <div class="charts-container">
                <div class="chart-card">
                    <h3 class="section-title">Category Wise Distribution</h3>
                    <div class="chart-container">
                        <canvas id="analyticsChart"></canvas>
                    </div>
                </div>
                <div class="chart-card">
                    <h3 class="section-title">Weekly Trend</h3>
                    <div class="chart-container">
                        <canvas id="weeklyChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }

    // Add expense methods
    // Add expense methods
    async addQuickExpense(name, category, amount) {
        const expensePayload = {
            amount: amount,
            category: category,
            description: name,
            date: new Date().toISOString().split('T')[0],
            method: 'quick',
            userId: this.currentUser ? this.currentUser._id : null
        };

        try {
            await API.addExpense(expensePayload);
            await this.refreshExpenses();
            this.showToast(`Added ${this.formatCurrency(amount)} for ${name}`);

            if (this.currentSection === 'dashboard') {
                this.renderCurrentSection();
            }
        } catch (e) {
            this.showToast('Failed to add expense');
        }
    }

    attachAddExpenseHandlers() {
        const form = document.getElementById('manualExpenseForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addManualExpense();
            });
        }
    }

    async addManualExpense() {
        const amount = parseFloat(document.getElementById('manualAmount').value);
        const category = document.getElementById('manualCategory').value;
        const description = document.getElementById('manualDescription').value || `${category} expense`;
        const date = document.getElementById('manualDate').value;

        const expensePayload = {
            amount: amount,
            category: category,
            description: description,
            date: date,
            method: 'manual',
            userId: this.currentUser ? this.currentUser._id : null
        };

        try {
            await API.addExpense(expensePayload);
            await this.refreshExpenses();
            this.showToast(`Added ${this.formatCurrency(amount)} expense`);

            // Reset form
            document.getElementById('manualExpenseForm').reset();
            document.getElementById('manualDate').value = new Date().toISOString().split('T')[0];
        } catch (e) {
            this.showToast('Failed to add expense');
        }
    }

    async deleteExpense(id) {
        if (confirm('Delete this expense?')) {
            try {
                await API.deleteExpense(id);
                await this.refreshExpenses();
                this.renderCurrentSection();
                this.showToast('Expense deleted');
            } catch (e) {
                this.showToast('Failed to delete expense');
            }
        }
    }

    // Modal helpers
    confirmClearExpenses() {
        const modal = document.getElementById('clearModal');
        if (modal) modal.classList.add('show');
    }

    closeClearModal() {
        const modal = document.getElementById('clearModal');
        if (modal) modal.classList.remove('show');
    }

    async clearAllExpenses() {
        try {
            if (this.currentUser && this.currentUser._id) {
                await API.clearExpenses(this.currentUser._id);
                await this.refreshExpenses();
                this.closeClearModal();
                this.renderCurrentSection();
                this.showToast('All expenses cleared');
            }
        } catch (e) {
            this.showToast('Failed to clear expenses');
        }
    }

    // Voice recognition
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-IN';

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.processVoiceInput(transcript);
            };

            this.recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                this.stopVoiceRecording();
                this.showToast('Voice recognition failed. Please try again.');
            };

            this.recognition.onend = () => {
                this.stopVoiceRecording();
            };
        }
    }

    toggleVoiceRecording() {
        if (this.isRecording) {
            this.stopVoiceRecording();
        } else {
            this.startVoiceRecording();
        }
    }

    startVoiceRecording() {
        if (!this.recognition) {
            this.showToast('Voice recognition not supported in this browser');
            return;
        }

        this.isRecording = true;
        const btn = document.getElementById('voiceBtn');
        const btnText = document.getElementById('voiceBtnText');

        if (btn && btnText) {
            btn.classList.add('recording');
            btnText.textContent = 'Recording... Speak now';
        }

        this.recognition.start();
    }

    stopVoiceRecording() {
        this.isRecording = false;
        const btn = document.getElementById('voiceBtn');
        const btnText = document.getElementById('voiceBtnText');

        if (btn && btnText) {
            btn.classList.remove('recording');
            btnText.textContent = 'Start Recording';
        }

        if (this.recognition) {
            this.recognition.stop();
        }
    }

    processVoiceInput(transcript) {
        console.log('Voice input:', transcript);

        // Show what was recognized
        const resultDiv = document.getElementById('voiceResult');
        const textSpan = document.getElementById('voiceText');
        if (resultDiv && textSpan) {
            textSpan.textContent = transcript;
            resultDiv.style.display = 'block';
        }

        // Process with NLP
        const processed = this.processNaturalLanguage(transcript);
        if (processed.success) {
            // Re-use logic for voice add, but we need to do it async
            // Let's create a specialized method or just call addManual-like logic
            this.handleVoiceAdd(processed);
        } else {
            this.showToast('Could not understand the expense. Please try manual entry.');
        }
    }

    async handleVoiceAdd(processed) {
        const expensePayload = {
            amount: processed.amount,
            category: processed.category,
            description: processed.description,
            date: new Date().toISOString().split('T')[0],
            method: 'voice',
            userId: this.currentUser ? this.currentUser._id : null
        };
        try {
            await API.addExpense(expensePayload);
            await this.refreshExpenses();
            this.showToast(`Added ${this.formatCurrency(processed.amount)} for ${processed.description}`);
            if (this.currentSection === 'dashboard') {
                this.renderCurrentSection();
            }
        } catch (e) {
            this.showToast('Failed to add voice expense');
        }
    }

    // Receipt processing
    processReceipt(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Show processing message
        const resultDiv = document.getElementById('receiptResult');
        const textSpan = document.getElementById('receiptText');
        if (resultDiv && textSpan) {
            textSpan.textContent = 'Processing receipt...';
            resultDiv.style.display = 'block';
        }

        // Simulate OCR processing (in real app, you'd use Tesseract.js or server-side OCR)
        setTimeout(async () => {
            // Mock OCR result
            const mockResult = {
                amount: Math.floor(Math.random() * 500) + 50,
                description: 'Receipt item',
                category: this.categories[Math.floor(Math.random() * this.categories.length)].name
            };

            if (textSpan) {
                textSpan.textContent = `Found: ${this.formatCurrency(mockResult.amount)} - ${mockResult.description}`;
            }

            // Add expense
            const expensePayload = {
                amount: mockResult.amount,
                category: mockResult.category,
                description: mockResult.description,
                date: new Date().toISOString().split('T')[0],
                method: 'receipt',
                userId: this.currentUser ? this.currentUser._id : null
            };

            try {
                await API.addExpense(expensePayload);
                await this.refreshExpenses();
                this.showToast(`Added ${this.formatCurrency(mockResult.amount)} from receipt`);
            } catch (e) {
                this.showToast('Failed to add receipt expense');
            }
        }, 2000);
    }


    // NLP Processing
    processNaturalLanguage(text) {
        const lowerText = text.toLowerCase();

        // Extract amount
        const amountMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?/);
        if (!amountMatch) {
            return { success: false, error: 'No amount found' };
        }

        const amount = parseFloat(amountMatch[1]);

        // Categorize based on keywords
        let category = 'Other';
        let maxMatches = 0;

        for (const [cat, keywords] of Object.entries(this.nlpKeywords)) {
            const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
            if (matches > maxMatches) {
                maxMatches = matches;
                category = cat;
            }
        }

        // Extract description
        let description = text.replace(/(\d+(?:\.\d+)?)\s*(?:rupees?|rs\.?|₹)?/gi, '').trim();
        description = description.replace(/^(i\s+)?(?:spent|paid|bought|purchased)\s*/i, '').trim();
        description = description || `${category} expense`;

        return {
            success: true,
            amount: amount,
            category: category,
            description: description
        };
    }

    // Chart initialization
    initCharts() {
        // Destroy existing charts
        this.charts.forEach(chart => chart.destroy());
        this.charts = [];

        // Monthly trend chart
        const monthlyCtx = document.getElementById('monthlyChart');
        if (monthlyCtx) {
            const monthlyChart = new Chart(monthlyCtx, {
                type: 'line',
                data: {
                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                    datasets: [{
                        label: 'Monthly Expenses',
                        data: [12000, 15000, 18000, 14000, 16000, 19000, 17000, 20000, 22000, this.getMonthlyExpenses()],
                        borderColor: '#1fb8cd',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                }
                            }
                        }
                    }
                }
            });
            this.charts.push(monthlyChart);
        }

        // Category breakdown chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            const categoryTotals = this.getCategoryTotals();
            const categoryChart = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(categoryTotals),
                    datasets: [{
                        data: Object.values(categoryTotals),
                        backgroundColor: this.categories.map(cat => cat.color),
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 15,
                                usePointStyle: true
                            }
                        }
                    }
                }
            });
            this.charts.push(categoryChart);
        }
    }

    initAnalyticsCharts() {
        // Analytics page charts
        const analyticsCtx = document.getElementById('analyticsChart');
        if (analyticsCtx) {
            const categoryTotals = this.getCategoryTotals();
            const analyticsChart = new Chart(analyticsCtx, {
                type: 'bar',
                data: {
                    labels: Object.keys(categoryTotals),
                    datasets: [{
                        label: 'Amount Spent',
                        data: Object.values(categoryTotals),
                        backgroundColor: this.categories.map(cat => cat.color + '80'),
                        borderColor: this.categories.map(cat => cat.color),
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                }
                            }
                        }
                    }
                }
            });
            this.charts.push(analyticsChart);
        }

        // Weekly trend chart
        const weeklyCtx = document.getElementById('weeklyChart');
        if (weeklyCtx) {
            const weeklyChart = new Chart(weeklyCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Daily Expenses',
                        data: [500, 800, 600, 900, 700, 1200, 400],
                        borderColor: '#f39c12',
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function (value) {
                                    return '₹' + value.toLocaleString('en-IN');
                                }
                            }
                        }
                    }
                }
            });
            this.charts.push(weeklyChart);
        }
    }

    // Utility methods
    formatCurrency(amount) {
        return this.currency.symbol + amount.toLocaleString('en-IN');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN');
    }

    getCategoryIcon(categoryName) {
        const category = this.categories.find(cat => cat.name === categoryName);
        return category ? category.icon : '💰';
    }

    getTotalExpenses() {
        return this.expenses.reduce((total, expense) => total + expense.amount, 0);
    }

    getMonthlyExpenses() {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return this.expenses
            .filter(expense => {
                const expenseDate = new Date(expense.date);
                return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
            })
            .reduce((total, expense) => total + expense.amount, 0);
    }

    getTodayExpenses() {
        const today = new Date().toISOString().split('T')[0];
        return this.expenses
            .filter(expense => expense.date === today)
            .reduce((total, expense) => total + expense.amount, 0);
    }

    getCategoryTotals() {
        const totals = {};
        this.categories.forEach(cat => totals[cat.name] = 0);

        this.expenses.forEach(expense => {
            if (totals.hasOwnProperty(expense.category)) {
                totals[expense.category] += expense.amount;
            }
        });

        return totals;
    }

    getTopCategory() {
        const totals = this.getCategoryTotals();
        let topCategory = { name: 'None', amount: 0 };

        for (const [category, amount] of Object.entries(totals)) {
            if (amount > topCategory.amount) {
                topCategory = { name: category, amount };
            }
        }

        return topCategory;
    }

    getAverageDailySpending() {
        if (this.expenses.length === 0) return 0;

        const totalDays = 30; // Last 30 days
        return this.getTotalExpenses() / totalDays;
    }

    renderRecentExpenses() {
        const recentExpenses = [...this.expenses]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);

        return recentExpenses.map(expense => `
            <div class="expense-item">
                <div class="expense-details">
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-category">${this.getCategoryIcon(expense.category)} ${expense.category}</div>
                </div>
                <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                <div class="expense-date">${this.formatDate(expense.date)}</div>
            </div>
        `).join('');
    }

    async deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            try {
                await API.deleteExpense(id);
                await this.refreshExpenses();
                this.renderCurrentSection();
                this.showToast('Expense deleted successfully');
            } catch (e) {
                this.showToast('Failed to delete expense');
            }
        }
    }

    confirmClearExpenses() {
        document.getElementById('clearModal').classList.add('show');
    }

    closeClearModal() {
        document.getElementById('clearModal').classList.remove('show');
    }

    openProfileModal() {
        if (this.currentUser) {
            document.getElementById('profileName').value = this.currentUser.name || '';
            document.getElementById('profileEmail').value = this.currentUser.email || '';
            document.getElementById('profilePhone').value = this.currentUser.phone || '';
            document.getElementById('profilePassword').value = this.currentUser.password || ''; // Insecure but requested
            document.getElementById('profileRole').textContent = this.currentUser.role || 'User';
        }
        document.getElementById('profileModal').classList.add('show');
    }

    closeProfileModal() {
        document.getElementById('profileModal').classList.remove('show');
    }

    async clearAllExpenses() {
        try {
            if (this.currentUser && this.currentUser._id) {
                await API.clearExpenses(this.currentUser._id);
                await this.refreshExpenses();
                this.closeClearModal();
                this.renderCurrentSection();
                this.showToast('All expenses cleared');
            }
        } catch (e) {
            this.showToast('Failed to clear expenses');
        }
    }

    filterExpenses() {
        const searchTerm = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
        const categoryFilter = document.getElementById('categoryFilter')?.value || '';

        const filteredExpenses = this.expenses.filter(expense => {
            const matchesSearch = expense.description.toLowerCase().includes(searchTerm) ||
                expense.category.toLowerCase().includes(searchTerm) ||
                expense.amount.toString().includes(searchTerm);
            const matchesCategory = !categoryFilter || expense.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });

        // Update the expense list
        const sortedFilteredExpenses = filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        const expenseListHtml = sortedFilteredExpenses.map(expense => `
            <div class="expense-item">
                <div class="expense-details">
                    <div class="expense-description">${expense.description}</div>
                    <div class="expense-category">${this.getCategoryIcon(expense.category)} ${expense.category} • ${expense.method}</div>
                </div>
                <div class="expense-amount">${this.formatCurrency(expense.amount)}</div>
                <div class="expense-date">${this.formatDate(expense.date)}</div>
                <button onclick="app.deleteExpense(${expense.id})" style="background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        // Update the container
        const container = document.querySelector('.recent-expenses');
        if (container) {
            const header = container.querySelector('.recent-header h3');
            const listContainer = container.querySelector('.recent-header').nextElementSibling ||
                container.querySelector('.recent-header').parentNode.lastElementChild;

            if (header) {
                header.innerHTML = `Filtered Expenses (<span id="filteredCount">${filteredExpenses.length}</span> of ${this.expenses.length} total)`;
            }

            // Replace the expense list
            const existingList = container.querySelectorAll('.expense-item');
            existingList.forEach(item => item.remove());

            if (filteredExpenses.length > 0) {
                container.insertAdjacentHTML('beforeend', expenseListHtml);
            } else {
                container.insertAdjacentHTML('beforeend', `
                    <div style="text-align: center; padding: 40px; color: #6b7280;">
                        <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px;"></i>
                        <p>No expenses found matching your search criteria.</p>
                    </div>
                `);
            }
        }
    }

    exportToCSV() {
        if (this.expenses.length === 0) {
            this.showToast('No expenses to export');
            return;
        }

        // Create CSV content
        const headers = ['Date', 'Description', 'Category', 'Amount', 'Method'];
        const csvContent = [
            headers.join(','),
            ...this.expenses.map(expense => [
                expense.date,
                `"${expense.description.replace(/"/g, '""')}"`,
                expense.category,
                expense.amount,
                expense.method
            ].join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `expenses_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        this.showToast('Expenses exported successfully!');
    }

    async saveProfile() {
        const name = document.getElementById('profileName').value;
        const email = document.getElementById('profileEmail').value;
        const phone = document.getElementById('profilePhone').value;
        const password = document.getElementById('profilePassword').value;

        try {
            const res = await API.updateUser({ name, email, phone, password });
            if (res.success) {
                this.currentUser = res.user;
                this.updateUserName(res.user);
                this.showToast('Profile updated successfully');
                this.closeProfileModal();
            } else {
                this.showToast(res.message || 'Update failed');
            }
        } catch (e) {
            this.showToast('Failed to update profile');
        }
    }

    showToast(message) {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-weight: 600;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            document.body.removeChild(toast);
        }, 3000);
    }
}

// Clear expenses functionality
function confirmClearExpenses() {
    app.confirmClearExpenses();
}

function closeClearModal() {
    app.closeClearModal();
}

function closeProfileModal() {
    app.closeProfileModal();
}

function saveProfile() {
    app.saveProfile();
}

function clearAllExpenses() {
    app.clearAllExpenses();
}

function logout() {
    API.logout().then(() => {
        window.location.href = 'login.html';
    });
}

// Initialize the app
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new EnhancedExpensesApp();
});