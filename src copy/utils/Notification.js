const admin = require("firebase-admin");
const { getMessaging } = require("firebase-admin/messaging");
let serviceAccount = require("../../serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

function sendNotification(tokens, notification, info) {
  // Ensure tokens is an array and not just a single string
  if (!Array.isArray(tokens)) {
    return;
  }

  let message = {
    notification: {
      title: notification.title,
      body: notification.body,
    },
    data: { ...info },
    tokens: tokens, // The array of device registration tokens.
  };

  getMessaging()
    .sendMulticast(message)
    .then((response) => {
      // console.log("Successfully sent messages:", response);
      // Detailed response handling can be added here
    })
    .catch((error) => {
      console.log("Error sending messages:", error);
    });
}

module.exports = sendNotification;
