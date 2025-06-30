require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const twilio = require("twilio");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const fs = require("fs");

const app = express();

// Enhanced logging system
const createLogger = () => {
  const logsDir = path.join(__dirname, "public", "logs");
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const getLogFileName = (type) => {
    const today = new Date().toISOString().split("T")[0];
    return path.join(logsDir, `${type}-${today}.log`);
  };

  const writeLog = (type, message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}\n`;

    // Write to console
    console.log(`[${type.toUpperCase()}] ${message}`);

    // Write to file
    fs.appendFileSync(getLogFileName(type), logMessage);
    fs.appendFileSync(getLogFileName("app"), logMessage);
  };

  return {
    info: (message) => writeLog("info", message),
    error: (message) => writeLog("error", message),
    debug: (message) => writeLog("debug", message),
    api: (message) => writeLog("api", message),
    db: (message) => writeLog("db", message),
  };
};

const logger = createLogger();

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  logger.api(`${req.method} ${req.url} - Request received`);

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.api(`${req.method} ${req.url} - ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Route handlers
app.get("/", (req, res) => {
  logger.info("Serving login page");
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/app", (req, res) => {
  logger.info("Serving main application page");
  res.sendFile(path.join(__dirname, "views", "app.html"));
});

app.get("/register", (req, res) => {
  logger.info("Serving registration page");
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  logger.error("JWT_SECRET not found in environment variables");
  process.exit(1);
}

// MongoDB Connection with enhanced logging
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://localhost/subscription_manager")
  .then(() => {
    logger.db("MongoDB connected successfully");
  })
  .catch((err) => {
    logger.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

// User Schema with case-insensitive username index
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  usernameNormalized: { type: String, required: true, unique: true }, // For case-insensitive lookup
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create compound index for case-insensitive username lookup
userSchema.index({ usernameNormalized: 1 });

// Pre-save middleware to normalize username
userSchema.pre("save", function (next) {
  if (this.isModified("username")) {
    this.usernameNormalized = this.username.toLowerCase();
  }
  next();
});

const User = mongoose.model("User", userSchema);

// Updated Subscription Schema with start and end dates
const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  startDate: { type: Date, required: true }, // New field
  endDate: { type: Date, required: true }, // New field
  renewalDate: { type: Date, required: true }, // Keep for backward compatibility
  provider: { type: String, required: true },
  cancellationSteps: String,
  status: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

subscriptionSchema.index({ startDate: 1, endDate: 1 });
subscriptionSchema.index({ renewalDate: 1 });
subscriptionSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

// Twilio Setup with error handling
let twilioClient;
try {
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    logger.info("Twilio client initialized successfully");
  } else {
    logger.error("Twilio credentials not found in environment variables");
  }
} catch (error) {
  logger.error(`Twilio initialization failed: ${error.message}`);
}

// Middleware for JWT Authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    logger.error("Authentication failed: No token provided");
    return res.redirect("/");
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      logger.error(`Authentication failed: ${err.message}`);
      return res.redirect("/");
    }
    req.user = user.user;
    next();
  });
}

// Enhanced error handling wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Helper function to capitalize first letter
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// Register endpoint with normalized username
app.post(
  "/api/register",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info(`Registration attempt for username: ${username}`);

    try {
      // Check if user exists (case-insensitive)
      const existingUser = await User.findOne({
        usernameNormalized: username.toLowerCase(),
      });

      if (existingUser) {
        logger.error(
          `Registration failed: User ${username} already exists (case-insensitive)`
        );
        return res.status(400).json({ message: "Username already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({
        username,
        password: hashedPassword,
      });
      await user.save();

      logger.info(`User registered successfully: ${username}`);
      res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      res
        .status(500)
        .json({ message: "Error registering user", error: error.message });
    }
  })
);

// Login endpoint with case-insensitive username lookup
app.post(
  "/api/index",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info(`Login attempt for username: ${username}`);

    try {
      // Find user by normalized username (case-insensitive)
      const user = await User.findOne({
        usernameNormalized: username.toLowerCase(),
      });

      if (!user) {
        logger.error(`Login failed: User ${username} not found`);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.error(`Login failed: Invalid password for user ${username}`);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Use the original username for the token and response
      const token = jwt.sign({ user: user.username }, JWT_SECRET, {
        expiresIn: "1h",
      });

      logger.info(
        `User logged in successfully: ${username} (original: ${user.username})`
      );
      res.json({
        token,
        username: user.username, // Send original username for display
        displayName: capitalizeFirstLetter(user.username), // Send capitalized version
      });
    } catch (error) {
      logger.error(`Login error: ${error.message}`);
      res
        .status(500)
        .json({ message: "Error logging in", error: error.message });
    }
  })
);

