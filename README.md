# Subscription Manager

A modern web application built with AngularJS and Bootstrap to manage subscriptions, including adding, editing, deleting, and sending SMS reminders. The app features a responsive design, comprehensive logging, cost tracking with charts, and user authentication.

## ✨ Features

- **🔐 User Authentication**: Secure registration and login with JWT tokens
- **📊 Subscription Management**: Add, edit, delete, and view subscription details
- **💰 Cost Tracking**: Visualize monthly costs with interactive Chart.js charts
- **📱 SMS Reminders**: Send renewal reminders using Twilio integration
- **🎨 Modern UI**: Responsive Bootstrap 5 design with custom styling
- **🐛 Advanced Debugging**: Comprehensive client and server-side logging
- **⚡ Real-time Validation**: Form validation with immediate feedback
- **📈 Dashboard Analytics**: Quick overview of subscription statistics

## 🛠️ Technologies Used

- **Frontend**: AngularJS 1.8.2, Bootstrap 5.3.0, Chart.js
- **Backend**: Node.js, Express.js, Winston Logger
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **SMS Service**: Twilio API
- **Styling**: Bootstrap 5 + Custom CSS with gradients and animations

## 📋 Prerequisites

- **Node.js**: Version 14+ ([Download](https://nodejs.org/))
- **MongoDB**: Community Server ([Download](https://www.mongodb.com/try/download/community))
- **Twilio Account**: For SMS functionality ([Sign up](https://www.twilio.com/))
- **VS Code**: Recommended editor ([Download](https://code.visualstudio.com/))

## 🚀 Installation (Windows 11)

### 1. Clone/Create Project

```cmd
git clone https://github.com/yourusername/bootstrap-subscription-manager.git
cd bootstrap-subscription-manager
```

### 2. Install Dependencies

```cmd
npm install
```

### 3. Create Directory Structure

```cmd
mkdir public\css public\js public\logs views
```

### 4. Environment Configuration

Create `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (generate using: node generateKey.js)
JWT_SECRET=your_generated_jwt_secret_here

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
USER_PHONE_NUMBER=your_personal_phone_number

# Feature Flags
ENABLE_SMS=true
```

### 5. Generate JWT Secret

```cmd
node generateKey.js
```

Copy the generated key to your `.env` file.

### 6. Start MongoDB

```cmd
# If MongoDB is installed as a Windows service
net start MongoDB

# Or start manually
mongod --dbpath "C:\data\db"
```

### 7. Run the Application

```cmd
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

### 8. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
bootstrap-subscription-manager/
├── 📁 public/
│   ├── 📁 css/
│   │   └── custom.css          # Custom Bootstrap styles
│   ├── 📁 js/
│   │   └── logger.js           # Client-side logging
│   └── 📁 logs/               # Generated log files
│       ├── app-YYYY-MM-DD.log
│       ├── error-YYYY-MM-DD.log
│       └── api-YYYY-MM-DD.log
├── 📁 views/
│   ├── index.html             # Login page
│   ├── register.html          # Registration page
│   └── app.html              # Main application
├── server.js                  # Express server with logging
├── package.json              # Dependencies and scripts
├── generateKey.js            # JWT secret generator
├── .env                      # Environment variables
├── .gitignore               # Git ignore rules
└── README.md               # This file
```

## 🎯 Usage Guide

### Getting Started

1. **Registration**: Visit `/register` to create a new account

   - Enter a unique username (3-20 characters)
   - Create a secure password (6+ characters)
   - Agree to terms and conditions

2. **Login**: Go to `/` and enter your credentials
   - Automatic redirection to main app after successful login

### Managing Subscriptions

#### ➕ Adding a Subscription

1. Fill out the "Add New Subscription" form:

   - **Service Name**: e.g., "Netflix"
   - **Monthly Cost**: e.g., "199" (in INR)
   - **Next Renewal Date**: Select from date picker
   - **Provider**: e.g., "Netflix Inc."
   - **Status**: Active/Upcoming/Canceled
   - **Cancellation Steps**: Optional instructions

2. Click "Add Subscription" or press Enter to save

#### ✏️ Editing a Subscription

1. Find the subscription in the table
2. Click the "Edit" button
3. Modify any fields as needed
4. Click "Update Subscription" to save changes

#### 🗑️ Deleting a Subscription

1. Locate the subscription in the table
2. Click the "Delete" button
3. Confirm the deletion when prompted

### 📱 SMS Reminders

1. Navigate to the "Send SMS Reminder" section
2. Enter recipient phone number (E.164 format: +919876543210)
3. Type your reminder message
4. Click "Send SMS"

### 🔍 Search and Filter

- **Search**: Type in the search box to find subscriptions by name, provider, or status
- **Filter**: Use the status dropdown to show only Active, Upcoming, or Canceled subscriptions

### 📊 Dashboard Features

- **Statistics Cards**: View totals for active subscriptions, monthly costs, upcoming renewals, and canceled subscriptions
- **Cost Chart**: Interactive bar chart showing monthly cost distribution
- **Renewal Alerts**: Visual indicators for upcoming and overdue renewals

## 🐛 Debugging Features

### Client-Side Logging

- **Keyboard Shortcut**: `Ctrl + Shift + L` to view logs modal
- **Debug Mode**: `Ctrl + Shift + D` to toggle debug information
- **Log Export**: Download logs for analysis
- **Performance Monitoring**: Track page load times and API response times

### Server-Side Logging

- **File-Based Logs**: Automatically saved in `public/logs/`
- **Request Tracking**: All API calls logged with timestamps and durations
- **Error Monitoring**: Detailed error logging with stack traces
- **Database Operations**: MongoDB query logging

### Log Files

- `app-YYYY-MM-DD.log`: General application logs
- `error-YYYY-MM-DD.log`: Error-specific logs
- `api-YYYY-MM-DD.log`: API request/response logs
- `db-YYYY-MM-DD.log`: Database operation logs

## 🎨 Bootstrap Components Used

### UI Framework

- **Bootstrap 5.3.0**: Latest stable version
- **Bootstrap Icons**: Consistent iconography
- **Custom CSS**: Enhanced with gradients and animations

### Key Components

- **Cards**: Modern card-based layout for all sections
- **Forms**: Bootstrap form controls with custom styling
- **Tables**: Responsive tables with hover effects
- **Buttons**: Gradient buttons with loading states
- **Alerts**: Custom styled success/error messages
- **Progress Bars**: Password strength indicators

## ⚡ Performance Optimizations

- **Lazy Loading**: Chart.js loaded only when needed
- **Request Caching**: Efficient API request management
- **Optimized Queries**: MongoDB indexing for fast searches
- **Client-Side Validation**: Immediate feedback without server round-trips

## 🔧 Development Tips

### VS Code Extensions (Recommended)

- **ES6 String HTML**: Syntax highlighting for HTML in JS
- **MongoDB for VS Code**: Database management
- **REST Client**: API testing
- **Bracket Pair Colorizer**: Better code readability

### Debugging in VS Code

1. Set breakpoints in server.js
2. Use the integrated terminal for MongoDB queries
3. Check log files in the `public/logs/` directory
4. Use browser developer tools for client-side debugging

## 🚀 Deployment

### Development

```cmd
npm run dev
```

### Production

1. Set `NODE_ENV=production` in `.env`
2. Use PM2 for process management:

```cmd
npm install -g pm2
pm2 start server.js --name "subscription-manager"
```

3. Configure reverse proxy (nginx/Apache)
4. Set up SSL certificates
5. Configure MongoDB replica set

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Server and client-side validation
- **CORS Protection**: Cross-origin request security
- **Rate Limiting**: Built-in protection against abuse

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m "Description"`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Bootstrap Team**: For the excellent CSS framework
- **AngularJS Community**: For the robust JavaScript framework
- **Twilio**: For reliable SMS services
- **Chart.js**: For beautiful data visualizations
- **MongoDB**: For flexible data storage

## 📞 Support

For issues and questions:

1. Check the logs in `public/logs/` directory
2. Use the built-in debug mode (`Ctrl + Shift + D`)
3. Open an issue on GitHub
4. Contact the development team

---

Made with ❤️ using Bootstrap 5 and modern web technologies
