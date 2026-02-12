const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  lat: Number,
  lng: Number,

  posMachine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PosMachine",
    required: true,
  },

  bus: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bus",
    required: true,
  },

  deviceId: String,
  readableTime: String,

  time: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Location", locationSchema);