// Get subscriptions
app.get(
  "/api/subscriptions",
  authenticateToken,
  asyncHandler(async (req, res) => {
    logger.db(`Fetching subscriptions for user: ${req.user}`);
    const subscriptions = await Subscription.find({ user: req.user });
    logger.db(
      `Found ${subscriptions.length} subscriptions for user: ${req.user}`
    );
    res.json(subscriptions);
  })
);

// Create subscription
app.post(
  "/api/subscriptions",
  authenticateToken,
  asyncHandler(async (req, res) => {
    logger.db(`Creating subscription for user: ${req.user}`);

    // Ensure dates are properly set
    const subscriptionData = { ...req.body, user: req.user };

    // Set renewal date to end date if not provided
    if (!subscriptionData.renewalDate && subscriptionData.endDate) {
      subscriptionData.renewalDate = subscriptionData.endDate;
    }

    // If no start/end dates provided, use renewal date logic for backward compatibility
    if (!subscriptionData.startDate && subscriptionData.renewalDate) {
      const renewalDate = new Date(subscriptionData.renewalDate);
      subscriptionData.startDate = new Date(renewalDate.getFullYear(), 0, 1); // Start of year
      subscriptionData.endDate = subscriptionData.renewalDate; // End date is renewal date
    }

    const subscription = new Subscription(subscriptionData);
    await subscription.save();
    logger.db(`Subscription created successfully: ${subscription.name}`);
    res.sendStatus(201);
  })
);

// Update subscription
app.put(
  "/api/subscriptions/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.db(`Updating subscription ${id} for user: ${req.user}`);

    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, user: req.user },
      req.body,
      { new: true, runValidators: true }
    );

    if (!subscription) {
      logger.error(`Subscription not found: ${id}`);
      return res.status(404).json({ message: "Subscription not found" });
    }

    logger.db(`Subscription updated successfully: ${subscription.name}`);
    res.json(subscription);
  })
);

// Delete subscription
app.delete(
  "/api/subscriptions/:id",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    logger.db(`Deleting subscription ${id} for user: ${req.user}`);

    const result = await Subscription.findOneAndDelete({
      _id: id,
      user: req.user,
    });
    if (!result) {
      logger.error(`Subscription not found for deletion: ${id}`);
      return res.status(404).json({ message: "Subscription not found" });
    }

    logger.db(`Subscription deleted successfully: ${result.name}`);
    res.sendStatus(200);
  })
);

// Send SMS endpoint (enhanced with better error handling)
app.post(
  "/api/send-sms",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { to, body } = req.body;

    logger.info(`SMS send request from user: ${req.user} to: ${to}`);

    // Validate phone number format
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    if (!phoneRegex.test(to)) {
      logger.error(`Invalid phone number format: ${to}`);
      return res.status(400).json({
        message:
          "Invalid phone number format. Use E.164 format (e.g., +911234567890).",
      });
    }

    if (!twilioClient) {
      logger.error("Twilio client not initialized");
      return res.status(500).json({ message: "SMS service not available" });
    }

    try {
      const userName = capitalizeFirstLetter(req.user);
      const messageWithUser = `Hi ${userName}, ${
        body || "Subscription reminder from Subscription Manager"
      }`;

      const message = await twilioClient.messages.create({
        body: messageWithUser,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
      });

      logger.info(`SMS sent successfully. SID: ${message.sid}`);
      res
        .status(200)
        .json({ message: "SMS sent successfully", sid: message.sid });
    } catch (error) {
      logger.error(`SMS sending failed: ${error.message}`);
      res
        .status(500)
        .json({ message: "Error sending SMS", error: error.message });
    }
  })
);

