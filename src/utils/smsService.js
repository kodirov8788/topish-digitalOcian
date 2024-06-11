const axios = require("axios");
const FormData = require("form-data"); // Make sure to install this package

// // Utility function to authenticate with Eskiz and get a token
// async function getEskizAuthToken() {
//   let data = new FormData();
//   data.append("email", process.env.ESKIZ_EMAIL);
//   data.append("password", process.env.ESKIZ_PASSWORD);

//   let config = {
//     method: "post",
//     url: "https://notify.eskiz.uz/api/auth/login",
//     headers: {
//       ...data.getHeaders(),
//     },
//     data: data,
//   };

//   try {
//     const response = await axios(config);
//     return response.data.data.token;
//   } catch (error) {
//     console.error("Error during Eskiz authentication:", error);
//     throw error;
//   }
// }

// // Function to send SMS with a custom message
// async function sendCustomSms(token, phone, message) {
//   const smsData = new FormData();
//   smsData.append("mobile_phone", phone);
//   smsData.append("message", message);
//   smsData.append("from", "4546");

//   let config = {
//     method: "post",
//     url: "https://notify.eskiz.uz/api/message/sms/send",
//     headers: {
//       ...smsData.getHeaders(),
//       Authorization: `Bearer ${token}`,
//     },
//     data: smsData,
//   };

//   try {
//     const response = await axios(config);
//     console.log("SMS response:", response.data);
//   } catch (error) {
//     console.error("Error during SMS sending:", error);
//     throw error;
//   }
// }

// app.post("/register", async (req, res) => {
//   console.log("Request received");
//   const user = req.body;
//   let message = "";
//   const confirmationCode = Math.floor(100000 + Math.random() * 900000); // Generates a 6 digit random number

//   if (user.action === "register") {
//     message = `topish.org saytida ro‘yxatdan o‘tish uchun tasdiqlash codi: ${confirmationCode}`;
//   } else if (user.action === "resetPassword") {
//     message = `topish.org saytidagi parolingizni tiklash uchun tasdiqlash kodi: ${confirmationCode}`;
//   } else if (user.action === "balanceUpdate") {
//     message = `Hurmatli ${user.name}, sizning hisobingizdagi mablag': ${user.balance}. Hisobingizni o'z vaqtida to'ldiring.`;
//   }

//   try {
//     const token = await getEskizAuthToken(); // Get the authentication token
//     console.log("Token:", token);
//     await saveUserWithConfirmationCode(user.phone, confirmationCode);

//     await sendCustomSms(token, user.phone, message); // Send SMS with the custom message

//     res.send("Please check your phone for the message");
//   } catch (error) {
//     console.error("Error in registration process:", error);
//     res.status(500).send("There was an error processing your request");
//   }
// });

async function getEskizAuthToken() {
  let data = new FormData();
  data.append("email", process.env.ESKIZ_EMAIL);
  data.append("password", process.env.ESKIZ_PASSWORD);

  let config = {
    method: "post",
    url: "https://notify.eskiz.uz/api/auth/login",
    headers: {
      ...data.getHeaders(),
    },
    data: data,
  };

  try {
    const response = await axios(config);
    return response.data.data.token;
  } catch (error) {
    console.error("Error during Eskiz authentication:", error);
    throw error;
  }
}

// Function to send SMS with a custom message
async function sendCustomSms(token, phone, message) {
  const smsData = new FormData();
  smsData.append("mobile_phone", phone);
  smsData.append("message", message);
  smsData.append("from", "4546");

  let config = {
    method: "post",
    url: "https://notify.eskiz.uz/api/message/sms/send",
    headers: {
      ...smsData.getHeaders(),
      Authorization: `Bearer ${token}`,
    },
    data: smsData,
  };

  try {
    const response = await axios(config);
    console.log("SMS response:", response.data);
  } catch (error) {
    console.error("Error during SMS sending:", error);
    throw error;
  }
}

module.exports = { getEskizAuthToken, sendCustomSms };
