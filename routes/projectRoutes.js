// routes/projectRoutes.js

const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, async (req, res) => {
  console.log('Step 1: Received request to create a project:', req.body);
  
  try {
    const { name } = req.body;
    console.log('Step 2: Extracted name:', name);

    console.log('Step 3: Extracting user from request:', req.user._id);
    const newProject = await Project.create({
      name,
      creator: req.user._id,
    });
    
    console.log('Step 4: Project created:', newProject);
    res.status(201).json(newProject);
  } catch (error) {
    console.log('Step 5: Caught an error:', error);
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


// Update collectionName
router.put('/collectionName/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { collectionName } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { collectionName },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating collectionName.', error });
  }
});

// Update collectionDescription
router.put('/collectionDescription/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { collectionDescription } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { collectionDescription },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating collectionDescription.', error });
  }
});

// Update imageName
router.put('/imageName/:projectId', isAuthenticated, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { imageName } = req.body;
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      { imageName },
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: 'Project not found.' });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Error updating imageName.', error });
  }
});



module.exports = router;
