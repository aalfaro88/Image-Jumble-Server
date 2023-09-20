// models/Image.js

const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'None', // Set the default image name to 'None'
    },
    alt: {
      type: String,
      default: '', // You can set a default alt text if needed
    },
    rarity: {
      type: Number,
      min: 0.0,
      max: 100,
      default: 0, // Set the default rarity to 0
    },
  },
  { timestamps: true }
);

const Image = mongoose.model('Image', imageSchema);

module.exports = {
  Image,
  imageSchema,
};
