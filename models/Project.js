// server/models/Project.js
const mongoose = require('mongoose');
const Layer = require('./Layer');
const Path = require('./Path'); // Add this line

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    paths: {
      type: [Path.schema],
      default: [
        {
          name: 'Path 1',
          layers: [
            {
              name: 'Background',
              images: [],
            },
          ],
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
