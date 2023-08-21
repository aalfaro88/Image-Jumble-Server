// server/models/Path.js
const mongoose = require('mongoose');
const Layer = require('./Layer');

const pathSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    layers: {
      type: [Layer.schema],
      default: [
        {
          name: 'Background',
          images: [],
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
