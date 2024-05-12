const mongoose = require("mongoose");

const GalleryModel = new mongoose.Schema({


  images: {
    type: Array,
    required: true,
    default: [],

  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Users" },
});

module.exports = mongoose.model("Gallery", GalleryModel);
