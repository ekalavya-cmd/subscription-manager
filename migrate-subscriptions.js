// Migration script to update existing subscriptions with start/end dates
require("dotenv").config();
const mongoose = require("mongoose");

// Connect to MongoDB
mongoose.set("strictQuery", true);
mongoose
  .connect("mongodb://localhost/subscription_manager")
  .then(() => {
    console.log("MongoDB connected for migration");
    runMigration();
  })
  .catch((err) => {
    console.error(`MongoDB connection failed: ${err.message}`);
    process.exit(1);
  });

// Subscription Schema
const subscriptionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  cost: { type: Number, required: true },
  startDate: { type: Date },
  endDate: { type: Date },
  renewalDate: { type: Date, required: true },
  provider: { type: String, required: true },
  cancellationSteps: String,
  status: { type: String, required: true },
  user: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Subscription = mongoose.model("Subscription", subscriptionSchema);

async function runMigration() {
  try {
    console.log("Starting subscription migration...");

    // Find all subscriptions without start/end dates
    const subscriptionsToUpdate = await Subscription.find({
      $or: [{ startDate: { $exists: false } }, { endDate: { $exists: false } }],
    });

    console.log(
      `Found ${subscriptionsToUpdate.length} subscriptions to update`
    );

    let updatedCount = 0;

    for (const subscription of subscriptionsToUpdate) {
      const renewalDate = new Date(subscription.renewalDate);

      // Set start date to beginning of the year
      const startDate = new Date(renewalDate.getFullYear(), 0, 1);

      // Set end date to the renewal date (since end date is now the renewal date)
      const endDate = renewalDate;

      await Subscription.updateOne(
        { _id: subscription._id },
        {
          $set: {
            startDate: startDate,
            endDate: endDate,
            updatedAt: new Date(),
          },
        }
      );

      updatedCount++;
      console.log(
        `Updated subscription: ${subscription.name} (${subscription._id})`
      );
    }

    console.log(`Migration completed! Updated ${updatedCount} subscriptions.`);

    // Also update users to add normalized username field
    await migrateUsers();

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  }
}

async function migrateUsers() {
  try {
    console.log("Starting user migration for case-insensitive usernames...");

    // User Schema
    const userSchema = new mongoose.Schema({
      username: { type: String, required: true, unique: true },
      usernameNormalized: { type: String },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    });

    const User = mongoose.model("User", userSchema);

    // Find all users without normalized username OR where it's null/undefined
    const usersToUpdate = await User.find({
      $or: [
        { usernameNormalized: { $exists: false } },
        { usernameNormalized: null },
        { usernameNormalized: "" },
      ],
    });

    console.log(`Found ${usersToUpdate.length} users to update`);

    let userUpdatedCount = 0;

    for (const user of usersToUpdate) {
      try {
        await User.updateOne(
          { _id: user._id },
          {
            $set: {
              usernameNormalized: user.username.toLowerCase(),
            },
          }
        );

        userUpdatedCount++;
        console.log(`Updated user: ${user.username} (${user._id})`);
      } catch (updateError) {
        console.error(
          `Failed to update user ${user.username}: ${updateError.message}`
        );
      }
    }

    console.log(`User migration completed! Updated ${userUpdatedCount} users.`);
  } catch (error) {
    console.error("User migration failed:", error.message);
  }
}
