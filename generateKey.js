const crypto = require("crypto");
const secureKey = crypto.randomBytes(32).toString("hex");
console.log("Generated JWT Secret Key:", secureKey);
