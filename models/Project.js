// server/models/Project.js
const mongoose = require('mongoose');
const Layer = require('./Layer');
const Path = require('./Path'); // Add this line


const defaultImage = {
  name: 'None',
  rarity: 0,
};

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
    collectionName: {
      type: String,
      default: function () {
        return this.name;
      },
    },
    collectionDescription: {
      type: String,
      default: '',
    },
    imageName: {
      type: String,
      default: '',
    },
    paths: {
      type: [Path.schema],
      default: [
        {
          name: 'Path 1',
          layers: [
            {
              name: 'Background',
              images: [defaultImage], // Include the default image in the layers
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

