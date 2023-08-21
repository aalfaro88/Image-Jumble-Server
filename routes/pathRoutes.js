// pathRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });

const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');


router.post('/', isAuthenticated, async (req, res) => {
  try {
    const projectId = req.params.projectId;
    const { name } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }

    const newPath = {
      name,
      layers: [
        {
          name: 'Background',
          images: [],
        },
      ],
    };

    project.paths.push(newPath);

    await project.save();

    res.status(201).json(newPath);
  } catch (error) {
    res.status(500).json({ message: 'Error creating path.', error });
  }
});

router.get('/', isAuthenticated, async (req, res) => {
    try {
      const projectId = req.params.projectId;
  
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
  
      res.status(200).json(project.paths);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching paths.', error });
    }
  });
  


router.put('/:pathId', isAuthenticated, async (req, res) => {
    try {
      const { projectId, pathId } = req.params;
      const { name } = req.body;
  
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
  
      const targetPath = project.paths.find(path => path._id.toString() === pathId);
      if (!targetPath) {
        return res.status(404).json({ message: 'Path not found.' });
      }
  
      targetPath.name = name;
      await project.save();
  
      res.status(200).json(targetPath);
    } catch (error) {
      res.status(500).json({ message: 'Error updating path name.', error });
    }
  });
  
  // Route to delete a path
  router.delete('/:pathId', isAuthenticated, async (req, res) => {
    try {
      const { projectId, pathId } = req.params;
  
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
  
      const targetPathIndex = project.paths.findIndex(path => path._id.toString() === pathId);
      if (targetPathIndex === -1) {
        return res.status(404).json({ message: 'Path not found.' });
      }
  
      project.paths.splice(targetPathIndex, 1);
      await project.save();
  
      res.status(200).json({ message: 'Path deleted successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting path.', error });
    }
  });

module.exports = router;
