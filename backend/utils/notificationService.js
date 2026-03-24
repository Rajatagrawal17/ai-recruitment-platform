const nodemailer = require("nodemailer");

const getTransporter = () => {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
};

const sendNotificationEmail = async ({ to, subject, heading, message, ctaLabel, ctaUrl }) => {
  if (!to) {
    return { success: false, skipped: true, reason: "missing recipient" };
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { success: true, demo: true, reason: "smtp credentials missing" };
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0a0e1a; color: #f1f5f9; padding: 30px; border-radius: 12px;">
      <h2 style="margin: 0 0 12px 0; color: #06b6d4;">${heading}</h2>
      <p style="margin: 0 0 18px 0; color: #cbd5e1; line-height: 1.6;">${message}</p>
      ${ctaUrl ? `<a href="${ctaUrl}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 14px; border-radius: 8px; font-weight: 600;">${ctaLabel || "Open Platform"}</a>` : ""}
      <p style="margin-top: 22px; color: #94a3b8; font-size: 12px;">Cognifit AI Recruitment Platform</p>
    </div>
  `;

  const info = await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    html,
  });

  return { success: true, messageId: info.messageId };
};

module.exports = {
  sendNotificationEmail,
};
