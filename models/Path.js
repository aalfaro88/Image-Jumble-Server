// server/models/Path.js
const mongoose = require('mongoose');
const Layer = require('./Layer');

// Define a default image with name "None" and rarity 0
const defaultImage = {
  name: 'None',
  rarity: 0,
};

const pathSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pathSize: {
      type: Number,
      default: 1,
    },
    layers: {
      type: [Layer.schema],
      default: [
        {
          name: 'Background',
          images: [defaultImage], // Adding defaultImage to the images array of the "Background" layer
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Path = mongoose.model('Path', pathSchema);

module.exports = Path;
