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

### 1. Clone the Repository

```cmd
git clone https://github.com/ekalavya-cmd/subscription-manager.git
cd subscription-manager
```

### 2. Install Dependencies

```cmd
npm install
```

**Note**: The `node_modules` folder is excluded from version control. This command will install all required dependencies listed in `package.json`.

### 3. Create Required Directory Structure

```cmd
mkdir public\logs
```

**Note**: Other directories (`public/css`, `public/js`, `views`) are already included in the repository.

### 4. Environment Configuration

Create a `.env` file in the root directory with your credentials:

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

# SMS Scheduling (optional)
ENABLE_SMS=true
SMS_SCHEDULE=disabled

# Logging Configuration
LOG_LEVEL=info
LOG_TO_FILE=true
LOG_TO_CONSOLE=true
```

**⚠️ Security Notice**: The `.env` file is excluded from git to protect your sensitive credentials. Never commit this file to version control.

### 5. Generate JWT Secret

You need to generate a secure JWT secret key. Run this command in Node.js:

```cmd
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the generated 64-character hexadecimal string to your `.env` file as the `JWT_SECRET` value.

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

## 📁 Project Structure

```
subscription-manager/
├── 📁 public/                      # Frontend assets (served statically)
│   ├── 📁 css/
│   │   └── custom.css              # Custom Bootstrap styles and animations
│   ├── 📁 js/
│   │   ├── logger.js               # Client-side logging and debug utilities
│   │   ├── login.js                # Login page controller
│   │   └── register.js             # Registration page controller
│   └── 📁 logs/                    # Generated log files (git-ignored, auto-created)
│       ├── app-YYYY-MM-DD.log      # General application logs
│       ├── error-YYYY-MM-DD.log    # Error-specific logs with stack traces
│       ├── api-YYYY-MM-DD.log      # API request/response logs
│       └── db-YYYY-MM-DD.log       # MongoDB operation logs
├── 📁 views/                       # HTML templates
│   ├── index.html                  # Login page with authentication
│   ├── register.html               # User registration page
│   └── app.html                    # Main subscription management interface
├── 📄 server.js                    # Express server with all routes and models
├── 📄 package.json                 # Dependencies and npm scripts
├── 📄 package-lock.json            # Locked dependency versions
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .gitattributes               # Git attributes configuration
└── 📄 README.md                    # This documentation file

# Files excluded from git (you need to create):
├── 📄 .env                         # Environment variables (REQUIRED - create this)
└── 📁 node_modules/                # Dependencies (auto-installed via npm install)
```

**Note**: Utility scripts (`generateKey.js`, `twilio-test.js`, `migrate-subscriptions.js`) are not tracked in git but can be created if needed for development.

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
- **Environment Variables**: Sensitive credentials stored in `.env` (excluded from git)

## 📦 Repository Best Practices

This repository follows Node.js best practices for clean version control:

### What's Excluded from Git (via `.gitignore`):

- ✅ **`node_modules/`** - Dependencies (install via `npm install`)
- ✅ **`.env`** - Environment variables with sensitive credentials
- ✅ **`public/logs/`** - Generated log files
- ✅ **`.claude/`** - IDE-specific configuration
- ✅ **Utility scripts** - Development tools (`generateKey.js`, `twilio-test.js`, `migrate-subscriptions.js`)
- ✅ **Temporary files** - Screenshots, images, backup files

### Why This Matters:

1. **Security**: Your Twilio API keys, JWT secrets, and database credentials stay private
2. **Size**: Repository stays lightweight (~100 KB vs ~200 MB with dependencies)
3. **Compatibility**: Each developer installs dependencies matching their OS
4. **Clean History**: No binary files or auto-generated content in git history

### First-Time Setup Checklist:

- [ ] Clone the repository
- [ ] Run `npm install` to install dependencies
- [ ] Create `.env` file with your credentials
- [ ] Generate JWT secret using the crypto command
- [ ] Start MongoDB service
- [ ] Run `npm run dev` to start the application

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

| Issue                     | Solution                                                                                       |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| MongoDB connection failed | Ensure MongoDB service is running: `net start MongoDB`                                         |
| JWT Secret not found      | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`     |
| SMS not sending           | Verify Twilio credentials in `.env` file                                                       |
| Port already in use       | Change PORT in `.env` or kill process using port 3000                                          |
| Logs not generating       | Check permissions on `public/logs/` directory (create with `mkdir public\logs` if missing)    |
| .env file missing         | Create `.env` file manually in root directory with all required environment variables          |
| Dependencies not found    | Run `npm install` to install all required packages                                             |

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
