// /routes/randomizeRoutes.js


const express = require("express");
const router = express.Router();
const { createCanvas, loadImage, Image } = require("canvas");

const clients = [];

const createTransparentImage = (width, height) => {
  const canvas = createCanvas(width, height);
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, width, height); // Clear the canvas to make it transparent
  return canvas.toDataURL();
};


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

const getRandomIndexByRarity = (layer) => {
  const totalRarity = layer.reduce((acc, cur) => acc + cur.rarity, 0);
  let random = Math.random() * totalRarity;
  for (let i = 0; i < layer.length; i++) {
    random -= layer[i].rarity;
    if (random < 0) return i;
  }
  return 0; // fallback
};

router.post("/overlay-images", async (req, res) => {
  try {
    const imageUrlsWithRarity = req.body.imageUrlsWithRarity;
    const pathSizes = req.body.pathSizes;
    const numImages = req.body.numImages;
    const projectInfo = req.body.projectInfo;

    console.log("This is the collection size:", numImages);
    console.log("These are the path sizes:", pathSizes);
    console.dir(imageUrlsWithRarity, { depth: null });

    const selectedPathsArray = [];
    const allSelectedUrls = [];
    const logOutputArray = [];

    for (let i = 0; i < numImages; i++) {
      const selectedPathIndex = getRandomPathIndex(pathSizes);
      selectedPathsArray.push(selectedPathIndex);
      pathSizes[selectedPathIndex] -= 1;

      const selectedPathObject = imageUrlsWithRarity[selectedPathIndex];
      const selectedPath = selectedPathObject.layers;

      const selectedUrlsForPath = [];
      const selectedAdditionalInfoForPath = [];

      for (const layerObject of selectedPath) {
        const layer = layerObject.images;
        const randomIndex = getRandomIndexByRarity(layer);
        const selectedImage = layer[randomIndex];
        selectedUrlsForPath.push(selectedImage.url);

        // Extract the necessary information
        const additionalInfo = {
          pathId: selectedPathObject.pathId,
          layerId: layerObject.layerId,
          imageName: extractImageName(selectedImage.url), // Extract image name without extension
        };
        console.log("imagename:", additionalInfo.imageName);

        selectedAdditionalInfoForPath.push(additionalInfo);
      }

      // Convert the IDs to image names in logOutputArray
      const logOutputItem = selectedAdditionalInfoForPath.reduce((acc, info) => {
        // Find the path with the same ID in projectInfo
        const selectedPath = projectInfo.paths.find((path) => path.pathId === info.pathId);
      
        if (selectedPath) {
          // Find the layer with the same ID in the selectedPath
          const selectedLayer = selectedPath.layers.find((layer) => layer.layerId === info.layerId);
      
          if (selectedLayer) {
            // Set the layerName and imageName
            acc[selectedLayer.name] = info.imageName;
          } else {
            console.log(`Layer with layerId ${info.layerId} not found.`);
          }
        } else {
          console.log(`Path with pathId ${info.pathId} not found.`);
        }
      
        return acc;
      }, {});
      

      allSelectedUrls.push(selectedUrlsForPath);
      logOutputArray.push(logOutputItem);
    }

    // Function to extract image name without extension
    function extractImageName(url) {
      const imageNameWithExtension = url.split('/').pop(); // Get the last part of the URL
      const imageNameWithoutExtension = imageNameWithExtension.split('.')[0]; // Remove the file extension
      return imageNameWithoutExtension;
    }

    const selectedProject = projectInfo; // Replace with your logic to extract the project ID

    console.log("selectedPathsArray:", selectedPathsArray);
    console.log("allSelectedUrls:", allSelectedUrls);
    console.log("logOutputArray:", logOutputArray);
    console.log("Project Info:", selectedProject);

    res.json({ allSelectedUrls, logOutputArray, selectedProject });
  } catch (error) {
    console.error("Error handling image URLs:", error);
    res.status(500).json({ msg: "Failed to handle image URLs." });
  }
});





function getRandomPathIndex(remainingPathSizes) {
  const totalRemaining = remainingPathSizes.reduce((acc, val) => acc + val, 0);
  let randomValue = Math.floor(Math.random() * totalRemaining);
  for (let i = 0; i < remainingPathSizes.length; i++) {
    randomValue -= remainingPathSizes[i];
    if (randomValue < 0) {
      return i;
    }
  }
}

