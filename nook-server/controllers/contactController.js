// Contact Controller - Handles contact form submissions
// This file processes contact form data and sends emails using Resend

const { Resend } = require('resend');

// Initialize Resend with API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send contact form email
 * This function handles POST /api/contact requests
 */
const sendContactEmail = async (req, res) => {
  try {
    console.log('Processing contact form submission...');
    console.log('Request body:', req.body);
    console.log('Environment variables check:');
    console.log('- RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Missing');
    console.log('- FROM_EMAIL:', process.env.FROM_EMAIL);
    console.log('- TO_EMAIL:', process.env.TO_EMAIL);

    // Extract form data from request body
    const { name, email, phone, subject, message } = req.body;
    
    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, subject, and message are required'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Create email content
    const emailSubject = `Contact Form: ${subject}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #333; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject}</p>
        </div>
        
        <div style="background: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h3 style="color: #333; margin-top: 0;">Message</h3>
          <p style="line-height: 1.6; white-space: pre-wrap;">${message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
          <p style="margin: 0; font-size: 14px; color: #666;">
            This email was sent from the Nook Buffet contact form on ${new Date().toLocaleString()}.
          </p>
        </div>
      </div>
    `;
    
    // Send email using Resend
    console.log('Attempting to send email with Resend...');
    console.log('Email config:', {
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: emailSubject
    });

    const emailData = await resend.emails.send({
      from: process.env.FROM_EMAIL,
      to: process.env.TO_EMAIL,
      subject: emailSubject,
      html: emailHtml,
      // Optional: Add reply-to so you can reply directly to the customer
      reply_to: email
    });

    console.log('Email sent successfully:', emailData);
    console.log('Email ID:', emailData.id);
    
    // Send successful response
    res.status(200).json({
      success: true,
      message: 'Your message has been sent successfully! We will get back to you soon.',
      emailId: emailData.id
    });
    
  } catch (error) {
    console.error('Error sending contact email:', error);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    });

    // Send error response
    res.status(500).json({
      success: false,
      message: 'Failed to send your message. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      errorDetails: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

module.exports = {
  sendContactEmail
};
