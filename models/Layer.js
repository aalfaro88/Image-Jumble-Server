// server/models/Layer.js
const mongoose = require('mongoose');
const { imageSchema } = require('./Image'); // Import Image schema

// Define a default image with name "None" and rarity 0
const defaultImage = {
  name: 'None',
  rarity: 0,
};

const layerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    images: {
      type: [imageSchema],
      default: [defaultImage], // Set the default value for the images array
    },
  },
  {
    timestamps: true,
  }
);

const Layer = mongoose.model('Layer', layerSchema);

module.exports = Layer;