// Test SMS reminders endpoint (for manual testing)
app.post(
  "/api/test-sms-reminders",
  authenticateToken,
  asyncHandler(async (req, res) => {
    logger.info(`Manual SMS reminder test triggered by user: ${req.user}`);

    if (!ENABLE_SMS || !twilioClient || !process.env.USER_PHONE_NUMBER) {
      return res.status(400).json({
        message: "SMS service not properly configured",
      });
    }

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);

      const oneWeekFromToday = new Date(today);
      oneWeekFromToday.setDate(today.getDate() + 7);

      // Find user's subscriptions that need reminders
      const expiredSubscriptions = await Subscription.find({
        user: req.user,
        endDate: {
          $lt: today,
          $gte: oneWeekAgo,
        },
        status: { $ne: "canceled" },
      });

      const upcomingSubscriptions = await Subscription.find({
        user: req.user,
        endDate: {
          $gte: today,
          $lte: oneWeekFromToday,
        },
        status: "active",
      });

      const results = {
        expired: [],
        upcoming: [],
        errors: [],
      };

      // Test expired subscription reminders
      for (const sub of expiredSubscriptions) {
        try {
          const daysSinceExpired = Math.floor(
            (today - new Date(sub.endDate)) / (1000 * 60 * 60 * 24)
          );
          const userName = capitalizeFirstLetter(sub.user);

          const reminderText = `[TEST] Hi ${userName}, your subscription for ${
            sub.name
          } expired ${daysSinceExpired} day${
            daysSinceExpired !== 1 ? "s" : ""
          } ago. Please renew if needed.`;

          const message = await twilioClient.messages.create({
            body: reminderText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.USER_PHONE_NUMBER,
          });

          results.expired.push({
            subscription: sub.name,
            daysSinceExpired,
            sid: message.sid,
          });

          logger.info(`Test expired reminder sent for: ${sub.name}`);
        } catch (error) {
          results.errors.push(
            `Failed to send expired reminder for ${sub.name}: ${error.message}`
          );
          logger.error(
            `Test expired reminder failed for ${sub.name}: ${error.message}`
          );
        }
      }

      // Test upcoming renewal reminders
      for (const sub of upcomingSubscriptions) {
        try {
          const endDate = new Date(sub.endDate);
          endDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor(
            (endDate - today) / (1000 * 60 * 60 * 24)
          );

          const userName = capitalizeFirstLetter(sub.user);
          let reminderText = `[TEST] Hi ${userName}, your ${sub.name} subscription `;

          if (daysDiff === 0) {
            reminderText += "expires today! Don't forget to renew.";
          } else if (daysDiff === 1) {
            reminderText += "expires tomorrow! Time to renew.";
          } else {
            reminderText += `expires in ${daysDiff} days. Plan your renewal.`;
          }

          const message = await twilioClient.messages.create({
            body: reminderText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.USER_PHONE_NUMBER,
          });

          results.upcoming.push({
            subscription: sub.name,
            daysUntilExpiry: daysDiff,
            sid: message.sid,
          });

          logger.info(`Test upcoming reminder sent for: ${sub.name}`);
        } catch (error) {
          results.errors.push(
            `Failed to send upcoming reminder for ${sub.name}: ${error.message}`
          );
          logger.error(
            `Test upcoming reminder failed for ${sub.name}: ${error.message}`
          );
        }
      }

      res.status(200).json({
        message: "SMS reminder test completed",
        results: results,
        summary: {
          expiredReminders: results.expired.length,
          upcomingReminders: results.upcoming.length,
          errors: results.errors.length,
        },
      });
    } catch (error) {
      logger.error(`SMS reminder test failed: ${error.message}`);
      res.status(500).json({
        message: "SMS reminder test failed",
        error: error.message,
      });
    }
  })
);

