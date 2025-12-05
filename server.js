import express from "express";
import multer from "multer";
import fs from "fs";
import Replicate from "replicate";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_KEY,
});

app.post("/generate-video", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    const output = await replicate.run(
      "stability-ai/stable-video-diffusion",
      {
        input: {
          image: fs.createReadStream(imagePath),
          fps: 24,
          motion_bucket_id: 40,
          num_frames: 30
        }
      }
    );

    fs.unlinkSync(imagePath);

    return res.json({ video_url: output[0] });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running on port " + PORT));
