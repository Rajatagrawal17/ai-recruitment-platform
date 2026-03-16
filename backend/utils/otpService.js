const twilio = require("twilio");
const nodemailer = require("nodemailer");

// ==================== TWILIO SMS ====================
const sendSMSViatwilio = async (phoneNumber, otp) => {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // If no credentials, use demo mode
    if (!accountSid || !authToken || !fromNumber) {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║  📱 SMS OTP (DEMO MODE)                ║`);
      console.log(`║  Phone: ${phoneNumber.padEnd(30)}║`);
      console.log(`║  OTP: ${otp}                              ║`);
      console.log(`║  Valid: 10 minutes                       ║`);
      console.log(`╚════════════════════════════════════════╝\n`);
      return { success: true, demo: true };
    }

    const client = twilio(accountSid, authToken);

    const message = await client.messages.create({
      body: `🔐 Your OTP verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nNever share this code with anyone.`,
      from: fromNumber,
      to: phoneNumber,
    });

    console.log(`✅ SMS sent successfully to ${phoneNumber} (SID: ${message.sid})`);
    return { success: true, messageSid: message.sid };

  } catch (error) {
    console.error(`❌ SMS Error: ${error.message}`);
    // Fallback to console logging in demo mode
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  📱 SMS OTP (FALLBACK)                 ║`);
    console.log(`║  Phone: ${phoneNumber.padEnd(30)}║`);
    console.log(`║  OTP: ${otp}                              ║`);
    console.log(`║  Valid: 10 minutes                       ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    return { success: true, demo: true, error: error.message };
  }
};

// ==================== NODEMAILER EMAIL ====================
const sendEmailViaNodemailer = async (email, otp, type = "otp") => {
  try {
    const serviceEmail = process.env.SMTP_USER || "your-email@gmail.com";
    const servicePassword = process.env.SMTP_PASSWORD;

    // If no credentials, use demo mode
    if (!servicePassword) {
      console.log(`\n╔════════════════════════════════════════╗`);
      console.log(`║  📧 EMAIL OTP (DEMO MODE)             ║`);
      console.log(`║  Email: ${email.substring(0, 28).padEnd(28)} ║`);
      console.log(`║  OTP: ${otp}                              ║`);
      console.log(`║  Valid: 10 minutes                       ║`);
      console.log(`╚════════════════════════════════════════╝\n`);
      return { success: true, demo: true };
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: serviceEmail,
        pass: servicePassword, // Use app-specific password for Gmail
      },
    });

    const subject = type === "otp" ? "🔐 Your OTP Verification Code" : "📧 Email Verification";

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0e1a; color: #f1f5f9; padding: 40px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #06b6d4; margin: 0;">🔐 Verification Code</h1>
        </div>

        <div style="background: rgba(255, 255, 255, 0.05); padding: 24px; border-radius: 8px; border: 1px solid rgba(79, 70, 229, 0.2); margin-bottom: 24px;">
          <p style="margin: 0 0 16px 0; color: #94a3b8;">Your verification code is:</p>
          <div style="background: linear-gradient(135deg, #4f46e5, #06b6d4); padding: 20px; border-radius: 8px; text-align: center;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #f1f5f9;">${otp}</span>
          </div>
          <p style="margin: 16px 0 0 0; color: #94a3b8; font-size: 12px;">This code expires in <strong>10 minutes</strong></p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 12px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; color: #fca5a5; font-size: 12px;">
            ⚠️ Never share this code with anyone. We will never ask for it via email or phone.
          </p>
        </div>

        <div style="text-align: center; color: #94a3b8; font-size: 12px;">
          <p style="margin: 0;">If you didn't request this code, please ignore this email.</p>
          <p style="margin: 8px 0 0 0;">© 2026 AI Recruitment Platform. All rights reserved.</p>
        </div>
      </div>
    `;

    const mailOptions = {
      from: serviceEmail,
      to: email,
      subject: subject,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${email} (MessageID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error(`❌ Email Error: ${error.message}`);
    // Fallback to console logging in demo mode
    console.log(`\n╔════════════════════════════════════════╗`);
    console.log(`║  📧 EMAIL OTP (FALLBACK)               ║`);
    console.log(`║  Email: ${email.substring(0, 28).padEnd(28)} ║`);
    console.log(`║  OTP: ${otp}                              ║`);
    console.log(`║  Valid: 10 minutes                       ║`);
    console.log(`╚════════════════════════════════════════╝\n`);
    return { success: true, demo: true, error: error.message };
  }
};

// ==================== EXPORT SERVICE CHOOSER ====================
const sendOTP = async (phoneNumber, otp, method = "sms", email = null) => {
  if (method === "sms") {
    return await sendSMSViatwilio(phoneNumber, otp);
  } else if (method === "email") {
    return await sendEmailViaNodemailer(email || phoneNumber, otp);
  }
};

module.exports = { sendOTP, sendSMSViatwilio, sendEmailViaNodemailer };
