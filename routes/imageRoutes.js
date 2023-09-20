//imageRoutes.js

const express = require('express');
const router = express.Router();
const { Image, imageSchema } = require('../models/Image');
const { uploadImg, createOverlay }  = require("../cloudinary.config");

const isAuthenticated = require('../middleware/isAuthenticated');

const Layer = require("../models/Layer");
const Project = require('../models/Project');
const Path = require('../models/Path')


const maxImageCount = 100;

router.post("/upload-image/:projectId/:pathId/:layerId/", uploadImg.array("picture", maxImageCount), (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(500).json({ msg: "Upload fail. No files received." });
  }

  const urls = req.files.map((file) => file.path);
  return res.status(201).json({ urls });
});

router.post('/projects/:projectId/paths/:pathId/layers/:layerId/images', isAuthenticated, async (req, res) => {
  try {
    const names = req.body.names;
    const rarities = req.body.rarities;
    const projectId = req.params.projectId;
    const pathId = req.params.pathId;
    const layerId = req.params.layerId;

    console.log('Received ProjectID:', projectId);
    console.log('Received PathID:', pathId);
    console.log('Received LayerID:', layerId);
    console.log('Received image names:', names);

    // Fetch the project, path, and layer
    const projectToUpdate = await Project.findById(projectId);
    if (!projectToUpdate) {
      return res.status(404).json({ msg: 'Project not found.' });
    }

    const targetPath = projectToUpdate.paths.find(path => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ msg: 'Path not found.' });
    }

    const targetLayer = targetPath.layers.find(layer => layer._id.toString() === layerId);
    if (!targetLayer) {
      return res.status(404).json({ msg: 'Layer not found.' });
    }

    const imagesToAdd = names.map((name, i) => ({
      name: name,
      rarity: rarities[i],
    }));

    targetLayer.images.push(...imagesToAdd);
    await projectToUpdate.save();

    res.status(201).json(projectToUpdate);
  } catch (error) {
    console.error('Error saving image names:', error);
    res.status(500).json({ msg: 'Failed to save image names.' });
  }
});


router.get('/projects/:projectId/paths/:pathId/layers/:layerId/images', isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const pathId = req.params.pathId;
    const layerId = req.params.layerId;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found.' });
    }

    const targetPath = project.paths.find(path => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ msg: 'Path not found.' });
    }

    const targetLayer = targetPath.layers.find(layer => layer._id.toString() === layerId);
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


router.get('/images/:projectId/:pathId/:layerId', async (req, res) => {
  try {
    const { projectId, pathId, layerId } = req.params;
    const images = await Image.find({ project: projectId, path: pathId, layer: layerId });
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch images.', error });
  }
});

router.put('/projects/:projectId/paths/:pathId/layers/:layerId/images/:imageId/rarity', isAuthenticated, async (req, res) => {
  try {
    const { projectId, pathId, layerId, imageId } = req.params;
    const newRarity = req.body.newRarity;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found.' });
    }

    const targetPath = project.paths.find(path => path._id.toString() === pathId);
    if (!targetPath) {
      return res.status(404).json({ msg: 'Path not found.' });
    }

    const targetLayer = targetPath.layers.find(layer => layer._id.toString() === layerId);
    if (!targetLayer) {
      return res.status(404).json({ msg: 'Layer not found.' });
    }

    const targetImage = targetLayer.images.find(image => image._id.toString() === imageId);
    if (!targetImage) {
      return res.status(404).json({ msg: 'Image not found.' });
    }

    targetImage.rarity = newRarity;
    await project.save();

    res.status(200).json({ msg: 'Successfully updated rarity.', updatedImage: targetImage });
  } catch (error) {
    console.error('Error updating rarity:', error);
    res.status(500).json({ msg: 'Failed to update rarity.' });
  }
});

module.exports = router;
