// pathRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });

const Project = require('../models/Project');
const isAuthenticated = require('../middleware/isAuthenticated');

const defaultImage = {
    name: 'None',
    rarity: 0,
  };
  
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
            images: [defaultImage], // Add the default image here
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

  router.get('/:pathId/size', isAuthenticated, async (req, res) => {
    try {
      const { projectId, pathId } = req.params;
      
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
  
      const targetPath = project.paths.find(path => path._id.toString() === pathId);
      if (!targetPath) {
        return res.status(404).json({ message: 'Path not found.' });
      }
  
      res.status(200).json({ pathSize: targetPath.pathSize });
    } catch (error) {
      res.status(500).json({ message: 'Error fetching path size.', error });
    }
  });

  router.put('/:pathId/size', isAuthenticated, async (req, res) => {
    console.log("Received PUT request");
    console.log("Params:", req.params);
    console.log("Body:", req.body);
    try {
      const { projectId, pathId } = req.params;
      const { pathSize } = req.body;  // get the new path size from the request body
  
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
  
      const targetPath = project.paths.find(path => path._id.toString() === pathId);
      if (!targetPath) {
        return res.status(404).json({ message: 'Path not found.' });
      }
  
      targetPath.pathSize = pathSize;
      await project.save();
  
      res.status(200).json({ message: 'Path size updated successfully.' });
    } catch (error) {
      res.status(500).json({ message: 'Error updating path size.', error });
    }
  });

  // server/routes/yourRoutesFile.js
//   router.post('/:pathId/clone', isAuthenticated, async (req, res) => {
//     try {
//       const { projectId, pathId } = req.params;
  
//       const project = await Project.findById(projectId);
//       if (!project) {
//         return res.status(404).json({ message: 'Project not found.' });
//       }
  
//       const sourcePath = project.paths.find(path => path._id.toString() === pathId);
//       if (!sourcePath) {
//         return res.status(404).json({ message: 'Source path not found.' });
//       }
  
//       // Clone the source path and its layers
//       const clonedPath = {
//         name: `${sourcePath.name} - Clone`,
//         layers: [],
//       };
  
//       for (const sourceLayer of sourcePath.layers) {
//         const clonedLayer = {
//           name: sourceLayer.name,
//           images: [...sourceLayer.images], // Clone images array
//         };
//         clonedPath.layers.push(clonedLayer);
//       }
  
//       project.paths.push(clonedPath);
//       await project.save();
  
//       res.status(201).json(clonedPath);
//     } catch (error) {
//       res.status(500).json({ message: 'Error cloning path.', error });
//     }
//   });

router.post('/:pathId/clone', isAuthenticated, async (req, res) => {
    try {
      const { projectId, pathId } = req.params;
  
      // Log the data received from the client
      console.log('Received data:', req.body);
  
      // Step 1: Find the project
      const project = await Project.findById(projectId);
      if (!project) {
        return res.status(404).json({ message: 'Project not found.' });
      }
  
      // Step 2: Find the original path
      const originalPath = project.paths.find(path => path._id.toString() === pathId);
      if (!originalPath) {
        return res.status(404).json({ message: 'Path not found.' });
      }
  
      // Step 3: Determine the base name and find the next available number for the new path name
      const basePathName = req.body.pathName;
      let sameNamePaths = project.paths.filter(path => path.name.startsWith(basePathName));
      let maxNumber = sameNamePaths.reduce((max, path) => {
        let number = parseInt(path.name.replace(basePathName, '').replace('(', '').replace(')', ''), 10);
        return number > max ? number : max;
      }, 0);
  
      let newPath = { 
        name: `${basePathName}(${maxNumber + 1})`,
        layers: req.body.layers.map(layer => ({
          name: layer.layerName,
          images: [], // Initialize with no images; we will handle images later
        })),
      };
  
      // Step 5: Add the new path to the project and save it
      project.paths.push(newPath);
      await project.save();
  
      // Step 6: Send a response with the new path
      res.status(201).json(newPath);
    } catch (error) {
      res.status(500).json({ message: 'Error processing request.', error });
    }
  });
  
  
  
  
  module.exports = router;