// Get SMS configuration status
app.get(
  "/api/sms-status",
  authenticateToken,
  asyncHandler(async (req, res) => {
    logger.info(`SMS status check by user: ${req.user}`);

    const status = {
      enabled: ENABLE_SMS,
      schedule: SMS_SCHEDULE,
      twilioConfigured: !!twilioClient,
      phoneNumberSet: !!process.env.USER_PHONE_NUMBER,
      nextScheduledRun: null,
      currentTime: new Date().toISOString(),
      timezone: "Asia/Kolkata",
    };

    // Calculate next scheduled run based on schedule type
    if (SMS_SCHEDULE === "daily") {
      const now = new Date();
      const nextRun = new Date();
      nextRun.setHours(9, 0, 0, 0); // 9 AM

      // If it's past 9 AM today, schedule for tomorrow
      if (now.getHours() >= 9) {
        nextRun.setDate(nextRun.getDate() + 1);
      }

      status.nextScheduledRun = nextRun.toISOString();
    } else if (SMS_SCHEDULE === "minute") {
      const now = new Date();
      const nextRun = new Date(now.getTime() + 60000); // Next minute
      status.nextScheduledRun = nextRun.toISOString();
    } else if (SMS_SCHEDULE === "disabled") {
      status.nextScheduledRun = "Disabled";
    }

    // Count current subscriptions that would trigger reminders
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);

      const oneWeekFromToday = new Date(today);
      oneWeekFromToday.setDate(today.getDate() + 7);

      const expiredCount = await Subscription.countDocuments({
        user: req.user,
        endDate: { $lt: today, $gte: oneWeekAgo },
        status: { $ne: "canceled" },
      });

      const upcomingCount = await Subscription.countDocuments({
        user: req.user,
        endDate: { $gte: today, $lte: oneWeekFromToday },
        status: "active",
      });

      status.currentReminders = {
        expired: expiredCount,
        upcoming: upcomingCount,
        total: expiredCount + upcomingCount,
      };
    } catch (error) {
      logger.error(`Failed to count reminder subscriptions: ${error.message}`);
      status.currentReminders = { error: "Failed to count reminders" };
    }

    res.status(200).json(status);
  })
);
app.post(
  "/api/client-logs",
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { logs, isUnload, sessionId } = req.body;

    logger.info(
      `Received ${logs.length} client logs from user: ${req.user}, session: ${sessionId}`
    );

    // Process client logs
    logs.forEach((logEntry) => {
      const clientLogMessage = `[CLIENT] [${req.user}] [${sessionId}] ${logEntry.message}`;

      switch (logEntry.level) {
        case "error":
          logger.error(clientLogMessage, {
            meta: logEntry.meta,
            url: logEntry.url,
            userAgent: logEntry.userAgent,
          });
          break;
        case "warn":
          logger.error(`[WARN] ${clientLogMessage}`, {
            meta: logEntry.meta,
            url: logEntry.url,
          });
          break;
        case "debug":
          logger.debug(clientLogMessage, { meta: logEntry.meta });
          break;
        default:
          logger.info(clientLogMessage, { meta: logEntry.meta });
      }
    });

    res.status(200).json({ message: "Client logs received successfully" });
  })
);

