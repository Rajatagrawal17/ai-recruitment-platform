const nodemailer = require("nodemailer");

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true" || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Email templates
const emailTemplates = {
  jobAlert: (recipientName, jobs) => ({
    subject: `🎯 ${jobs.length} New Job Opportunities Matched for You!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Hello ${recipientName},</h2>
        
        <p>We found <strong>${jobs.length}</strong> new job opportunities that match your profile!</p>
        
        <div style="margin: 20px 0;">
          ${jobs.map(job => `
            <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
              <h3 style="color: #1f2937; margin-top: 0;">${job.title}</h3>
              <p style="color: #6b7280; margin: 5px 0;">
                <strong>Company:</strong> ${job.company}
              </p>
              <p style="color: #6b7280; margin: 5px 0;">
                <strong>Location:</strong> ${job.location || "Remote"}
              </p>
              <p style="color: #6b7280; margin: 5px 0;">
                <strong>Salary:</strong> ${job.salary || "Competitive"}
              </p>
              <p style="color: #6b7280; margin: 5px 0;">
                <strong>Experience Level:</strong> ${job.experienceLevel || "Not specified"}
              </p>
              <a href="${process.env.FRONTEND_URL}/jobs/${job._id}" style="color: #2563eb; text-decoration: none; font-weight: bold;">
                View Job &rarr;
              </a>
            </div>
          `).join('')}
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          <a href="${process.env.FRONTEND_URL}/settings/notifications" style="color: #2563eb; text-decoration: none;">
            Manage your email preferences
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AI Recruitment Platform. All rights reserved.
        </p>
      </div>
    `,
  }),

  applicationUpdate: (recipientName, jobTitle, companyName, status) => ({
    subject: `📋 Update on Your Application to ${companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Hello ${recipientName},</h2>
        
        <p>Your application has been updated!</p>
        
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; background: #f9fafb;">
          <p style="margin: 10px 0;">
            <strong>Position:</strong> ${jobTitle} at ${companyName}
          </p>
          <p style="margin: 10px 0;">
            <strong>Status:</strong> 
            <span style="padding: 4px 8px; border-radius: 4px; background: ${
              status === "accepted"
                ? "#dcfce7"
                : status === "rejected"
                ? "#fee2e2"
                : "#fef3c7"
            }; color: ${
              status === "accepted"
                ? "#166534"
                : status === "rejected"
                ? "#991b1b"
                : "#92400e"
            };">
              ${status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          <a href="${process.env.FRONTEND_URL}/candidate/dashboard" style="color: #2563eb; text-decoration: none;">
            View all applications &rarr;
          </a>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AI Recruitment Platform. All rights reserved.
        </p>
      </div>
    `,
  }),

  verificationEmail: (recipientName, verificationLink) => ({
    subject: "🔐 Verify Your Email Address",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome ${recipientName}!</h2>
        
        <p>Please verify your email address to complete your registration.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Verify Email
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          Or copy and paste this link in your browser:<br>
          <code style="background: #f3f4f6; padding: 8px; border-radius: 4px; word-break: break-all;">
            ${verificationLink}
          </code>
        </p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AI Recruitment Platform. All rights reserved.
        </p>
      </div>
    `,
  }),

  welcomeEmail: (recipientName) => ({
    subject: "👋 Welcome to AI Recruitment Platform!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Welcome to AI Recruitment Platform, ${recipientName}!</h2>
        
        <p>We're excited to have you on board! Here's what you can do:</p>
        
        <ul style="color: #374151;">
          <li>Browse thousands of job opportunities</li>
          <li>Get AI-powered job recommendations</li>
          <li>Save jobs for later</li>
          <li>Track your applications in one place</li>
          <li>Receive personalized job alerts</li>
        </ul>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/apply" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            Start Browsing Jobs
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          © ${new Date().getFullYear()} AI Recruitment Platform. All rights reserved.
        </p>
      </div>
    `,
  }),
};

// Send email function
const sendEmail = async (to, templateName, variables = {}) => {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      console.warn("Email service not configured. Skipping email send.");
      return { success: false, reason: "Email service not configured" };
    }

    const template = emailTemplates[templateName];
    if (!template) {
      throw new Error(`Email template '${templateName}' not found`);
    }

    const emailContent = template(...Object.values(variables));

    const mailOptions = {
      from: `"AI Recruitment Platform" <${process.env.SMTP_USER}>`,
      to,
      ...emailContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}:`, result.response);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

// Verify email configuration
const verifyEmailConfiguration = async () => {
  try {
    await transporter.verify();
    console.log("✅ Email service configured successfully");
    return true;
  } catch (error) {
    console.warn("⚠️  Email service not properly configured:", error.message);
    return false;
  }
};

module.exports = {
  sendEmail,
  emailTemplates,
  verifyEmailConfiguration,
  transporter,
};
