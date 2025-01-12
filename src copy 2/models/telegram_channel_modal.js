const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const telegramChannel = new Schema(
  {
    name: { type: String, required: true },
    id: { type: String, required: true },
    link: { type: String, required: false },
    available: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  }, { timestamps: true }
);


const TelegramChannel = mongoose.model("TelegramChannel", telegramChannel);
module.exports = TelegramChannel;
