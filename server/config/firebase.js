const admin = require('firebase-admin');

let initialized = false;

const initFirebase = () => {
  if (initialized) return admin;
  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
    console.warn('[Firebase] Credentials not set - push notifications will be logged, not sent.');
    return null;
  }
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
  initialized = true;
  return admin;
};

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const app = initFirebase();
  if (!app || !fcmToken) {
    console.log(`[Push - DEV MODE] To: ${fcmToken || 'no-token'} | ${title}: ${body}`);
    return null;
  }
  return app.messaging().send({
    token: fcmToken,
    notification: { title, body },
    data,
  });
};

module.exports = { initFirebase, sendPushNotification };
