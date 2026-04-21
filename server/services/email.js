import nodemailer from 'nodemailer'

// Create transporter — uses Gmail by default, falls back to Ethereal for testing
let transporter = null

const initTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
    console.log('✅ Email service configured with Gmail')
  } else {
    // Create test account with Ethereal for development
    const testAccount = await nodemailer.createTestAccount()
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    })
    console.log('⚠️  Email service using Ethereal test account')
    console.log(`   Preview emails at: https://ethereal.email/login`)
    console.log(`   User: ${testAccount.user}`)
    console.log(`   Pass: ${testAccount.pass}`)
  }
}

// Initialize on import
initTransporter().catch(err => console.log('Email init failed:', err.message))

/**
 * Send reservation confirmation email
 */
export const sendReservationConfirmation = async (reservation, orderItems = []) => {
  if (!transporter) {
    console.log('⚠️  Email transporter not ready, skipping email')
    return null
  }

  const orderTotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)

  const orderTableRows = orderItems.map(item => `
    <tr>
      <td style="padding: 10px 16px; border-bottom: 1px solid #2a2a2a; color: #e0e0e0;">${item.name}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #2a2a2a; color: #e0e0e0; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 16px; border-bottom: 1px solid #2a2a2a; color: #d4a853; text-align: right;">₹${item.price * item.quantity}</td>
    </tr>
  `).join('')

  const preOrderSection = orderItems.length > 0 ? `
    <div style="margin-top: 28px;">
      <h3 style="color: #d4a853; font-size: 18px; margin-bottom: 12px; font-family: 'Georgia', serif;">
        🍽️ Your Pre-Order
      </h3>
      <table style="width: 100%; border-collapse: collapse; background: #1a1a1a; border-radius: 8px; overflow: hidden;">
        <thead>
          <tr style="background: #222;">
            <th style="padding: 10px 16px; text-align: left; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Item</th>
            <th style="padding: 10px 16px; text-align: center; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Qty</th>
            <th style="padding: 10px 16px; text-align: right; color: #d4a853; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${orderTableRows}
        </tbody>
        <tfoot>
          <tr style="background: #222;">
            <td colspan="2" style="padding: 12px 16px; color: #fff; font-weight: bold; font-size: 15px;">Total</td>
            <td style="padding: 12px 16px; color: #d4a853; font-weight: bold; font-size: 16px; text-align: right;">₹${orderTotal}</td>
          </tr>
        </tfoot>
      </table>
      <p style="color: #888; font-size: 12px; margin-top: 8px; font-style: italic;">
        * Your food will be prepared as you arrive at the restaurant.
      </p>
    </div>
  ` : ''

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #1a1a1a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #111 100%); padding: 40px 32px; text-align: center; border-bottom: 2px solid #d4a853;">
          <h1 style="color: #d4a853; font-size: 28px; margin: 0; font-family: 'Georgia', serif; letter-spacing: 2px;">
            BADRI'S RESTAURANT
          </h1>
          <p style="color: #888; margin: 8px 0 0; font-size: 13px; letter-spacing: 3px; text-transform: uppercase;">
            Chembur, Mumbai
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <h2 style="color: #fff; font-size: 22px; margin: 0 0 8px; font-family: 'Georgia', serif;">
            ✅ Reservation Confirmed!
          </h2>
          <p style="color: #aaa; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            Dear <strong style="color: #fff;">${reservation.name}</strong>, your table has been reserved. We look forward to serving you!
          </p>

          <!-- Reservation Details -->
          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; border-left: 4px solid #d4a853;">
            <h3 style="color: #d4a853; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
              📋 Reservation Details
            </h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">📅 Date</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right; font-weight: 600;">${reservation.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">🕐 Time</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right; font-weight: 600;">${reservation.time}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">👥 Guests</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right; font-weight: 600;">${reservation.guests}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">🪑 Table</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right; font-weight: 600;">Table ${reservation.tableNumber || 'TBD'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">📞 Phone</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right;">${reservation.phone}</td>
              </tr>
            </table>
          </div>

          ${preOrderSection}

          ${reservation.message ? `
          <div style="margin-top: 20px; background: #1a1a1a; border-radius: 8px; padding: 16px;">
            <p style="color: #888; font-size: 13px; margin: 0 0 4px;">Special Requests:</p>
            <p style="color: #e0e0e0; font-size: 14px; margin: 0; font-style: italic;">"${reservation.message}"</p>
          </div>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 24px 32px; text-align: center; border-top: 1px solid #1a1a1a;">
          <p style="color: #d4a853; font-size: 14px; margin: 0 0 8px; font-family: 'Georgia', serif;">
            Badri's Restaurant
          </p>
          <p style="color: #666; font-size: 12px; margin: 0 0 4px;">
            📍 Chembur, Mumbai, Maharashtra
          </p>
          <p style="color: #666; font-size: 12px; margin: 0;">
            📞 +91 98765 43210 &nbsp;|&nbsp; ✉️ badrisrestaurant@gmail.com
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Badri's Restaurant" <${process.env.EMAIL_USER || 'noreply@badris.com'}>`,
      to: reservation.email,
      subject: `✅ Reservation Confirmed — ${reservation.date} at ${reservation.time} | Badri's Restaurant`,
      html: htmlContent,
    })

    console.log(`📧 Confirmation email sent to ${reservation.email}`)

    // If using Ethereal, log preview URL
    if (!process.env.EMAIL_USER) {
      console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return info
  } catch (error) {
    console.error('❌ Email send failed:', error.message)
    return null
  }
}

