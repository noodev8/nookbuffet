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
      <h2>New Contact Form Message</h2>

      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Subject:</strong> ${subject || 'No subject'}</p>

      <h3>Message:</h3>
      <p>${message}</p>

      <hr>
      <p><small>Sent from your website contact form</small></p>
    `;

    // Send the email
    await resend.emails.send({
      from: process.env.FROM_EMAIL,        // Who the email is from
      to: process.env.TO_EMAIL,            // Who receives the email (you)
      subject: emailSubject,               // Email subject line
      html: emailContent,                  // Email content
      reply_to: email                      // So you can reply directly to the customer
    });

    // Tell the website the email was sent successfully
    res.json({
      return_code: 'SUCCESS',
      message: 'Your message has been sent! We will get back to you soon.'
    });

  } catch (error) {
    // If something goes wrong, tell the website
    res.json({
      return_code: 'SERVER_ERROR',
      message: 'Sorry, there was a problem sending your message. Please try again.'
    });
  }
};

// Export the function so other files can use it
module.exports = {
  sendContactEmail
};
