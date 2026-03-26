
require("dotenv").config();
const { BlobServiceClient } = require("@azure/storage-blob");


const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();


const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "documents";



app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));







// create uploads if they don't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

// create data if they don't exist
if (!fs.existsSync("data")) {
  fs.mkdirSync("data");
}

const submissionsFilePath = path.join(__dirname, "../data/submissions.json");

if (!fs.existsSync(submissionsFilePath)) {
  fs.writeFileSync(submissionsFilePath, "[]");
}


//  storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage });


async function uploadToAzure(file) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists();

  const blobName = Date.now() + "-" + file.originalname;

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer);

  return blockBlobClient.url;
}
















// upload path(Road)

app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    const { firstName, lastName, email, documentType } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (!firstName || !lastName || !email || !documentType) {
      return res.status(400).json({ message: "All fields are required" });
    }



const fileUrl = await uploadToAzure(file);

    const newSubmission = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      documentType,
      originalFileName: file.originalname,
      storedFileName: file.originalname,
      fileUrl,
      submittedAt: new Date().toISOString()
    };

    const existingData = fs.readFileSync(submissionsFilePath, "utf-8");
    const submissions = JSON.parse(existingData);

    submissions.push(newSubmission);

    fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));



    res.json({
      message: "Thank you for your submission. We will contact you shortly.",
      user: {
        firstName,
        lastName,
        email,
        documentType
      },
     fileName: file.originalname,
      fileUrl,
    });
  } catch (error) {
    console.error("Upload error :", error);
    res.status(500).json({ message: "Upload failed" });
  }
});



// submissions path

app.get("/submissions", (req, res) => {
  try {
    if (!fs.existsSync(submissionsFilePath)) {
      return res.json([]);
    }

    const data = fs.readFileSync(submissionsFilePath, "utf-8");

    if (!data.trim()) {
      return res.json([]);
    }

    const submissions = JSON.parse(data);
    res.json(submissions);
  } catch (error) {
    console.error("Error reading submissions:", error);
    res.status(500).json({ message: "Error reading submissions" });
  }
});




// make accessible
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

const PORT = 3000;
   

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});