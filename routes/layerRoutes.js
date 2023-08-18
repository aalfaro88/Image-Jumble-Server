//layerRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true });

const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, async (req, res) => { 
  try {
    const projectId = req.params.projectId; 
    const { name, images } = req.body;

    console.log('Received request to add layer:', projectId, name, images);

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const newLayer = {
      name,
      images: images || [],
    };

    project.layers.push(newLayer);

    console.log('Saving layer to MongoDB:', req.originalUrl); 

    await project.save();

    res.status(201).json(newLayer);
  } catch (error) {
    res.status(500).json({ message: 'Error creating layer.', error });
  }
});

module.exports = router;
