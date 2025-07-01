# Subscription Manager

A modern web application built with AngularJS and Bootstrap to manage subscriptions, including adding, editing, deleting, and sending SMS reminders. The app features a responsive design, comprehensive logging, cost tracking with charts, and user authentication.

## ✨ Features

- **🔐 User Authentication**: Secure registration and login with JWT tokens
- **📊 Subscription Management**: Add, edit, delete, and view subscription details
- **💰 Cost Tracking**: Visualize monthly costs with interactive Chart.js charts
- **📱 SMS Reminders**: Send renewal reminders using Twilio integration
- **🎨 Modern UI**: Responsive Bootstrap 5 design with custom styling
- **🐛 Advanced Debugging**: Comprehensive client and server-side logging with file export
- **⚡ Real-time Validation**: Form validation with immediate feedback
- **📈 Dashboard Analytics**: Quick overview of subscription statistics
- **🗄️ Database Management**: MongoDB integration with Compass support

## 🛠️ Technologies Used

- **Frontend**: AngularJS 1.8.2, Bootstrap 5.3.0, Chart.js
- **Backend**: Node.js, Express.js, Winston Logger
- **Database**: MongoDB with Mongoose ODM
- **Database Tool**: MongoDB Compass for visual database management
- **Authentication**: JWT (JSON Web Tokens) with bcrypt hashing
- **SMS Service**: Twilio API for automated reminders
- **Styling**: Bootstrap 5 + Custom CSS with gradients and animations
- **Development**: VS Code with extensions, Nodemon for auto-restart

## 📋 Prerequisites

