/**
 * Email Service
 * - Uses Nodemailer when SMTP credentials are provided
 * - Falls back to console logging if SMTP is not configured
 */

const nodemailer = require('nodemailer');

const hasSmtpConfig = () => {
  return Boolean(
    process.env.EMAIL_HOST &&
      process.env.EMAIL_PORT &&
      process.env.EMAIL_USER &&
      process.env.EMAIL_PASS
  );
};

const getTransporter = () => {
  if (!hasSmtpConfig()) return null;

  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const secure = port === 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendMail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  if (!transporter) {
    return false;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'GamerHub <noreply@gamerhub.com>',
    to,
    subject,
    text,
    html,
  });

  return true;
};

/**
 * Send email verification link
 */
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  const subject = 'Verify your GamerHub account';
  const text = `Hi ${name},\n\nPlease verify your account by clicking the link below:\n${verifyUrl}\n\nThanks,\nGamerHub Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Verify your GamerHub account</h2>
      <p>Hi ${name},</p>
      <p>Please verify your account by clicking the button below:</p>
      <p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 10px 18px; background: #6c63ff; color: #fff; text-decoration: none; border-radius: 6px;">
          Verify Account
        </a>
      </p>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p><a href="${verifyUrl}">${verifyUrl}</a></p>
      <p>Thanks,<br />GamerHub Team</p>
    </div>
  `;

  const sent = await sendMail({ to: email, subject, text, html });
  if (sent) return;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 VERIFICATION EMAIL (Console Fallback)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   To: ${email}`);
  console.log(`   Name: ${name}`);
  console.log('');
  console.log('   🔗 CLICK TO VERIFY:');
  console.log(`   ${verifyUrl}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (email, name) => {
  const subject = 'Welcome to GamerHub!';
  const text = `Welcome to GamerHub, ${name}! 🎮`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Welcome to GamerHub, ${name}! 🎮</h2>
      <p>We’re excited to have you in the community.</p>
    </div>
  `;

  const sent = await sendMail({ to: email, subject, text, html });
  if (sent) return;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 WELCOME EMAIL (Console Fallback)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   To: ${email}`);
  console.log(`   Welcome to GamerHub, ${name}! 🎮`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
};

/**
 * Send payment confirmation email
 */
const sendPaymentConfirmationEmail = async (email, name, plan, expireTime) => {
  const subject = `Your ${plan} plan is active 🎉`;
  const text = `Congrats ${name}! Your ${plan} plan is now active. Expires: ${new Date(expireTime).toLocaleString()}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
      <h2>Payment confirmed</h2>
      <p>Congrats ${name}! Your ${plan} plan is now active. 🎉</p>
      <p>Expires: ${new Date(expireTime).toLocaleString()}</p>
    </div>
  `;

  const sent = await sendMail({ to: email, subject, text, html });
  if (sent) return;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 PAYMENT CONFIRMATION EMAIL (Console Fallback)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   To: ${email}`);
  console.log(`   Plan: ${plan}`);
  console.log(`   Expires: ${new Date(expireTime).toLocaleString()}`);
  console.log(`   Congrats ${name}! Your ${plan} plan is now active. 🎉`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
};

module.exports = {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPaymentConfirmationEmail,
};
