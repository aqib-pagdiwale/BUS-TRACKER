const mongoose = require("mongoose");

const posMachineSchema = new mongoose.Schema(
  {
    deviceId: { type: String, required: true, unique: true },
    model: String,
    vendor: String,
  },
  { timestamps: true },
);

module.exports = mongoose.model("PosMachine", posMachineSchema);