- **Node.js**: Version 16+ ([Download](https://nodejs.org/))
- **MongoDB**: Community Server ([Download](https://www.mongodb.com/try/download/community))
- **MongoDB Compass**: Visual database management tool ([Download](https://www.mongodb.com/try/download/compass))
- **Twilio Account**: For SMS functionality ([Sign up](https://www.twilio.com/))
- **VS Code**: Recommended editor ([Download](https://code.visualstudio.com/))
- **Windows 11**: Target development environment

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

### 3. Create Required Directory Structure

```cmd
mkdir public\css public\js public\logs views
```

### 4. Environment Configuration

Create `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/subscription_manager
DB_NAME=subscription_manager

# JWT Secret (generate using: node generateKey.js)
JWT_SECRET=your_generated_jwt_secret_here

# Twilio Configuration (REQUIRED for SMS functionality)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Phone number where reminders will be sent
USER_PHONE_NUMBER=your_personal_phone_number

# SMS Configuration
ENABLE_SMS=true
SMS_SCHEDULE=disabled

# Logging Configuration
LOG_LEVEL=debug
LOG_TO_FILE=true
LOG_TO_CONSOLE=true
```

### 5. Generate JWT Secret

```cmd
node generateKey.js
```

Copy the generated key to your `.env` file.

### 6. Start MongoDB Service

```cmd
# If MongoDB is installed as a Windows service
net start MongoDB

# Or start manually with custom data directory
mongod --dbpath "C:\data\db" --port 27017
```

### 7. Database Setup with MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect to Database**:
   - Connection String: `mongodb://localhost:27017`
   - Database Name: `subscription_manager`
3. **Verify Collections**:
   - `users` - User authentication data
   - `subscriptions` - Subscription records
4. **Import Sample Data** (optional):
   - Use the import feature in Compass for test data

### 8. Run the Application

```cmd
# Development mode with auto-restart and detailed logging
npm run dev

# Production mode
npm start

# Generate JWT secret
npm run generate-key
```

### 9. Access the Application

Open your browser and navigate to `http://localhost:3000`

## 📁 Complete Project Structure

```
bootstrap-subscription-manager/
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

## 🐛 Advanced Debugging Features

### Client-Side Debugging

- **Debug Shortcuts**:
  - `Ctrl + Shift + L`: Open logs modal with real-time updates
  - `Ctrl + Shift + D`: Toggle debug mode with detailed information
  - `Ctrl + Shift + R`: Reset all client-side logs
- **Performance Monitoring**:
  - Page load time tracking
  - API response time measurement
  - Memory usage indicators
- **Log Export**: Download logs as JSON or text files for analysis
- **Error Boundaries**: Comprehensive error catching and reporting

### Server-Side Logging with Winston

- **Structured Logging**: JSON format with timestamps and metadata
- **Log Rotation**: Daily log files with automatic archiving
- **Multiple Transport Types**:
  - File-based logs in `public/logs/`
  - Console output for development
  - Error-only logs for quick debugging
- **Performance Metrics**: Request duration and database query timing

### Log File Descriptions

| File                   | Purpose                   | Contains                                          |
| ---------------------- | ------------------------- | ------------------------------------------------- |
| `app-YYYY-MM-DD.log`   | General application logs  | Server startup, user actions, system events       |
| `error-YYYY-MM-DD.log` | Error-specific logs       | Stack traces, error conditions, failed operations |
| `api-YYYY-MM-DD.log`   | API request/response logs | HTTP requests, response codes, payload sizes      |
| `db-YYYY-MM-DD.log`    | Database operation logs   | MongoDB queries, connection status, data changes  |

## 🗄️ Database Management with MongoDB Compass

### Connection Setup

1. **Open MongoDB Compass**
2. **New Connection**:
   - Connection String: `mongodb://localhost:27017`
   - Or use individual fields:
     - Hostname: `localhost`
     - Port: `27017`
     - Authentication: None (for local development)

### Database Structure

#### `subscription_manager` Database

- **users** Collection:

  ```json
  {
    "_id": ObjectId,
    "username": String,
    "usernameNormalized": String (lowercase),
    "password": String (bcrypt hashed),
    "createdAt": Date
  }
  ```

- **subscriptions** Collection:
  ```json
  {
    "_id": ObjectId,
    "name": String,
    "cost": Number,
    "startDate": Date,
    "endDate": Date,
    "renewalDate": Date,
    "provider": String,
    "status": String,
    "userId": ObjectId,
    "cancellationSteps": String,
    "createdAt": Date,
    "updatedAt": Date
  }
  ```

### Database Operations in Compass

- **View Data**: Browse collections with filtering and sorting
- **Query Builder**: Visual query construction
- **Data Import/Export**: JSON, CSV support for data migration
- **Index Management**: View and create database indexes
- **Performance**: Query performance analysis and optimization
- **Real-time Monitoring**: Live connection and operation tracking

### Sample Queries for Testing

```javascript
// Find all active subscriptions
db.subscriptions.find({ status: "active" });

// Find subscriptions expiring in next 7 days
db.subscriptions.find({
  renewalDate: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});

// Calculate total monthly cost for a user
db.subscriptions.aggregate([
  { $match: { status: "active" } },
  { $group: { _id: null, totalCost: { $sum: "$cost" } } },
]);
```

## 🔧 VS Code Development Setup

### Recommended Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.js-debug",
    "mongodb.mongodb-vscode",
    "humao.rest-client",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### Launch Configuration for Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Subscription Manager",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/server.js",
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "restart": true,
      "runtimeExecutable": "nodemon",
      "runtimeArgs": ["--inspect"]
    }
  ]
}
```

### VS Code Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development Server",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "new"
      }
    },
    {
      "label": "Generate JWT Secret",
      "type": "shell",
      "command": "node generateKey.js",
      "group": "build"
    }
  ]
}
```

### Debugging Workflow in VS Code

1. **Set Breakpoints**: Click in the gutter next to line numbers in `server.js`
2. **Launch Debugger**: Press `F5` or use the Debug view
3. **Inspect Variables**: Hover over variables or use the Variables panel
4. **Debug Console**: Execute JavaScript expressions during debugging
5. **Call Stack**: Navigate through function calls
6. **Watch Expressions**: Monitor specific variables or expressions

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

## 🚀 Deployment Guide

### Local Development

```cmd
# Install dependencies
npm install

# Generate JWT secret
npm run generate-key

# Start development server with auto-restart
npm run dev
```

### Production Deployment

1. **Environment Setup**:

   ```cmd
   set NODE_ENV=production
   ```

2. **Process Management with PM2**:

   ```cmd
   npm install -g pm2
   pm2 start server.js --name "subscription-manager"
   pm2 save
   pm2 startup
   ```

3. **Database Configuration**:

   - Set up MongoDB replica set for high availability
   - Configure MongoDB authentication
   - Set up regular backups

4. **Reverse Proxy Configuration** (nginx example):

   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

5. **SSL Certificate Setup**:
   ```cmd
   # Using Let's Encrypt
   certbot --nginx -d yourdomain.com
   ```

## 🧪 Testing and Quality Assurance

### Manual Testing Checklist

- [ ] User registration and login functionality
- [ ] Subscription CRUD operations
- [ ] SMS sending functionality
- [ ] Chart rendering and data visualization
- [ ] Responsive design across devices
- [ ] Error handling and validation
- [ ] Log file generation and accessibility

### API Testing with REST Client

Create `tests/api.http` for VS Code REST Client:

```http
### Register User
POST http://localhost:3000/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}

### Login User
POST http://localhost:3000/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "testpass123"
}

### Get Subscriptions
GET http://localhost:3000/subscriptions
Authorization: Bearer {{authToken}}
```

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
- **VS Code Team**: For the outstanding development environment

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
2. **Enable Debug Mode**: Use `Ctrl + Shift + D` for detailed client-side debugging
3. **MongoDB Compass**: Use the visual interface to inspect database state
4. **VS Code Debugging**: Set breakpoints and use the integrated debugger
5. **GitHub Issues**: Open an issue with detailed reproduction steps
6. **Documentation**: Refer to official documentation for dependencies

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

_Optimized for Windows 11 development with VS Code and MongoDB Compass_
