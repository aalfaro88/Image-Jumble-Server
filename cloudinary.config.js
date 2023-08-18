// cloudinary.config.js

const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const projectId = req.params.projectId;
    const layerId = req.params.layerId;
    const filename = file.originalname.replace(/\.[^/.]+$/, ""); 

    console.log("Project ID:", projectId);
    console.log("Layer ID:", layerId);
    console.log("Image Name:", file.originalname);

    const folder = `Image-randomizer/${projectId}/${layerId}`;


    const imageUrl = cloudinary.url(filename, {
      public_id: `${folder}/${filename}`,
      format: "png",
      secure: true, 
    });

    console.log("Image URL:", imageUrl); 

    return {
      folder,
      format: "png",
      public_id: filename,
      access_mode: "public",
    };
  },
});

const deleteCloudinaryFolder = async (folderPath) => {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folderPath);
    console.log("Deleted Cloudinary folder:", result);
  } catch (error) {
    console.error("Error deleting Cloudinary folder:", error);
  }
};

const uploadImg = multer({ storage });

module.exports = { uploadImg, deleteCloudinaryFolder};