router.post("/generate-images", async (req, res) => {
  try {
    const allSelectedUrls = req.body.allSelectedUrls;
    const resultImageUrls = [];
    
    for (const pathImages of allSelectedUrls) {
      console.log('pathImages at start of loop:', pathImages); // Add this line
      
    
      const canvas = createCanvas();
      const context = canvas.getContext("2d");

      // Load and draw base image
      const baseImageUrl = pathImages.find(url => url && url.toLowerCase() !== 'none');
      if (!baseImageUrl) {
          console.error('No valid base image found in pathImages:', pathImages);
          continue;  // Skip this iteration if no valid base image is found
      }

      const baseImage = await loadImage(baseImageUrl);
      canvas.width = baseImage.width;
      canvas.height = baseImage.height;
      context.drawImage(baseImage, 0, 0);

      // Overlay other images in order

      for (const imageUrl of pathImages) {
        if (imageUrl === 'None') {
          continue;
        }
        
        console.log('overlayImageUrl before the condition:', imageUrl); // Log the value to check what it is
        
        if (imageUrl === null || imageUrl === undefined || imageUrl.toLowerCase() === 'none') {
          console.log('Skipping overlayImageUrl:', imageUrl);
          continue;
        }
        
        console.log('Trying to load image:', imageUrl); // Add this line
        // Load and draw overlay image
        const overlayImage = await loadImage(imageUrl);
        context.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
      }

      // Convert the canvas to a data URL and store it
      const resultImageUrl = canvas.toDataURL();
      resultImageUrls.push(resultImageUrl);
    }

    console.log("Image processing completed.");

    // Send the generated image URLs back to the client
    res.json({ success: true, imageUrls: resultImageUrls });
  } catch (error) {
    console.error("Error generating images:", error);
    res.status(500).json({ msg: "Failed to generate images." });
  }
});




//     const resultImageUrls = [];

//     for (const pathImages of allSelectedUrls) {
//       const canvas = createCanvas();
//       const context = canvas.getContext("2d");

//       // Load and draw base image
//       const baseImageUrl = pathImages[0];
//       const baseImage = await loadImage(baseImageUrl);
//       canvas.width = baseImage.width;
//       canvas.height = baseImage.height;
//       context.drawImage(baseImage, 0, 0);

//       // Overlay other images in order
//       for (let i = 1; i < pathImages.length; i++) {
//         const overlayImageUrl = pathImages[i];
//         console.log("THIS IS PATH:",pathImages[4])
//         // Skip the "None" image
//         if (overlayImageUrl === "None" || overlayImageUrl === undefined) {
//           console.log("None FOUND")
//           // Create a transparent image with the same size as others
//           const transparentImage = createTransparentImage(baseImage.width, baseImage.height);
//           const transparentOverlay = await loadImage(transparentImage);
//           context.drawImage(transparentOverlay, 0, 0, baseImage.width, baseImage.height);
//         } else {
//           console.log("This was not None")
//           // Load and draw overlay image
//           const overlayImage = await loadImage(overlayImageUrl);
//           context.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
//         }
//       }

//       // Convert the canvas to a data URL and store it
//       const resultImageUrl = canvas.toDataURL();
//       resultImageUrls.push(resultImageUrl);
//     }

//     console.log("Image processing completed.");

//     // Send the generated image URLs back to the client
//     res.json({ success: true, imageUrls: resultImageUrls });
//   } catch (error) {
//     console.error("Error generating images:", error);
//     res.status(500).json({ msg: "Failed to generate images." });
//   }
// });



// router.post("/overlay-images", async (req, res) => {
//   try {
//     const imageUrls = req.body.imageUrls;
//     const numImages = req.body.numImages;
//     const resultImageUrls = [];
//     console.log("This are the imageUrls received:",imageUrls)

//     for (let imageCount = 0; imageCount < numImages; imageCount++) {
//       const progress = Math.floor((imageCount / numImages) * 100);
//       sendProgressToClients(progress);
//       console.log(`Processing image ${imageCount + 1} of ${numImages}`);

//       const canvas = createCanvas();
//       const context = canvas.getContext("2d");

//       const baseImageIndex = Math.floor(Math.random() * imageUrls[0].length);
//       const baseImageUrl = imageUrls[0][baseImageIndex];
//       const baseImage = await loadImage(baseImageUrl);

//       canvas.width = baseImage.width;
//       canvas.height = baseImage.height;

//       context.drawImage(baseImage, 0, 0);

//       for (let i = 1; i < imageUrls.length; i++) {
//         if (imageUrls[i].length === 0) {
//           continue;
//         }

//         const overlayImageIndex = Math.floor(Math.random() * imageUrls[i].length);
//         const overlayImageUrl = imageUrls[i][overlayImageIndex];
//         const overlayImage = await loadImage(overlayImageUrl);
//         context.drawImage(overlayImage, 0, 0, overlayImage.width, overlayImage.height);
//       }

//       const resultImageUrl = canvas.toDataURL();
//       resultImageUrls.push(resultImageUrl);
//     }

//     console.log("Image processing completed.");
//     sendProgressToClients(100);
//     res.status(200).json({ success: true, imageUrls: resultImageUrls });
//   } catch (error) {
//     console.error("Error handling image URLs:", error);
//     res.status(500).json({ msg: "Failed to handle image URLs." });
//   }
// });

// function sendProgressToClients(progress) {
//   clients.forEach((client) => {
//     client.write(`data: ${JSON.stringify({ progress })}\n\n`);
//   });
// }


module.exports = router;

