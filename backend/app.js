const express = require("express");
const app = express();
require("dotenv").config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const mongoDB = require("mongoose");
const CORS_URL = `http://localhost:3000`;
const mongoURL = process.env.MONGODB_URL;
const router = express.Router();
const util = require("util");
const multer = require("multer");
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;
const URL = "mongodb://127.0.0.1:27017";
// const URL = "mongodb+srv://sanskargour1234:Ua7BRnZnJm1QCNjb@cluster0.p5ccr6o.mongodb.net/";
const mongoClient = new MongoClient(URL);
const imgBucket = "photos";
const baseUrl = "http://localhost:5000/api/file/";

const storage = multer.diskStorage({
  // cb = call back
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname + "-" + Date.now());
  },
});

const cloudinary = { v2 } = require( "cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    // File uploaded successfully -> removes the locally saved temp file
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // removes the locally saved temp file as uploading got failed.
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const upload = multer({ storage });

app.use(
  cors({
    origin: CORS_URL,
    methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
  })
);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT"
  );
  next();
});

mongoDB.connect(mongoURL).then(function () {
  app.get("", (req, res) => {
    res.send("API Works");
  });
  app.use(express.json());
  app.use("/api", require("./routes/register"));
  app.use("/api/post", require("./routes/post"));
  app.use("/api/user", require("./routes/user"));
  app.use("/api/category", require("./routes/category"));

  app.post(
    "/api/file/upload",
    upload.single("post"),
    async (req, res) => {
      try {
        let postLocalPath;

        if (req.file) {
          postLocalPath = req.file?.path;
        }
      
        if (!postLocalPath) {
          return res.send({
            message: "You must select a post.",
          });
        }

        const post = await uploadToCloudinary(postLocalPath);

        if (!post) {
          return res.send({
            message: "You must select a file.",
          });
        }

        return res.status(200).send({ url: `${post.url}` });
      } catch (error) {
        console.log(error);
        return res.status(500).send(error);
      }
    }
  );

  app.get("/api/file", async (req, res) => {
    try {
      const database = mongoClient.db("test");
      const images = database.collection(imgBucket + ".files");
      const cursor = images.find({});

      if ((await cursor.count()) === 0) {
        return res.status(500).send({
          message: "No files found!",
        });
      }

      let fileInfos = [];
      await cursor.forEach((doc) => {
        fileInfos.push({
          name: doc.filename,
          url: baseUrl + doc.filename,
        });
      });

      return res.status(200).send({ url: `${baseUrl}${req.file.filename}` });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
      });
    }
  });

  app.get("/api/file/:name", async (req, res) => {
    try {
      const database = mongoClient.db("test");
      const bucket = new GridFSBucket(database, {
        bucketName: imgBucket,
      });

      let downloadStream = bucket.openDownloadStreamByName(req.params.name);

      downloadStream.on("data", function (data) {
        return res.status(200).write(data);
      });

      downloadStream.on("error", function (err) {
        return res
          .status(404)
          .send({ message: "Cannot download the Image!", error: err });
      });

      downloadStream.on("end", () => {
        return res.end();
      });
    } catch (error) {
      return res.status(500).send({
        message: error.message,
      });
    }
  });
});

app.listen(PORT, "0.0.0.0", (error) => {
  if (!error)
    console.log(
      "Server is Successfully Running, and App is listening on port " + PORT
    );
  else console.log("Error occurred, server can't start", error);
});
