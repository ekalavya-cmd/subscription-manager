# Subscription Manager

A web application built with AngularJS to manage subscriptions, including adding, editing, deleting, and sending SMS reminders. The app features a responsive design, cost tracking with charts, and user authentication.

## Features

- **User Authentication**: Register and log in to manage subscriptions securely.
- **Subscription Management**: Add, edit, delete, and view subscription details (name, cost in INR, renewal date, provider, status).
- **Cost Overview**: Visualize monthly costs with a Chart.js bar chart.
- **SMS Reminders**: Send renewal reminders using Twilio integration.
- **Smooth UI**: Includes smooth scrolling for editing, dynamic form clearing/canceling, and styled with Tailwind CSS.
- **Validation**: Ensures all fields are filled and restricts renewal dates to 2025.

## Technologies Used

- **Frontend**: AngularJS 1.8.2, HTML, Tailwind CSS 2.2.19, Chart.js
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **SMS Service**: Twilio
- **Other**: JavaScript, HTTP requests with $http

## Prerequisites

- Node.js and npm installed
- MongoDB installed and running
- Twilio account for SMS functionality (requires API credentials)

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ekalavya-cmd/subscription-manager.git
   cd subscription-manager
   ```

2. **Set Up Environment Variables** Create a `.env` file in the root directory with the following structure (replace with your own values):

   ```bash
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   ```

3. **Start MongoDB**

   ```bash
   mongod
   ```

4. **Run the Application**

   ```bash
   npm start
   ```

5. Access the App Open your browser and go to `http://localhost:3000`.

## Usage

**Getting Started**

- **Registration:** Visit `/register` to create a new account. Enter a username, email, and password, then submit. You’ll be redirected to the login page.
- **Login:** Go to `/` and enter your credentials to access the subscription manager at `/app`.

**Managing Subscriptions**

- **Add a Subscription:**

  1.  Click the "Add" button in the "Add/Edit Subscription" form.
  2.  Fill in the fields: Name (e.g., "Netflix"), Cost (e.g., "1200" in INR), Renewal Date (eg., "2025-04-20"), Provider (e.g., "Netflix Inc."), and Status (e.g., "Active").
  3.  Click "Add" to save. A "Subscription added successfully!" message will appear.
  4.  Use "Clear" to reset the form.

- **Edit a Subscription:**

  1.  Find the subscription in the table and click "Edit".
  2.  Modify any field (e.g., change cost to "1300") and click "Update".
  3.  A "Subscription updated successfully!" message will confirm the change.
  4.  Click "Cancel" to discard edits.

- **Delete a Subscription:**

  1.  Locate the subscription and click "Delete". The entry will be removed from the page.

- **Filter and Search:**

  1.  Use the search bar to type a subscription name (e.g., "Net").
  2.  Select a status (e.g., "Active") from the dropdown to filter the list.

**Sending SMS Reminders**

- **Send a Reminder:**

  1.  Go to the "Send SMS Reminder" section.
  2.  Enter a recipient phone number (e.g., "+919876543210") and a message (e.g., "Your Netflix subscription renews on 2025-04-20!").
  3.  Click "Send SMS". A "SMS sent successfully" message will appear if successful, or an error if fields are missing.

- Tips: Ensure the phone number includes the country code and that your Twilio account has credits.

**Viewing Costs**

- The "Monthly Cost Overview" chart displays the total cost of active subscriptions per month in 2025, labeled in INR.

## Twilio Usage

This project integrates Twilio for sending SMS reminders about subscription renewals. Here's how it's implemented:

- **Setup:**

  - A Twilio account is required. Sign up at Twilio and obtain your Account SID, Auth Token, and a Twilio phone number.
  - These credentials are stored in the `.env` file under `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.

- **Functionality:**

  - The app includes an SMS form where users can enter a recipient phone number and a custom message.
  - Upon submission, the backend makes a POST request to Twilio's API (`/api/send-sms`) using the `twilio` npm package.
  - The message is sent from the Twilio phone number to the specified recipient.

- **Implementation:**

  - The `server.js` file contains the Twilio configuration and the `/send-sms` endpoint.
  - The frontend (AngularJS) handles the form submission and displays success/error messages.
  - Example usage: Enter a phone number (e.g., +919876543210) and a message like "Your subscription renews tomorrow!" to send a reminder.

- **Notes:**

  - Ensure your Twilio account has sufficient credits for SMS usage.
  - The app validates that both the phone number and message are provided before sending.
  - For production, configure Twilio to handle international numbers and comply with local regulations.

## Contributing

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature-branch`).
3.  Make your changes and commit them (`git commit -m "Description of changes"`).
4.  Push to the branch (`git push origin feature-branch`).
5.  Open a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgments

- Inspired by the need for personal subscription management.
- Thanks to the open-source communities of AngularJS, Tailwind CSS, and Twilio.
