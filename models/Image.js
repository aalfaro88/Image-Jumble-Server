// models/Image.js

const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true, 
    },
    alt: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model('Image', imageSchema);

module.exports = {
  Image,
  imageSchema,
};

