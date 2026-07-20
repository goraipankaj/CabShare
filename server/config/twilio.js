const twilio = require('twilio');

// If TWILIO_ACCOUNT_SID/AUTH_TOKEN are not set, the client is created in a
// "disabled" state and sendSms() below will log to console instead of
// throwing, so local development works without a Twilio account.
const hasCredentials = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;

const client = hasCredentials
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSms = async (to, body) => {
  if (!client) {
    console.log(`[SMS - DEV MODE, no Twilio credentials] To: ${to} | Body: ${body}`);
    return { sid: 'dev-mode-no-op' };
  }
  return client.messages.create({
    to,
    from: process.env.TWILIO_PHONE_NUMBER,
    body,
  });
};

module.exports = { client, sendSms };
