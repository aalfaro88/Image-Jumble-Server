// routes/deleteCloudinaryFolder.js

const express = require("express");
const router = express.Router();
const { deleteCloudinaryFolder } = require('../cloudinary.config'); 


router.delete('/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;

    const folderPath = `Image-randomizer/${projectId}`;
    await deleteCloudinaryFolder(folderPath);

    res.status(200).json({ message: 'Cloudinary folder deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting Cloudinary folder.', error });
  }
});

module.exports = router;