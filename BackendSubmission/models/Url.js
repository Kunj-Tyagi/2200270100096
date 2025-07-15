const mongoose = require("mongoose");

const clickSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  referrer: String,
  location: String,
});

const urlSchema = new mongoose.Schema({
  shortcode: { type: String, unique: true }, // this should match query
  originalUrl: String,
  expiry: Date,
  visitHistory: [
    {
      timestamp: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Url", urlSchema);