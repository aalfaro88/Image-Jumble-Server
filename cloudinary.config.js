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
    const pathId = req.params.pathId;
    const layerId = req.params.layerId;
    const filename = file.originalname.replace(/\.[^/.]+$/, "");

    console.log("Project ID:", projectId);
    console.log("Path ID:", pathId);
    console.log("Layer ID:", layerId);
    console.log("Image Name:", file.originalname);

    const folder = `image-jumble/${projectId}/${pathId}/${layerId}`;

    const format = (() => {
      if (file.mimetype === "image/png") {
        return "png";
      } else if (file.mimetype === "image/gif") {
        return "gif";
      } else if (file.mimetype === "image/webp") {
        return "webp";
      }
      return "png";
    })();

    const imageUrl = cloudinary.url(filename, {
      public_id: `${folder}/${filename}`,
      format: format,
      secure: true,
    });

    console.log("Image URL:", imageUrl);

    return {
      folder,
      format,
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