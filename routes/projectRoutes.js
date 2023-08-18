// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');

// Route to create a new project
router.post('/', isAuthenticated, async (req, res) => {
  console.log('Received request to create a project:', req.body);
  try {
    const { name } = req.body;

    const newProject = await Project.create({
      name,
      creator: req.user._id,
    });

    res.status(201).json(newProject);
  } catch (error) {
    res.status(500).json({ error: 'Could not create the project' });
  }
});

router.get('/', isAuthenticated, async (req, res) => {
    try {
      const { creator } = req.query;
      let query = {};
      
      if (creator) {
        query.creator = creator;
      }
  
      const projects = await Project.find(query);
      res.status(200).json(projects);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching projects.', error });
    }
  });
  
// Route to get a project by ID
router.get('/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project.', error });
  }
});

// Route to update a project by ID
router.put('/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { name },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project.', error });
  }
});

// Route to delete a project by ID
router.delete('/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = req.params;
    const deletedProject = await Project.findByIdAndDelete(projectId);
    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project.', error });
  }
});

module.exports = router;
