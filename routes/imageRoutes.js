//imageRoutes.js

const express = require('express');
const router = express.Router();
const { Image, imageSchema } = require('../models/Image');
const { uploadImg, createOverlay }  = require("../cloudinary.config");

const isAuthenticated = require('../middleware/isAuthenticated');

const Layer = require("../models/Layer");
const Project = require('../models/Project');


const maxImageCount = 20;

router.post("/upload-image/:projectId/:layerId", uploadImg.array("picture", maxImageCount), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(500).json({ msg: "Upload fail. No files received." });
  }

  const urls = req.files.map((file) => file.path);
  return res.status(201).json({ urls });
});


router.post('/projects/:projectId/layers/:layerId/images', isAuthenticated, async (req, res) => {
  try {
    const names = req.body.names;
    const projectId = req.params.projectId;
    const layerId = req.params.layerId;

    console.log('Received ProjectID:', projectId);
    console.log('Received LayerID:', layerId);
    console.log('Received image names:', names);

    const projectToUpdate = await Project.findById(projectId);
    if (!projectToUpdate) {
      return res.status(404).json({ msg: 'Project not found.' });
    }

    
    const targetLayer = projectToUpdate.layers.find(layer => layer._id.toString() === layerId);
    if (targetLayer) {
      targetLayer.images.push(...names);
    } else {
      return res.status(404).json({ msg: 'Layer not found.' });
    }

    await projectToUpdate.save();

    res.status(201).json(projectToUpdate);
  } catch (error) {
    console.error('Error saving image names:', error);
    res.status(500).json({ msg: 'Failed to save image names.' });
  }
});

router.get('/projects/:projectId/layers/:layerId/images', isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const layerId = req.params.layerId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found.' });
    }

    const targetLayer = project.layers.find(layer => layer._id.toString() === layerId);
    if (!targetLayer) {
      return res.status(404).json({ msg: 'Layer not found.' });
    }

    const images = targetLayer.images;
    const numberImages = images.length;

    res.status(200).json({ numberImages, images });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ msg: 'Failed to fetch images.' });
  }
});

router.get('/images/:projectId/:layerId', async (req, res) => {
  try {
    const { projectId, layerId } = req.params;
    const images = await Image.find({ project: projectId, layer: layerId });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images.', error });
  }
});

router.put('/images/:imageId', async (req, res) => {
  try {
    const { name } = req.body;
    const { imageId } = req.params;
    const image = await Image.findByIdAndUpdate(imageId, { name }, { new: true });
    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }
    res.json(image);
  } catch (error) {
    console.error("Error updating image:", error);
    res.status(500).json({ message: 'Failed to update image.', error });
  }
});

router.delete('/images/:imageId', async (req, res) => {
  try {
    const { imageId } = req.params;
    const image = await Image.findByIdAndDelete(imageId);
    if (!image) {
      return res.status(404).json({ message: 'Image not found.' });
    }

    await cloudinary.uploader.destroy(image.cloudinaryId);

    res.json({ message: 'Image deleted successfully.' });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).json({ message: 'Failed to delete image.', error });
  }
});

module.exports = router;
