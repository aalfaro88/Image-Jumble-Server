// server/models/Project.js

const mongoose = require('mongoose');
const Layer = require('./Layer'); 

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

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
