// src/db/connect.js
const mongoose = require("mongoose");

const connectDB = (url) => {
  return mongoose
    .connect(url)
    .then(() => {
      console.log("The DB is connected successfully");
    })
    .catch((err) => console.log(err));
};

module.exports = connectDB;