// Global error handler
app.use((error, req, res, next) => {
  logger.error(`Unhandled error: ${error.message}`);
  logger.error(`Stack trace: ${error.stack}`);
  res.status(500).json({
    message: "Internal server error",
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// Schedule Renewal Reminders with enhanced logging and user names
const ENABLE_SMS = process.env.ENABLE_SMS !== "false";
const SMS_SCHEDULE = process.env.SMS_SCHEDULE || "daily"; // Options: "daily", "minute", "disabled"
logger.info(`SMS reminders ${ENABLE_SMS ? "enabled" : "disabled"}`);
logger.info(`SMS schedule mode: ${SMS_SCHEDULE}`);

// Function to check and send SMS reminders
const checkAndSendReminders = async () => {
  logger.info("Running scheduled subscription reminder check");

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(today.getDate() - 7);

    const oneWeekFromToday = new Date(today);
    oneWeekFromToday.setDate(today.getDate() + 7);

    // Handle expired subscriptions (endDate has passed, check for 1 week after expiry)
    const expiredSubscriptions = await Subscription.find({
      endDate: {
        $lt: today,
        $gte: oneWeekAgo,
      },
      status: { $ne: "canceled" },
    });

    logger.info(`Found ${expiredSubscriptions.length} expired subscriptions`);

    // Handle upcoming renewals (endDate is within 1 week)
    const upcomingSubscriptions = await Subscription.find({
      endDate: {
        $gte: today,
        $lte: oneWeekFromToday,
      },
      status: "active",
    });

    logger.info(`Found ${upcomingSubscriptions.length} upcoming renewals`);

    if (ENABLE_SMS && twilioClient && process.env.USER_PHONE_NUMBER) {
      const schedulePrefix = SMS_SCHEDULE === "minute" ? "[TEST-MINUTE] " : "";

      // Send expired subscription reminders (for 1 week after expiry)
      for (const sub of expiredSubscriptions) {
        try {
          const daysSinceExpired = Math.floor(
            (today - new Date(sub.endDate)) / (1000 * 60 * 60 * 24)
          );
          const userName = capitalizeFirstLetter(sub.user);

          const reminderText = `${schedulePrefix}Hi ${userName}, your subscription for ${
            sub.name
          } expired ${daysSinceExpired} day${
            daysSinceExpired !== 1 ? "s" : ""
          } ago. Please renew if needed.`;

          await twilioClient.messages.create({
            body: reminderText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.USER_PHONE_NUMBER,
          });
          logger.info(
            `Expired subscription reminder sent for: ${sub.name} (User: ${sub.user}) [Schedule: ${SMS_SCHEDULE}]`
          );
        } catch (error) {
          logger.error(
            `Failed to send expired reminder for ${sub.name}: ${error.message}`
          );
        }
      }

      // Send upcoming renewal reminders (1 week before expiry)
      for (const sub of upcomingSubscriptions) {
        try {
          const endDate = new Date(sub.endDate);
          endDate.setHours(0, 0, 0, 0);
          const daysDiff = Math.floor(
            (endDate - today) / (1000 * 60 * 60 * 24)
          );

          const userName = capitalizeFirstLetter(sub.user);
          let reminderText = `${schedulePrefix}Hi ${userName}, your ${sub.name} subscription `;

          if (daysDiff === 0) {
            reminderText += "expires today! Don't forget to renew.";
          } else if (daysDiff === 1) {
            reminderText += "expires tomorrow! Time to renew.";
          } else {
            reminderText += `expires in ${daysDiff} days. Plan your renewal.`;
          }

          await twilioClient.messages.create({
            body: reminderText,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: process.env.USER_PHONE_NUMBER,
          });

          logger.info(
            `Upcoming renewal reminder sent for: ${sub.name} (User: ${sub.user}) [Schedule: ${SMS_SCHEDULE}]`
          );
        } catch (error) {
          logger.error(
            `Failed to send upcoming reminder for ${sub.name}: ${error.message}`
          );
        }
      }

      // Log summary
      const totalSent =
        expiredSubscriptions.length + upcomingSubscriptions.length;
      if (totalSent > 0) {
        logger.info(
          `SMS reminder batch complete: ${totalSent} messages sent [Schedule: ${SMS_SCHEDULE}]`
        );
      } else {
        logger.info(
          `No SMS reminders needed at this time [Schedule: ${SMS_SCHEDULE}]`
        );
      }
    } else {
      if (!ENABLE_SMS) {
        logger.info("SMS reminders disabled via ENABLE_SMS setting");
      } else if (!twilioClient) {
        logger.error("Twilio client not initialized - check credentials");
      } else if (!process.env.USER_PHONE_NUMBER) {
        logger.error("USER_PHONE_NUMBER not set in environment");
      }
    }
  } catch (error) {
    logger.error(`Scheduled reminder check failed: ${error.message}`);
  }
};

// Set up cron schedules based on SMS_SCHEDULE setting
if (SMS_SCHEDULE === "daily") {
  // Production schedule: Daily at 9 AM IST
  cron.schedule("0 9 * * *", checkAndSendReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });
  logger.info("SMS reminders scheduled: Daily at 9:00 AM IST");
} else if (SMS_SCHEDULE === "minute") {
  // Testing schedule: Every minute
  cron.schedule("* * * * *", checkAndSendReminders, {
    scheduled: true,
    timezone: "Asia/Kolkata",
  });
  logger.info("SMS reminders scheduled: Every minute (TESTING MODE)");
} else if (SMS_SCHEDULE === "disabled") {
  logger.info("SMS reminder scheduling disabled via SMS_SCHEDULE setting");
} else {
  logger.error(
    `Invalid SMS_SCHEDULE value: ${SMS_SCHEDULE}. Use 'daily', 'minute', or 'disabled'`
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || "development"}`);
  logger.info(
    `MongoDB: ${
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    }`
  );
  logger.info(`Twilio: ${twilioClient ? "Enabled" : "Disabled"}`);
});
