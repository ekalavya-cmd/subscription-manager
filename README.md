# Subscription Manager

A modern web application built with AngularJS and Bootstrap to manage subscriptions, including adding, editing, deleting, and sending SMS reminders. The app features a responsive design, comprehensive logging, cost tracking with charts, and user authentication.

## ✨ Features

- **🔐 User Authentication**: Secure registration and login with JWT tokens
- **📊 Subscription Management**: Add, edit, delete, and view subscription details
- **💰 Cost Tracking**: Visualize monthly costs with interactive Chart.js charts
- **📱 SMS Reminders**: Send renewal reminders using Twilio integration
- **🎨 Modern UI**: Responsive Bootstrap 5 design with custom styling
- **⚡ Real-time Validation**: Form validation with immediate feedback
- **📈 Dashboard Analytics**: Quick overview of subscription statistics

## 🛠️ Technologies Used

- **Frontend**: AngularJS 1.8.2, Bootstrap 5.3.0, Chart.js
- **Backend**: Node.js, Express.js, Winston Logger
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt hashing
- **SMS Service**: Twilio API for automated reminders
- **Styling**: Bootstrap 5 + Custom CSS with gradients and animations

## 📋 Prerequisites

- **Node.js**: Version 16+ ([Download](https://nodejs.org/))
- **MongoDB**: Community Server ([Download](https://www.mongodb.com/try/download/community))
- **Twilio Account**: For SMS functionality ([Sign up](https://www.twilio.com/))
- **Windows 11**: Target development environment

## 🚀 Installation (Windows 11)

### 1. Clone/Create Project

```cmd
git clone https://github.com/ekalavya-cmd/subscription-manager.git
cd subscription-manager
```

### 2. Install Dependencies

```cmd
npm install
```

### 3. Create Required Directory Structure

```cmd
mkdir public\css public\js public\logs views
```

### 4. Environment Configuration

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/subscription_manager

# JWT Configuration
JWT_SECRET=your_super_secure_jwt_secret_key_here

# Twilio Configuration (for SMS reminders)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
USER_PHONE_NUMBER=+919876543210

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
```

### 5. Generate JWT Secret

```cmd
npm run generate-key
```

Copy the generated secret to your `.env` file.

### 6. Start MongoDB Service

```cmd
net start MongoDB
```

### 7. Run the Application

```cmd
# Development mode with auto-restart and detailed logging
npm run dev

# Production mode
npm start
```

### 8. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Complete Project Structure

```
subscription-manager/
├── 📁 public/
│   ├── 📁 css/
│   │   └── custom.css              # Custom Bootstrap styles and animations
│   ├── 📁 js/
│   │   └── logger.js               # Client-side logging and debug utilities
│   └── 📁 logs/                    # Generated log files (auto-created)
│       ├── app-YYYY-MM-DD.log      # General application logs
│       ├── error-YYYY-MM-DD.log    # Error-specific logs with stack traces
│       ├── api-YYYY-MM-DD.log      # API request/response logs
│       └── db-YYYY-MM-DD.log       # MongoDB operation logs
├── 📁 views/
│   ├── index.html                  # Login page with authentication
│   ├── register.html               # User registration page
│   └── app.html                    # Main subscription management interface
├── 📄 server.js                    # Express server with comprehensive logging
├── 📄 package.json                 # Dependencies and npm scripts
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 generateKey.js              # JWT secret key generator utility
├── 📄 .env                        # Environment variables (create this file)
├── 📄 .gitignore                  # Git ignore rules
└── 📄 README.md                   # This documentation file
```

## 🎯 Usage Guide

### Getting Started

1. **Registration**: Visit `/register` to create a new account

   - Enter a unique username (3-20 characters)
   - Create a secure password (6+ characters)
   - Password strength indicator provides real-time feedback
   - Agree to terms and conditions

2. **Login**: Go to `/` and enter your credentials
   - Automatic redirection to main app after successful login
   - JWT token stored securely for session management

### Managing Subscriptions

#### ➕ Adding a Subscription

1. Fill out the "Add New Subscription" form:

   - **Service Name**: e.g., "Netflix", "Spotify Premium"
   - **Monthly Cost**: e.g., "199" (in INR)
   - **Start Date**: When subscription began
   - **End Date**: When subscription expires
   - **Next Renewal Date**: Select from date picker
   - **Provider**: e.g., "Netflix Inc.", "Spotify AB"
   - **Status**: Active/Upcoming/Canceled
   - **Cancellation Steps**: Optional instructions for canceling

2. Click "Add Subscription" or press Enter to save
3. Real-time validation provides immediate feedback

#### ✏️ Editing a Subscription

1. Find the subscription in the responsive table
2. Click the "Edit" button (pencil icon)
3. Modify any fields as needed in the modal form
4. Click "Update Subscription" to save changes
5. Changes are logged for audit purposes

#### 🗑️ Deleting a Subscription

1. Locate the subscription in the table
2. Click the "Delete" button (trash icon)
3. Confirm the deletion in the modal prompt
4. Deletion is permanently logged

### 📱 SMS Reminders

1. Navigate to the "Send SMS Reminder" section
2. Enter recipient phone number in E.164 format: `+919876543210`
3. Type your personalized reminder message
4. Click "Send SMS" to dispatch via Twilio
5. SMS delivery status is logged and displayed

### 🔍 Search and Filter Capabilities

- **Real-time Search**: Type in the search box to find subscriptions by:
  - Service name
  - Provider name
  - Status
  - Cost range
- **Status Filter**: Use dropdown to show only:
  - Active subscriptions
  - Upcoming renewals
  - Canceled subscriptions
- **Date Sorting**: Click column headers to sort by renewal dates

### 📊 Dashboard Analytics

- **Statistics Cards**: Live counters for:
  - Total active subscriptions
  - Monthly cost summation
  - Upcoming renewals (next 7 days)
  - Canceled subscriptions count
- **Interactive Cost Chart**: Chart.js visualization showing:
  - Monthly cost distribution
  - Trend analysis
  - Hover tooltips with detailed information
- **Renewal Alerts**: Color-coded indicators for:
  - ⚠️ Overdue renewals (red)
  - 🔔 Upcoming renewals (yellow)
  - ✅ Current subscriptions (green)

## ⚡ Performance Optimizations

- **Lazy Loading**: Chart.js and heavy libraries loaded only when needed
- **Request Caching**: Efficient API request management with proper headers
- **Database Indexing**: MongoDB indexes on frequently queried fields
- **Client-Side Validation**: Immediate feedback reduces server round-trips
- **Compression**: Gzip compression for static assets
- **Connection Pooling**: MongoDB connection optimization

## 🔒 Security Features

- **JWT Authentication**: Stateless, secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Input Validation**: Comprehensive server and client-side validation
- **CORS Protection**: Cross-origin request security configuration
- **Rate Limiting**: Built-in protection against brute force attacks
- **SQL Injection Prevention**: MongoDB ODM parameterized queries
- **XSS Protection**: Content sanitization and validation

## 🤝 Contributing

1. **Fork the Repository**: Create your own copy
2. **Create Feature Branch**:
   ```cmd
   git checkout -b feature/amazing-feature
   ```
3. **Make Changes**: Follow the coding standards
4. **Test Thoroughly**: Ensure all functionality works
5. **Commit Changes**:
   ```cmd
   git commit -m "Add amazing feature with comprehensive logging"
   ```
6. **Push to Branch**:
   ```cmd
   git push origin feature/amazing-feature
   ```
7. **Open Pull Request**: Describe changes and testing performed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bootstrap Team**: For the excellent responsive CSS framework
- **AngularJS Community**: For the robust JavaScript framework
- **Twilio**: For reliable SMS services and excellent documentation
- **Chart.js**: For beautiful and interactive data visualizations
- **MongoDB**: For flexible and scalable document database
- **Winston**: For comprehensive logging capabilities

## 📞 Support and Troubleshooting

### Common Issues and Solutions

| Issue                     | Solution                                               |
| ------------------------- | ------------------------------------------------------ |
| MongoDB connection failed | Ensure MongoDB service is running: `net start MongoDB` |
| JWT Secret not found      | Run `node generateKey.js` and update `.env` file       |
| SMS not sending           | Verify Twilio credentials in `.env` file               |
| Port already in use       | Change PORT in `.env` or kill process using port 3000  |
| Logs not generating       | Check permissions on `public/logs/` directory          |

### Getting Help

1. **Check Log Files**: Review logs in `public/logs/` directory for detailed error information
2. **GitHub Issues**: Open an issue with detailed reproduction steps
3. **Documentation**: Refer to official documentation for dependencies

### Log Analysis Commands

```cmd
# View latest application logs
type public\logs\app-%DATE%.log

# Search for specific errors
findstr "ERROR" public\logs\error-%DATE%.log

# Monitor logs in real-time (PowerShell)
Get-Content public\logs\app-2025-07-02.log -Wait -Tail 10
```

---

**Made with ❤️ using Bootstrap 5, AngularJS, and modern web technologies**

_Optimized for Windows 11 development_
