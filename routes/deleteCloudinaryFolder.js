// routes/deleteCloudinaryFolder.js

const express = require("express");
const router = express.Router();
const { deleteCloudinaryFolder} = require('../cloudinary.config'); 



router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const folderPath = `image-jumble/${projectId}`;
    await deleteCloudinaryFolder(folderPath);

    res.status(200).json({ message: 'Cloudinary folder deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Cloudinary folder.', error });
  }
});


router.delete('/paths/:projectId/:pathId', async (req, res) => {
  try {
    const { projectId, pathId } = req.params;

    const folderPath = `image-jumble/${projectId}/${pathId}`;
    await deleteCloudinaryFolder(folderPath);

    res.status(200).json({ message: 'Path and Cloudinary folder deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting path and Cloudinary folder.', error });
  }
});



router.delete('/layers/:projectId/:pathId/:layerId', async (req, res) => {
  try {
    const { projectId, pathId, layerId } = req.params;

    const folderPath = `image-jumble/${projectId}/${pathId}/${layerId}`;
    await deleteCloudinaryFolder(folderPath);

    res.status(200).json({ message: 'Layer and Cloudinary folder deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting layer and Cloudinary folder.', error });
  }
});

router.delete('/delete-cloudinary-image/:projectId/:pathId/:layerId/:imageName', async (req, res) => {
  try {
    const { projectId, pathId, layerId, imageName } = req.params;
    console.log("Received delete request - projectId:", projectId, "pathId:", pathId, "layerId:", layerId, "imageName:", imageName);
    
    const publicId = `image-jumble/${projectId}/${pathId}/${layerId}/${imageName}`;
    console.log("Public ID for image:", publicId);
    
    // Call the deleteCloudinaryImage function to delete the image from Cloudinary
    await deleteCloudinaryImage(publicId);

    console.log("Image deleted successfully.");
    res.status(200).json({ message: 'Image and Cloudinary file deleted successfully.' });
  } catch (error) {
    console.error("Error deleting image and Cloudinary file:", error);
    res.status(500).json({ message: 'Error deleting image and Cloudinary file.', error });
  }
});


module.exports = router;