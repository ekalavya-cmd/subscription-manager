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

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  renewalDate: { type: Date, required: true },
  provider: { type: String, required: true },
  cancellationSteps: String,
  status: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

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

// Register endpoint
app.post(
  "/api/register",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info(`Registration attempt for username: ${username}`);

    try {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        logger.error(`Registration failed: User ${username} already exists`);
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
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

// Login endpoint
app.post(
  "/api/index",
  asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    logger.info(`Login attempt for username: ${username}`);

    try {
      const user = await User.findOne({ username });
      if (!user) {
        logger.error(`Login failed: User ${username} not found`);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        logger.error(`Login failed: Invalid password for user ${username}`);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ user: username }, JWT_SECRET, {
        expiresIn: "1h",
      });
      logger.info(`User logged in successfully: ${username}`);
      res.json({ token });
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
    const subscription = new Subscription({ ...req.body, user: req.user });
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

// Send SMS endpoint
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
      const message = await twilioClient.messages.create({
        body: body || "Subscription reminder from Subscription Manager",
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

// Client logs endpoint
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

// Schedule Renewal Reminders with enhanced logging
const ENABLE_SMS = process.env.ENABLE_SMS !== "false";
logger.info(`SMS reminders ${ENABLE_SMS ? "enabled" : "disabled"}`);

cron.schedule(
  "0 9 * * *", // Run daily at 9 AM
  async () => {
    logger.info("Running scheduled subscription reminder check");

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const oneWeekAgo = new Date(today);
      oneWeekAgo.setDate(today.getDate() - 7);

      const oneWeekFromToday = new Date(today);
      oneWeekFromToday.setDate(today.getDate() + 7);

      // Handle expired subscriptions
      const expiredSubscriptions = await Subscription.find({
        renewalDate: {
          $lt: today,
          $gte: oneWeekAgo,
        },
        status: { $ne: "canceled" },
      });

      logger.info(`Found ${expiredSubscriptions.length} expired subscriptions`);

      // Handle upcoming renewals
      const upcomingSubscriptions = await Subscription.find({
        renewalDate: {
          $gte: today,
          $lt: oneWeekFromToday,
        },
        status: "active",
      });

      logger.info(`Found ${upcomingSubscriptions.length} upcoming renewals`);

      if (ENABLE_SMS && twilioClient && process.env.USER_PHONE_NUMBER) {
        // Send expired subscription reminders
        for (const sub of expiredSubscriptions) {
          try {
            const reminderText = `Reminder: Your subscription for ${sub.name} has expired.`;
            await twilioClient.messages.create({
              body: reminderText,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: process.env.USER_PHONE_NUMBER,
            });
            logger.info(`Expired subscription reminder sent for: ${sub.name}`);
          } catch (error) {
            logger.error(
              `Failed to send expired reminder for ${sub.name}: ${error.message}`
            );
          }
        }

        // Send upcoming renewal reminders
        for (const sub of upcomingSubscriptions) {
          try {
            const renewalDate = new Date(sub.renewalDate);
            renewalDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor(
              (renewalDate - today) / (1000 * 60 * 60 * 24)
            );

            let reminderText = `Reminder: Your ${sub.name} subscription renews `;
            if (daysDiff === 0) {
              reminderText += "today!";
            } else if (daysDiff === 1) {
              reminderText += "tomorrow!";
            } else {
              reminderText += `in ${daysDiff} days!`;
            }

            await twilioClient.messages.create({
              body: reminderText,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: process.env.USER_PHONE_NUMBER,
            });

            logger.info(`Upcoming renewal reminder sent for: ${sub.name}`);
          } catch (error) {
            logger.error(
              `Failed to send upcoming reminder for ${sub.name}: ${error.message}`
            );
          }
        }
      }
    } catch (error) {
      logger.error(`Scheduled reminder check failed: ${error.message}`);
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata",
  }
);

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
