const transporter = require('../config/mailer');

const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`[Email - DEV MODE, no SMTP credentials] To: ${to} | Subject: ${subject}`);
    return { messageId: 'dev-mode-no-op' };
  }
  return transporter.sendMail({
    from: process.env.SMTP_FROM || 'CabShare <no-reply@cabshare.app>',
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