/**
 * Send order status update email
 */
export const sendOrderStatusEmail = async (reservation, status) => {
  if (!transporter) {
    console.log('⚠️  Email transporter not ready, skipping email')
    return null
  }

  let statusTitle = '';
  let statusMessage = '';
  let statusColor = '';

  if (status === 'ready') {
    statusTitle = '🔔 Your Food is Ready!';
    statusMessage = 'Your pre-ordered food is now ready to be served. Please proceed to your table or ask a waiter for assistance.';
    statusColor = '#10b981'; // Green
  } else if (status === 'served') {
    statusTitle = '🍽️ Your Food has been Served';
    statusMessage = 'We hope you enjoy your meal! Please let us know if you need anything else.';
    statusColor = '#6366f1'; // Indigo
  } else {
    return null; // Don't send emails for other statuses
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background: #0a0a0a; font-family: 'Segoe UI', Arial, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #1a1a1a;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1a1a1a 0%, #111 100%); padding: 40px 32px; text-align: center; border-bottom: 2px solid ${statusColor};">
          <h1 style="color: ${statusColor}; font-size: 28px; margin: 0; font-family: 'Georgia', serif; letter-spacing: 2px;">
            ${statusTitle}
          </h1>
        </div>

        <!-- Content -->
        <div style="padding: 32px;">
          <p style="color: #aaa; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            Dear <strong style="color: #fff;">${reservation.name}</strong>,
          </p>
          <p style="color: #ccc; font-size: 16px; line-height: 1.6; margin: 0 0 24px;">
            ${statusMessage}
          </p>

          <div style="background: #1a1a1a; border-radius: 12px; padding: 24px; border-left: 4px solid ${statusColor};">
            <h3 style="color: ${statusColor}; font-size: 16px; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">
              📋 Reservation Details
            </h3>
            <table style="width: 100%;">
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">📅 Date</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right; font-weight: 600;">${reservation.date}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #888; font-size: 14px;">🪑 Table</td>
                <td style="padding: 6px 0; color: #fff; font-size: 14px; text-align: right; font-weight: 600;">Table ${reservation.tableNumber || 'TBD'}</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #0a0a0a; padding: 24px 32px; text-align: center; border-top: 1px solid #1a1a1a;">
          <p style="color: #d4a853; font-size: 14px; margin: 0 0 8px; font-family: 'Georgia', serif;">
            Badri's Restaurant
          </p>
          <p style="color: #666; font-size: 12px; margin: 0 0 4px;">
            📍 Chembur, Mumbai, Maharashtra
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  try {
    const info = await transporter.sendMail({
      from: `"Badri's Restaurant" <${process.env.EMAIL_USER || 'noreply@badris.com'}>`,
      to: reservation.email,
      subject: `${statusTitle} | Badri's Restaurant`,
      html: htmlContent,
    })

    console.log(`📧 Order status email (${status}) sent to ${reservation.email}`)

    if (!process.env.EMAIL_USER) {
      console.log(`   Preview: ${nodemailer.getTestMessageUrl(info)}`)
    }

    return info
  } catch (error) {
    console.error('❌ Order status email send failed:', error.message)
    return null
  }
}
