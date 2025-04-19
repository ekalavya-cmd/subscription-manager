require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const cron = require("node-cron");
const twilio = require("twilio");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
const app = express();

app.use(cors());
app.use(express.json());

// Serve static files and handle routing
app.use(express.static(path.join(__dirname)));
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/app", (req, res) => res.sendFile(path.join(__dirname, "app.html")));
app.get("/register", (req, res) =>
  res.sendFile(path.join(__dirname, "register.html"))
);

const JWT_SECRET = process.env.JWT_SECRET;

// MongoDB Connection
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://localhost/subscription_manager");

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  name: String,
  cost: Number,
  renewalDate: Date,
  provider: String,
  cancellationSteps: String,
  status: String,
  user: { type: String, required: true }, // Add user field
});
subscriptionSchema.index({ renewalDate: 1 });
const Subscription = mongoose.model("Subscription", subscriptionSchema);

// Twilio Setup
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Middleware for JWT Authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.redirect("/");
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.redirect("/");
    req.user = user.user; // Extract username from token
    next();
  });
}

// Register endpoint
app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login endpoint
app.post("/api/index", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ user: username }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error });
  }
});

// APIs
app.get("/api/subscriptions", authenticateToken, async (req, res) => {
  const subscriptions = await Subscription.find({ user: req.user });
  res.json(subscriptions);
});

app.post("/api/subscriptions", authenticateToken, async (req, res) => {
  const subscription = new Subscription({ ...req.body, user: req.user });
  await subscription.save();
  res.sendStatus(201);
});

app.put("/api/subscriptions/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const updatedSubscription = req.body;
  try {
    const subscription = await Subscription.findOneAndUpdate(
      { _id: id, user: req.user },
      updatedSubscription,
      { new: true, runValidators: true }
    );
    if (!subscription)
      return res.status(404).json({ message: "Subscription not found" });
    res.json(subscription);
  } catch (error) {
    res.status(500).json({ message: "Error updating subscription", error });
  }
});

app.delete("/api/subscriptions/:id", authenticateToken, async (req, res) => {
  await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user });
  res.sendStatus(200);
});

// New endpoint to send SMS
app.post("/api/send-sms", authenticateToken, async (req, res) => {
  const { to, body } = req.body;

  // Validate phone number format (supports +91 and other E.164 formats)
  const phoneRegex = /^\+[1-9]\d{9,14}$/;
  if (!phoneRegex.test(to)) {
    return res.status(400).json({
      message:
        "Invalid phone number format. Use E.164 format (e.g., +911234567890).",
    });
  }

  try {
    const message = await twilioClient.messages.create({
      body: body || "Subscription reminder from Subscription Manager",
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to,
    });
    res
      .status(200)
      .json({ message: "SMS sent successfully", sid: message.sid });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error sending SMS", error: error.message });
  }
});

// Schedule Renewal Reminders
const ENABLE_SMS = process.env.ENABLE_SMS !== "false"; // Default to true unless explicitly set to 'false' in .env
cron.schedule(
  "* * * * *",
  async () => {
    const today = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const todayDate = new Date(today);
    todayDate.setHours(0, 0, 0, 0); // Normalize to start of day in IST
    const oneWeekAgo = new Date(todayDate);
    oneWeekAgo.setDate(todayDate.getDate() - 7);
    const oneWeekFromToday = new Date(todayDate);
    oneWeekFromToday.setDate(todayDate.getDate() + 7);

    // Handle expired subscriptions (within last week)
    const expiredSubscriptions = await Subscription.find({
      renewalDate: {
        $lt: todayDate, // Expired subscriptions
        $gte: oneWeekAgo, // Within last week
      },
      status: { $ne: "canceled" }, // Exclude canceled subscriptions
    });

    const currentDateObj = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    if (ENABLE_SMS) {
      expiredSubscriptions.forEach((sub) => {
        const reminderText = `Reminder: Your subscription for ${sub.name} has been expired.`;
        twilioClient.messages.create({
          body: reminderText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.USER_PHONE_NUMBER,
        });
      });
    }

    // Handle upcoming renewals (including today)
    const upcomingSubscriptions = await Subscription.find({
      renewalDate: {
        $gte: todayDate,
        $lt: oneWeekFromToday,
      },
      status: "active",
    });

    if (ENABLE_SMS) {
      upcomingSubscriptions.forEach((sub) => {
        const renewalDate = new Date(sub.renewalDate).setHours(0, 0, 0, 0); // Normalize renewal date
        const daysDiff = Math.floor(
          (renewalDate - todayDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        // Convert cost from USD to INR (updated rate: 1 USD = 85.39 INR)
        const costInINR = Math.round(sub.cost * 85.39);
        let reminderText = `Reminder: Your ${sub.name} subscription renews `;
        if (daysDiff === 0) {
          reminderText += "today!";
        } else if (daysDiff === 1) {
          reminderText += "tomorrow!";
        } else {
          reminderText += `in ${daysDiff} days!`;
        }

        twilioClient.messages.create({
          body: reminderText,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.USER_PHONE_NUMBER,
        });
      });
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // Explicitly set IST time zone
  }
);

app.listen(3000, () => console.log("Server running on port 3000"));
