# Complete Guide: Setting Up Resend API for Contact Form

This guide will walk you through setting up email functionality for your contact form using Resend API, step by step, assuming you have never done this before.

## What is Resend?

Resend is an email service that allows your website to send emails programmatically. When someone fills out your contact form, Resend will send you an email with their message.

## Prerequisites

Before starting, make sure you have:
- Your website project (nook-frontend and nook-server folders)
- Node.js installed on your computer
- A Resend account (we'll create this)

## Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Click "Sign Up" or "Get Started"
3. Create an account with your email address
4. Verify your email address when prompted

## Step 2: Get Your API Key

1. After logging into Resend, go to your dashboard
2. Click on "API Keys" in the left sidebar
3. Click "Create API Key"
4. Give it a name like "Nook Buffet Contact Form"
5. Copy the API key that appears (it starts with "re_")
6. **Important**: Save this key somewhere safe - you won't be able to see it again!

## Step 3: Add Your Domain (Optional but Recommended)

1. In your Resend dashboard, click "Domains"
2. Click "Add Domain"
3. Enter your domain name (e.g., littlenookbuffet.co.uk)
4. Follow the DNS setup instructions provided by Resend
5. Wait for verification (this can take a few minutes to hours)

**Note**: If you don't have a custom domain, you can use Resend's default domain for testing.

## Step 4: Configure Your Server

### 4.1 Add Your API Key to Environment Variables

1. Open your `nook-server` folder
2. Find the `.env` file
3. Look for this line: `RESEND_API_KEY=your_resend_api_key_here`
4. Replace `your_resend_api_key_here` with your actual API key from Step 2
5. Update the email addresses:
   ```
   FROM_EMAIL=hello@yourdomain.com
   TO_EMAIL=your-email@gmail.com
   ```
   - `FROM_EMAIL`: The email address emails will appear to come from
   - `TO_EMAIL`: Where you want to receive contact form submissions

### 4.2 Install Required Packages

1. Open your terminal/command prompt
2. Navigate to your `nook-server` folder:
   ```
   cd path/to/your/nook-server
   ```
3. Install the required packages:
   ```
   npm install resend pg
   ```

## Step 5: Start Your Server

1. In your terminal, make sure you're in the `nook-server` folder
2. Start the server:
   ```
   npm run dev
   ```
3. You should see messages like:
   ```
   Server is running on port 3013
   Connected to PostgreSQL database
   ```

## Step 6: Start Your Frontend

1. Open a new terminal window
2. Navigate to your `nook-frontend` folder:
   ```
   cd path/to/your/nook-frontend
   ```
3. Start the frontend:
   ```
   npm run dev
   ```
4. Open your browser and go to the URL shown (usually http://localhost:5173)

## Step 7: Test Your Contact Form

1. Go to your website's contact page
2. Fill out the contact form with test information
3. Click "Send Message"
4. You should see:
   - A "Sending..." message while it processes
   - A success message when it's sent
   - An email in your inbox (check spam folder too!)

## Troubleshooting

### Problem: "Failed to send message"
**Solutions:**
- Check that your API key is correct in the `.env` file
- Make sure your server is running (`npm run dev` in nook-server)
- Check the server console for error messages

### Problem: "Email not received"
**Solutions:**
- Check your spam/junk folder
- Verify the `TO_EMAIL` address in your `.env` file
- Make sure your domain is verified in Resend (if using custom domain)

### Problem: "Server won't start"
**Solutions:**
- Make sure you installed all packages: `npm install resend pg`
- Check that your `.env` file has all required variables
- Look at the error message in the terminal for specific issues

### Problem: "Cannot find module 'pg'"
**Solution:**
- Install the missing package: `npm install pg`

## Understanding the Code

### Backend Files Created:
- `controllers/contactController.js`: Handles form submissions and sends emails
- `routes/contactRoutes.js`: Defines the API endpoint for contact form
- Updated `server.js`: Connects the contact routes to your server

### Frontend Changes:
- Updated `ContactPage.jsx`: Now sends data to your API instead of just showing an alert
- Added loading states and success/error messages
- Updated `ContactPage.css`: Styled the new message components

### API Endpoint:
- `POST /api/contact`: Receives form data and sends email

## Email Template

The emails you receive will include:
- Contact person's name and email
- Phone number (if provided)
- Subject category they selected
- Their message
- Timestamp when the form was submitted

## Security Notes

- Never share your API key publicly
- The API key is stored in `.env` file which should not be committed to version control
- The `.env` file is already in your `.gitignore` to prevent accidental sharing

## Next Steps

Once everything is working:
1. Test with different types of messages
2. Consider customizing the email template in `contactController.js`
3. Add additional form validation if needed
4. Set up email notifications or auto-responses

## Getting Help

If you encounter issues:
1. Check the browser console for frontend errors
2. Check the server terminal for backend errors
3. Verify all environment variables are set correctly
4. Make sure both frontend and backend servers are running
5. Test the API endpoint directly using tools like Postman (advanced)

Remember: The most common issues are usually related to incorrect API keys or missing environment variables!
