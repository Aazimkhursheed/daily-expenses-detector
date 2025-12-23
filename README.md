# Daily Expense Detector 💰

A comprehensive, responsive web application for tracking, managing, and analyzing daily expenses. Built with modern web technologies and designed for both desktop and mobile users.

## ✨ Features

### 🔐 Authentication
- **Multiple Login Methods**: Email/Password, Google OAuth, Phone OTP
- **Secure Sessions**: Express sessions with MongoDB storage
- **User Management**: Role-based access (User/Admin)

### 📊 Dashboard
- **Expense Overview**: Total, monthly, and daily spending statistics
- **Interactive Charts**: Monthly trends and category breakdowns using Chart.js
- **Quick Actions**: One-click expense entry for common items
- **Recent Expenses**: Latest 5 transactions at a glance

### ➕ Expense Management
- **Multiple Input Methods**:
  - Manual entry with categories and descriptions
  - Voice input with natural language processing (NLP)
  - Receipt scanning (simulated OCR)
- **Smart Categories**: 8 pre-defined Indian-context categories
- **Indian Rupee Support**: Proper currency formatting (₹)

### 📈 Analytics & Insights
- **Category Breakdown**: Visual representation of spending by category
- **Weekly Trends**: 7-day spending patterns
- **Top Category Analysis**: Identify biggest spending areas
- **Average Daily Spending**: Calculate daily expense averages

### 🔍 Advanced Features
- **Search & Filter**: Find expenses by description, category, or amount
- **Data Export**: Download expenses as CSV files
- **Expense History**: Complete transaction history with delete functionality
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start MongoDB** (ensure MongoDB is running on your system)

4. **Start the Backend Server**
   ```bash
   cd backend
   npm start
   ```
   The server will run on `http://localhost:4000`

5. **Open the Frontend**
   - Open `login.html` in your web browser
   - Or serve the static files using any HTTP server

## 🏗️ Project Structure

```
DED/
├── login.html              # Login page
├── login.js               # Login functionality
├── login-style.css        # Login page styles
├── index.html             # Main dashboard
├── enhanced-app.js        # Main application logic
├── style.css              # Dashboard styles
├── api.js                 # Frontend API utilities
├── backend/               # Backend server
│   ├── app.js            # Express server
│   ├── db.js             # MongoDB connection
│   ├── models/           # Database models
│   │   ├── User.js       # User model
│   │   └── Expense.js    # Expense model
│   ├── routes/           # API routes
│   │   ├── auth.js       # Authentication routes
│   │   └── expenses.js   # Expense management routes
│   └── package.json      # Backend dependencies
└── README.md             # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory with:
```
MONGODB_URI=mongodb://localhost:27017/daily-expenses-detector
SESSION_SECRET=your-secret-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs: `http://localhost:4000/api/auth/google/callback`
6. Update the credentials in your environment variables

## 💡 Usage Guide

### Adding Expenses
1. **Manual Entry**: Click "Add Expense" → Fill form → Submit
2. **Voice Input**: Click "Voice Input" → Say "I spent X rupees on Y" → Process
3. **Receipt Scan**: Upload receipt image → Automatic processing
4. **Quick Actions**: Click predefined expense buttons on dashboard

### Voice Commands Examples
- "I spent 50 rupees on tea"
- "Paid 200 for lunch at restaurant"
- "Bought groceries for 500 rupees"
- "Movie ticket cost 300"

### Exporting Data
1. Go to "History" section
2. Click "Export CSV" button
3. File downloads with all expense data

### Searching Expenses
- Use the search box to find expenses by description, category, or amount
- Filter by specific categories using the dropdown
- Real-time filtering as you type

## 🎨 Categories

- 🍽️ **Food**: Meals, snacks, dining out
- 🚗 **Transportation**: Auto, petrol, bus fares
- 📄 **Bills**: Electricity, water, internet, phone
- 🛍️ **Shopping**: Clothes, groceries, daily items
- 🎬 **Entertainment**: Movies, games, subscriptions
- ⚕️ **Healthcare**: Medicine, doctor visits
- 📚 **Education**: Books, courses, fees
- ✈️ **Travel**: Hotels, flights, trips

## 📱 Responsive Design

The application is fully responsive and works on:
- **Desktop**: Full feature set with sidebar navigation
- **Tablet**: Optimized layout with collapsible elements
- **Mobile**: Touch-friendly interface with mobile-first design

## 🔒 Security Features

- **Session Management**: Secure HTTP-only cookies
- **Password Hashing**: bcrypt for password storage
- **CORS Protection**: Configured for cross-origin requests
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs

## 🛠️ Technologies Used

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with CSS Grid and Flexbox
- **JavaScript (ES6+)**: Vanilla JS with modern features
- **Chart.js**: Interactive data visualizations
- **Font Awesome**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing
- **express-session**: Session management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Troubleshooting

### Backend Won't Start
- Ensure MongoDB is running
- Check port 4000 is not in use
- Verify environment variables are set

### Login Issues
- Clear browser cookies and localStorage
- Check backend console for authentication errors
- Verify Google OAuth credentials if using Google login

### Voice Recognition Not Working
- Ensure HTTPS in production (required for microphone access)
- Check browser permissions for microphone
- Test with different browsers (Chrome recommended)

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for better expense management**
