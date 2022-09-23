require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
//NodeJS Package
const path = require("path");
const PORT = process.env.PORT || 8080;
//upload middleware
const upload = require("./utils/upload");
//pg pool
const pool = require("./db");

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
//
//Durch diese Middleware haben wir mittels Front End Zugriff auf unsere Uploads.
//localhost:8080/public/uploads/filename.jpg
app.use("/public/uploads/", express.static(__dirname + "/public/uploads"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "./public/index.html");
});

app.post(
  "/upload-profile-pic",
  upload.single("profile_pic"),
  async (req, res) => {
    //falls wir keine Datei hochladen, wird ein Fehler geworfen
    if (!req.file) {
      res
        .status(400)
        .send(`No file uploaded. <a href="/"><button>go back</button></a>`);
    } else {
      console.log(req.file);
      try {
        const { originalname, filename } = req.file;
        const finalPath = `public/uploads/${filename}`;

        const uploadedImage = await pool.query(
          "INSERT INTO pictures (name, path) VALUES ($1, $2) RETURNING *",
          [originalname, finalPath]
        );
        console.log(uploadedImage);
        res.status(201).send("Uploaded successfully");
      } catch (err) {
        console.log(err.message);
        res.status(500).send("Upload failed");
      }
      // res.send(`<h1>Here is your image</h1>
      // <img src="/uploads/${req.file.filename}" alt="${req.file.filename}" />`);
    }
  }
);

//get all pictures stored in db
app.get("/pictures", async (req, res) => {
  try {
    const { rows: allPictures } = await pool.query("SELECT * FROM pictures");
    res.status(200).json(allPictures);
  } catch (err) {
    console.log(err.message);
  }
});

app.delete("/pictures/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const {
      rows: [deletedPic],
    } = await pool.query("DELETE FROM pictures WHERE id=$1", [id]);
    console.log(deletedPic);
    res.status(200).send("picture got deleted");
  } catch (err) {
    console.log(err.message);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
