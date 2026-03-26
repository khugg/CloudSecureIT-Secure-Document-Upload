
require("dotenv").config();


const nodeCrypto = require("crypto");

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}



const {
  BlobServiceClient,
  StorageSharedKeyCredential,
  generateBlobSASQueryParameters,
  BlobSASPermissions
} = require("@azure/storage-blob");


const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();




const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || "documents";



app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));






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



// Azure upload function
async function uploadToAzure(file) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists();

  const blobName = Date.now() + "-" + file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadData(file.buffer);

   return {
    url: blockBlobClient.url,
    blobName
  };
}



// Generate SAS URL for secure access
function generateSasUrl(blobName) {
  const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);

  const startsOn = new Date(Date.now() - 5 * 60 * 1000);
  const expiresOn = new Date(Date.now() + 60 * 60 * 1000);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("r"),
      startsOn,
      expiresOn
    },
    sharedKeyCredential
  ).toString();

  return `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;
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


      // Upload file to Azure Blob Storage

const uploadResult = await uploadToAzure(file);
const fileUrl = uploadResult.url;
const sasUrl = generateSasUrl(uploadResult.blobName);

    const newSubmission = {
      id: Date.now(),
      firstName,
      lastName,
      email,
      documentType,
      originalFileName: file.originalname,
    storedFileName: uploadResult.blobName,
      fileUrl,
      sasUrl,
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
      fileUrl : sasUrl
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


const PORT = process.env.PORT || 3000;
   

// start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});