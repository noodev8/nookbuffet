/*
=======================================================================================================================================
EMAIL SERVICE - Handles sending emails via Resend
=======================================================================================================================================
This utility provides reusable email functions for the application.
Uses Resend for email delivery - same service as the contact form.

Environment variables needed:
- RESEND_API_KEY: Your Resend API key
- FROM_EMAIL: The email address to send from (must be verified in Resend)
- EMAIL_NAME: The name to show as the sender (e.g., "The Little Nook Buffet")
=======================================================================================================================================
*/

const { Resend } = require('resend');
const menuModel = require('../models/menuModel');

// Create Resend instance
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send order confirmation email to customer
 *
 * @param {object} orderData - The complete order data
 * @param {string} orderNumber - The order number (e.g., "ORD-014")
 * @returns {Promise<object>} - Result from Resend
 */
const sendOrderConfirmationEmail = async (orderData, orderNumber) => {
  try {
    // Build the buffets HTML section
    let buffetsHtml = '';
    let buffetNumber = 1;

    for (const buffet of orderData.buffets) {
      // Fetch item details from database if we only have IDs
      let itemDetails = buffet.itemDetails || [];
      if (buffet.items && buffet.items.length > 0 && itemDetails.length === 0) {
        itemDetails = await menuModel.getMenuItemsByIds(buffet.items);
      }

      // Group items by category
      const itemsByCategory = {};
      if (itemDetails && itemDetails.length > 0) {
        itemDetails.forEach(item => {
          if (!itemsByCategory[item.category_name]) {
            itemsByCategory[item.category_name] = [];
          }
          itemsByCategory[item.category_name].push(item.name);
        });
      }

      let itemsHtml = '';
      for (const [category, items] of Object.entries(itemsByCategory)) {
        itemsHtml += `
          <div style="margin-bottom: 10px;">
            <strong style="color: #555;">${category}:</strong>
            <span style="color: #333;">${items.join(', ')}</span>
          </div>
        `;
      }

      // Build upgrades section if any
      let upgradesHtml = '';
      if (buffet.upgrades && buffet.upgrades.length > 0) {
        const upgradeNames = buffet.upgrades.map(u => u.name || 'Upgrade').join(', ');
        upgradesHtml = `
          <div style="margin-top: 10px; padding-top: 10px; border-top: 1px dashed #ddd;">
            <strong style="color: #555;">Upgrades:</strong>
            <span style="color: #333;">${upgradeNames}</span>
          </div>
        `;
      }

      buffetsHtml += `
        <div style="background: #f9f9f9; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #1a1a1a; font-size: 16px;">
            ${buffet.buffetName || 'Buffet ' + buffetNumber} - ${buffet.numPeople} ${buffet.numPeople === 1 ? 'person' : 'people'}
          </h3>
          ${itemsHtml}
          ${upgradesHtml}
          ${buffet.notes ? `<div style="margin-top: 10px; font-style: italic; color: #666;">Notes: ${buffet.notes}</div>` : ''}
          ${buffet.dietaryInfo ? `<div style="color: #666;">Dietary: ${buffet.dietaryInfo}</div>` : ''}
          ${buffet.allergens ? `<div style="color: #c00;">Allergens: ${buffet.allergens}</div>` : ''}
          <div style="margin-top: 10px; font-weight: bold; color: #1a1a1a;">
            Subtotal: £${parseFloat(buffet.totalPrice || 0).toFixed(2)}
          </div>
        </div>
      `;
      buffetNumber++;
    }

    // Format delivery/collection info
    const isDelivery = orderData.fulfillmentType === 'delivery';
    const fulfillmentText = isDelivery ? 'Delivery' : 'Collection';
    const dateText = orderData.deliveryDate || 'TBC';
    const timeText = orderData.deliveryTime || 'TBC';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: #1a1a1a; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">THE LITTLE NOOK BUFFET</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Confirmation</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <p style="font-size: 18px; margin-bottom: 20px;">Thank you for your order, <strong>${orderData.customerName}</strong>!</p>
              
              <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-bottom: 25px;">
                <strong>Order ${orderNumber}</strong> has been received and is being processed.
              </div>

              <!-- Order Details -->
              <h2 style="color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">
                ${fulfillmentText} Details
              </h2>
              
              <table style="width: 100%; margin-bottom: 25px;">
                <tr>
                  <td style="padding: 8px 0; color: #666;">Date:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${dateText}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;">Time:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${timeText}</td>
                </tr>
                ${isDelivery && orderData.deliveryAddress ? `
                <tr>
                  <td style="padding: 8px 0; color: #666; vertical-align: top;">Address:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${orderData.deliveryAddress}</td>
                </tr>
                ` : ''}
                ${orderData.businessName ? `
                <tr>
                  <td style="padding: 8px 0; color: #666;">Business:</td>
                  <td style="padding: 8px 0; font-weight: bold;">${orderData.businessName}</td>
                </tr>
                ` : ''}
              </table>

              <!-- Buffets -->
              <h2 style="color: #1a1a1a; font-size: 18px; border-bottom: 2px solid #1a1a1a; padding-bottom: 10px;">
                Your Order
              </h2>
              ${buffetsHtml}

              <!-- Total -->
              <div style="background: #1a1a1a; color: white; padding: 20px; border-radius: 8px; text-align: right; margin-top: 20px;">
                <span style="font-size: 18px;">Total: </span>
                <span style="font-size: 24px; font-weight: bold;">£${parseFloat(orderData.totalPrice).toFixed(2)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">If you have any questions, please contact us.</p>
              <p style="margin: 0;">The Little Nook Buffet</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_NAME} <${process.env.FROM_EMAIL}>`,
      to: orderData.customerEmail,
      subject: `Order Confirmation ${orderNumber} - The Little Nook Buffet`,
      html: emailHtml
    });

    console.log('Order confirmation email sent:', result);
    return { success: true, result };

  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't throw - we don't want email failure to break the order
    return { success: false, error: error.message };
  }
};

/**
 * Send order ready/complete email to customer
 * Sent when admin marks the order as done
 *
 * @param {object} orderData - The complete order data from database
 * @returns {Promise<object>} - Result from Resend
 */
const sendOrderReadyEmail = async (orderData) => {
  try {
    const isDelivery = orderData.fulfillment_type === 'delivery';
    const fulfillmentText = isDelivery ? 'delivery' : 'collection';

    // Format the date nicely
    const dateText = orderData.fulfillment_date
      ? new Date(orderData.fulfillment_date).toLocaleDateString('en-GB', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      : 'your scheduled date';

    const timeText = orderData.fulfillment_time || '';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">

            <!-- Header -->
            <div style="background: #1a1a1a; color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px; letter-spacing: 1px;">THE LITTLE NOOK BUFFET</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Order Ready!</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
              <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 20px; margin-bottom: 25px; border-radius: 0 8px 8px 0;">
                <h2 style="margin: 0 0 10px 0; color: #2e7d32; font-size: 20px;">Your order is ready!</h2>
                <p style="margin: 0; color: #333;">Order <strong>${orderData.order_number}</strong> has been prepared and is ready for ${fulfillmentText}.</p>
              </div>

              ${isDelivery ? `
                <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px;">Delivery Details</h3>
                  <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateText}</p>
                  ${timeText ? `<p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${timeText}</p>` : ''}
                  <p style="margin: 0;"><strong>Address:</strong> ${orderData.fulfillment_address || 'As provided'}</p>
                </div>
                <p style="color: #666;">Your order is on its way! Please ensure someone is available to receive the delivery.</p>
              ` : `
                <div style="background: #f9f9f9; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="margin: 0 0 15px 0; color: #1a1a1a; font-size: 16px;">Collection Details</h3>
                  <p style="margin: 0 0 8px 0;"><strong>Date:</strong> ${dateText}</p>
                  ${timeText ? `<p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${timeText}</p>` : ''}
                </div>
                <p style="color: #666;">Your order is ready and waiting for you! Please collect at your scheduled time.</p>
              `}

              <!-- Total -->
              <div style="background: #1a1a1a; color: white; padding: 15px 20px; border-radius: 8px; text-align: right; margin-top: 20px;">
                <span style="font-size: 16px;">Order Total: </span>
                <span style="font-size: 22px; font-weight: bold;">£${parseFloat(orderData.total_price).toFixed(2)}</span>
              </div>
            </div>

            <!-- Footer -->
            <div style="background: #f5f5f5; padding: 20px; text-align: center; color: #666; font-size: 14px;">
              <p style="margin: 0 0 10px 0;">Thank you for choosing The Little Nook Buffet!</p>
              <p style="margin: 0;">If you have any questions, please don't hesitate to contact us.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_NAME} <${process.env.FROM_EMAIL}>`,
      to: orderData.customer_email,
      subject: `Your Order ${orderData.order_number} is Ready! - The Little Nook Buffet`,
      html: emailHtml
    });

    console.log('Order ready email sent:', result);
    return { success: true, result };

  } catch (error) {
    console.error('Failed to send order ready email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOrderConfirmationEmail,
  sendOrderReadyEmail
};

