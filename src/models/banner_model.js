// src/models/banner_model.js
const mongoose = require("mongoose");

const BannerModel = new mongoose.Schema({
  bannerImages: {
    type: Array,
    required: true,
    default: [],
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("Banner", BannerModel);
