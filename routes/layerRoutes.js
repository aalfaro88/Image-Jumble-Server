// layerRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true });

const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, async (req, res) => { 
  try {
    const projectId = req.params.projectId; 
    const pathId = req.params.pathId; // Capture pathId from params
    const { name, images } = req.body;

    console.log('Received request to add layer:', projectId, pathId, name, images);

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetPath = project.paths.find(path => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ message: 'Path not found.' });
    }

    const newLayer = {
      name,
      images: images || [],
    };

    targetPath.layers.push(newLayer); // Push the new layer to the target path

    console.log('Saving layer to MongoDB:', req.originalUrl); 

    await project.save();

    console.log('Layer saved:', newLayer);

    res.status(201).json(newLayer);
  } catch (error) {
    console.error('Error creating layer:', error);
    res.status(500).json({ message: 'Error creating layer.', error });
  }
});

module.exports = router;
