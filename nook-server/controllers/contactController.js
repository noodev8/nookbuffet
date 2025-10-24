// This file sends emails when someone fills out the contact form

const { Resend } = require('resend');

// Set up email service with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// This function runs when someone submits the contact form
const sendContactEmail = async (req, res) => {
  try {
    // Get the form data that was submitted
    const { name, email, phone, subject, message } = req.body;

    // Check if required fields are filled out
    if (!name || !email || !message) {
      return res.json({
        return_code: 'MISSING_FIELDS',
        message: 'Please fill out name, email, and message'
      });
    }

    // Check if email looks valid
    if (!email.includes('@')) {
      return res.json({
        return_code: 'INVALID_EMAIL',
        message: 'Please enter a valid email address'
      });
    }

    // Create the email subject line
    const emailSubject = subject ? `Contact Form: ${subject}` : 'New Contact Form Message';

    // Create the email content (what you'll receive)
    const emailContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
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
              <h1>📧 New Contact Form Message</h1>
            </div>

            <div class="content">
              <div class="section">
                <div class="section-title">Contact Information</div>

                <div class="field">
                  <div class="field-label">Name</div>
                  <div class="field-value">${name}</div>
                </div>

                <div class="field">
                  <div class="field-label">Email</div>
                  <div class="field-value"><a href="mailto:${email}" class="reply-link">${email}</a></div>
                </div>

                ${phone ? `
                <div class="field">
                  <div class="field-label">Phone</div>
                  <div class="field-value">${phone}</div>
                </div>
                ` : ''}

                ${subject ? `
                <div class="field">
                  <div class="field-label">Subject</div>
                  <div class="field-value">${subject}</div>
                </div>
                ` : ''}
              </div>

              <div class="section">
                <div class="section-title">Message</div>
                <div class="message-box">
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

    // Send the email
    const emailResult = await resend.emails.send({
      from: `${process.env.EMAIL_NAME} <${process.env.FROM_EMAIL}>`,  // Use email name
      to: process.env.TO_EMAIL,            // Who receives the email (you)
      subject: emailSubject,               // Email subject line
      html: emailContent,                  // Email content
      reply_to: email                      // So you can reply directly to the customer
    });

    console.log('Email sent successfully:', emailResult);

    // Tell the website the email was sent successfully
    res.json({
      return_code: 'SUCCESS',
      message: 'Your message has been sent! We will get back to you soon.'
    });

  } catch (error) {
    // Log the actual error so we can see what went wrong
    console.error('Email sending error:', error);

    // If something goes wrong, tell the website
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Sorry, there was a problem sending your message. Please try again.',
      error: error.message // Include error details for debugging
    });
  }
};

// Export the function so other files can use it
module.exports = {
  sendContactEmail
};
