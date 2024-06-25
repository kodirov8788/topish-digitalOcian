const axios = require("axios");
const FormData = require("form-data"); // Make sure to install this package

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
