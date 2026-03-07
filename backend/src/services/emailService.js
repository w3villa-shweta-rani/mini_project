/**
 * Email Service - Console Mode (for development)
 * 
 * This logs email links to the console instead of sending real emails.
 * Replace with real email service (Nodemailer, SendGrid, etc.) for production.
 */

/**
 * Send email verification link - LOGS TO CONSOLE
 */
const sendVerificationEmail = async (email, name, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 VERIFICATION EMAIL');
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
 * Send welcome email - LOGS TO CONSOLE
 */
const sendWelcomeEmail = async (email, name) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 WELCOME EMAIL');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`   To: ${email}`);
  console.log(`   Welcome to GamerHub, ${name}! 🎮`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
};

/**
 * Send payment confirmation email - LOGS TO CONSOLE
 */
const sendPaymentConfirmationEmail = async (email, name, plan, expireTime) => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📧 PAYMENT CONFIRMATION EMAIL');
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
