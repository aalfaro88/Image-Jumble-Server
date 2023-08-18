// /routes/randomizeRoutes.js


const express = require("express");
const router = express.Router();
const { createCanvas, loadImage } = require("canvas");

const clients = [];

router.get("/overlay-images-progress", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Access-Control-Allow-Origin", "*");

  clients.push(res);

  req.on("close", () => {
    clients.splice(clients.indexOf(res), 1);
  });
});

router.post("/users/:userId/update-tokens", async (req, res) => {
  try {
    const userId = req.params.userId;
    const randomizeTokensValue = req.body.randomize_tokens; 

    console.log(randomizeTokensValue)

    res.status(200).json({ success: true, message: "Tokens updated successfully" });
  } catch (error) {
    console.error("Error updating tokens:", error);
    res.status(500).json({ success: false, message: "Failed to update tokens" });
  }
});


router.post("/overlay-images", async (req, res) => {
  try {
    const imageUrls = req.body.imageUrls;
    const numImages = req.body.numImages;
    const resultImageUrls = [];

    for (let imageCount = 0; imageCount < numImages; imageCount++) {
      const progress = Math.floor((imageCount / numImages) * 100);
      sendProgressToClients(progress);
      console.log(`Processing image ${imageCount + 1} of ${numImages}`);

      const canvas = createCanvas();
      const context = canvas.getContext("2d");

      const baseImageIndex = Math.floor(Math.random() * imageUrls[0].length);
      const baseImageUrl = imageUrls[0][baseImageIndex];
      const baseImage = await loadImage(baseImageUrl);

      canvas.width = baseImage.width;
      canvas.height = baseImage.height;

      context.drawImage(baseImage, 0, 0);

      for (let i = 1; i < imageUrls.length; i++) {
        if (imageUrls[i].length === 0) {
          continue;
        }

        const overlayImageIndex = Math.floor(Math.random() * imageUrls[i].length);
        const overlayImageUrl = imageUrls[i][overlayImageIndex];
        const overlayImage = await loadImage(overlayImageUrl);
        context.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
      }

      const resultImageUrl = canvas.toDataURL();
      resultImageUrls.push(resultImageUrl);
    }

    console.log("Image processing completed.");
    sendProgressToClients(100);
    res.status(200).json({ success: true, imageUrls: resultImageUrls });
  } catch (error) {
    console.error("Error handling image URLs:", error);
    res.status(500).json({ msg: "Failed to handle image URLs." });
  }
});

function sendProgressToClients(progress) {
  clients.forEach((client) => {
    client.write(`data: ${JSON.stringify({ progress })}\n\n`);
  });
}


module.exports = router;
