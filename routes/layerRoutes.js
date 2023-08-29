// layerRoutes.js

const express = require('express');
const router = express.Router({ mergeParams: true });

const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');

// router.post('/', isAuthenticated, async (req, res) => { 
//   try {
//     const projectId = req.params.projectId; 
//     const pathId = req.params.pathId; // Capture pathId from params
//     const { name, images } = req.body;

//     console.log('Received request to add layer:', projectId, pathId, name, images);

//     const project = await Project.findById(projectId);
//     if (!project) {
//       return res.status(404).json({ message: 'Project not found.' });
//     }

//     const targetPath = project.paths.find(path => path._id.toString() === pathId);
//     if (!targetPath) {
//       return res.status(404).json({ message: 'Path not found.' });
//     }

//     const newLayer = {
//       name,
//       images: images || [],
//     };

//     targetPath.layers.push(newLayer); // Push the new layer to the target path

//     console.log('Saving layer to MongoDB:', req.originalUrl); 

//     await project.save();

//     console.log('Layer saved:', newLayer);

//     res.status(201).json(newLayer);
//   } catch (error) {
//     console.error('Error creating layer:', error);
//     res.status(500).json({ message: 'Error creating layer.', error });
//   }
// });

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

router.delete('/:layerId', isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const pathId = req.params.pathId;
    const layerId = req.params.layerId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetPath = project.paths.find((path) => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ message: 'Path not found.' });
    }

    const targetLayerIndex = targetPath.layers.findIndex((layer) => layer._id.toString() === layerId);
    if (targetLayerIndex === -1) {
      return res.status(404).json({ message: 'Layer not found.' });
    }

    targetPath.layers.splice(targetLayerIndex, 1); // Remove the layer from the target path

    await project.save();

    res.status(200).json({ message: 'Layer deleted successfully.' });
  } catch (error) {
    console.error('Error deleting layer:', error);
    res.status(500).json({ message: 'Error deleting layer.', error });
  }
});

router.put('/:layerId', isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const pathId = req.params.pathId;
    const layerId = req.params.layerId;
    const { name } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetPath = project.paths.find((path) => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ message: 'Path not found.' });
    }

    const targetLayer = targetPath.layers.find((layer) => layer._id.toString() === layerId);
    if (!targetLayer) {
      return res.status(404).json({ message: 'Layer not found.' });
    }

    targetLayer.name = name; // Update the layer name

    await project.save();

    res.status(200).json({ message: 'Layer name updated successfully.' });
  } catch (error) {
    console.error('Error updating layer name:', error);
    res.status(500).json({ message: 'Error updating layer name.', error });
  }
});


router.put('/:layerId/reorder', isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const pathId = req.params.pathId;
    const layerId = req.params.layerId;
    const { newPosition } = req.body; // The new position for the layer

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const targetPath = project.paths.find((path) => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ message: 'Path not found.' });
    }

    const targetLayerIndex = targetPath.layers.findIndex((layer) => layer._id.toString() === layerId);
    if (targetLayerIndex === -1) {
      return res.status(404).json({ message: 'Layer not found.' });
    }

    const movedLayer = targetPath.layers.splice(targetLayerIndex, 1)[0];
    targetPath.layers.splice(newPosition, 0, movedLayer);

    await project.save();

    res.status(200).json({ message: 'Layer reordered successfully.' });
  } catch (error) {
    console.error('Error reordering layer:', error);
    res.status(500).json({ message: 'Error reordering layer.', error });
  }
});


module.exports = router;
