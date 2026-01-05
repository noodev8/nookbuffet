/*
=======================================================================================================================================
CONTACT CONTROLLER - Handles contact form submissions
=======================================================================================================================================
This file handles when someone fills out the contact form on the website.
It takes their information and sends an email with their message.

The email is sent using Resend 
=======================================================================================================================================
*/

// Import the Resend email service
const { Resend } = require('resend');

// ===== SET UP EMAIL SERVICE =====
// Create a Resend instance 
const resend = new Resend(process.env.RESEND_API_KEY);

// ===== SEND CONTACT EMAIL =====
/**
 * Handle contact form submissions and send an email
 * This is called when someone POSTs to /api/contact
 *
 * @param {object} req - The request object (contains the form data in req.body)
 * @param {object} res - The response object (we use this to send data back)
 */
const sendContactEmail = async (req, res) => {
  try {
    // Extract the form data from the request
    // This comes from the contact form on the website
    const { name, email, phone, subject, message } = req.body;

    // ===== VALIDATION =====
    // Check if all required fields are filled out
    if (!name || !email || !message) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Please fill out name, email, and message'
      });
    }

    // Check if the email address looks valid (has an @ symbol)
    if (!email.includes('@')) {
      return res.json({
        return_code: 'INVALID_EMAIL',
        message: 'Please enter a valid email address'
      });
    }

    // ===== BUILD EMAIL =====
    // Create the email subject line
    const emailSubject = subject ? `Contact Form: ${subject}` : 'New Contact Form Message';

    // Create the email content 
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            /* Email styling - makes the email look nice */
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f9f9f9;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content {
              padding: 30px 20px;
            }
            .section {
              margin-bottom: 25px;
            }
            .section-title {
              font-size: 12px;
              font-weight: 700;
              color: #999;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 8px;
            }
            .field {
              margin-bottom: 15px;
            }
            .field-label {
              font-weight: 600;
              color: #555;
              font-size: 14px;
              margin-bottom: 4px;
            }
            .field-value {
              color: #333;
              font-size: 14px;
              word-break: break-word;
            }
            .message-box {
              background-color: #f5f5f5;
              border-left: 4px solid #667eea;
              padding: 15px;
              border-radius: 4px;
              margin-top: 10px;
            }
            .footer {
              background-color: #f9f9f9;
              padding: 20px;
              text-align: center;
              border-top: 1px solid #eee;
              font-size: 12px;
              color: #999;
            }
            .reply-link {
              color: #667eea;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Contact Form Message</h1>
            </div>

            <div class="content">
              <!-- Contact Information Section -->
              <div class="section">
                <div class="section-title">Contact Information</div>

                <div class="field">
                  <div class="field-label">Name</div>
                  <div class="field-value">${name}</div>
                </div>

                <div class="field">
                  <div class="field-label">Email</div>
                  <!-- Make the email clickable so you can reply directly -->
                  <div class="field-value"><a href="mailto:${email}" class="reply-link">${email}</a></div>
                </div>

                <!-- Only show phone if they provided it -->
                ${phone ? `
                <div class="field">
                  <div class="field-label">Phone</div>
                  <div class="field-value">${phone}</div>
                </div>
                ` : ''}

                <!-- Only show subject if they provided it -->
                ${subject ? `
                <div class="field">
                  <div class="field-label">Subject</div>
                  <div class="field-value">${subject}</div>
                </div>
                ` : ''}
              </div>

              <!-- Message Section -->
              <div class="section">
                <div class="section-title">Message</div>
                <div class="message-box">
                  <!-- Convert line breaks to HTML line breaks so the message displays correctly -->
                  <div class="field-value">${message.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This email was sent from your website contact form.</p>
              <p>You can reply directly to this email to contact ${name}.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // ===== SEND THE EMAIL =====
    // Use the Resend service to actually send the email
    const emailResult = await resend.emails.send({
      from: `${process.env.EMAIL_NAME} <${process.env.FROM_EMAIL}>`,  // Who the email is from (your business name + email)
      to: process.env.TO_EMAIL,            // Who receives the email (you - the business owner)
      subject: emailSubject,               // The subject line of the email
      html: emailContent,                  // The HTML content of the email
      reply_to: email                      // When you reply, it goes to the customer's email
    });

    console.log('Email sent successfully:', emailResult);

    // ===== SEND SUCCESS RESPONSE =====
    // Tell the website that the email was sent successfully
    res.json({
      return_code: 'SUCCESS',
      message: 'Your message has been sent! We will get back to you soon.'
    });

  } catch (error) {
    // ===== ERROR HANDLING =====
    // Log the actual error so we can see what went wrong
    console.error('Email sending error:', error);

    // Tell the website that something went wrong
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Sorry, there was a problem sending your message. Please try again.',
      error: error.message // Include error details for debugging
    });
  }
};

// ===== EXPORTS =====
// Make this function available to the routes file
module.exports = {
  sendContactEmail
};
