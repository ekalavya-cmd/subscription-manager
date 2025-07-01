// twilio-test.js - Diagnostic script for Twilio SMS
// Save this as twilio-test.js in your project root

require("dotenv").config();
const twilio = require("twilio");

console.log("🔍 Twilio Diagnostic Tool\n");

// Check environment variables
console.log("📋 Environment Check:");
console.log(
  `TWILIO_ACCOUNT_SID: ${
    process.env.TWILIO_ACCOUNT_SID ? "✅ Set" : "❌ Missing"
  }`
);
console.log(
  `TWILIO_AUTH_TOKEN: ${
    process.env.TWILIO_AUTH_TOKEN ? "✅ Set" : "❌ Missing"
  }`
);
console.log(
  `TWILIO_PHONE_NUMBER: ${process.env.TWILIO_PHONE_NUMBER || "❌ Missing"}`
);
console.log(
  `USER_PHONE_NUMBER: ${process.env.USER_PHONE_NUMBER || "❌ Missing"}`
);
console.log("");

// Test Twilio client initialization
try {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  console.log("✅ Twilio client initialized successfully");

  // Test account access
  client.api
    .accounts(process.env.TWILIO_ACCOUNT_SID)
    .fetch()
    .then((account) => {
      console.log("✅ Account access verified");
      console.log(`Account Status: ${account.status}`);
      console.log(`Account Type: ${account.type}`);
      console.log("");

      // Test phone number validation
      return client.lookups.v1
        .phoneNumbers(process.env.USER_PHONE_NUMBER)
        .fetch();
    })
    .then((phoneNumber) => {
      console.log("✅ Destination phone number is valid");
      console.log(`Phone Number: ${phoneNumber.phoneNumber}`);
      console.log(`Country Code: ${phoneNumber.countryCode}`);
      console.log("");

      // Test sending a simple SMS
      console.log("📱 Attempting to send test SMS...");
      return client.messages.create({
        body: "[DIAGNOSTIC TEST] This is a test message from your Subscription Manager app.",
        from: process.env.TWILIO_PHONE_NUMBER,
        to: process.env.USER_PHONE_NUMBER,
      });
    })
    .then((message) => {
      console.log("✅ SMS sent successfully!");
      console.log(`Message SID: ${message.sid}`);
      console.log(`Status: ${message.status}`);
      console.log(`Direction: ${message.direction}`);
      console.log("");
      console.log("🎉 Twilio is working correctly!");
      console.log(
        "The issue might be in your application code, not Twilio setup."
      );
    })
    .catch((error) => {
      console.log("❌ SMS Test Failed:");
      console.log(`Error Code: ${error.code}`);
      console.log(`Error Message: ${error.message}`);
      console.log("");

      // Provide specific solutions based on error code
      switch (error.code) {
        case 20003:
          console.log("💡 Solution: Authentication failed");
          console.log("- Check your TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN");
          console.log("- Make sure there are no extra spaces or quotes");
          break;
        case 21211:
          console.log("💡 Solution: Invalid phone number");
          console.log(
            "- Check your USER_PHONE_NUMBER format (+country_code_number)"
          );
          console.log(
            "- For trial accounts, verify the destination phone number"
          );
          break;
        case 21614:
          console.log("💡 Solution: Unverified phone number (Trial Account)");
          console.log(
            "- Go to Twilio Console > Phone Numbers > Manage > Verified Caller IDs"
          );
          console.log(`- Add and verify: ${process.env.USER_PHONE_NUMBER}`);
          break;
        case 20429:
          console.log("💡 Solution: Rate limit exceeded");
          console.log("- Wait a few minutes before trying again");
          break;
        default:
          console.log("💡 Check Twilio Console for more details:");
          console.log("https://console.twilio.com/");
      }
    });
} catch (error) {
  console.log("❌ Failed to initialize Twilio client:");
  console.log(error.message);
  console.log("");
  console.log("💡 Check your environment variables in .env file");
}
