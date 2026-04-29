# CloudSecureIT - Secure Document Upload

## Project Overview

CloudSecureIT is a secure document upload web application that allows users to submit and retrieve documents through a web interface.

Uploaded files are stored securely in Azure Blob Storage, and each document is accessible through a temporary secure link generated using Azure Shared Access Signature (SAS).

This project demonstrates real-world cloud integration, secure file handling, and backend development using Node.js and Azure services.

---

APP LIVE : https://cloudsecureit-app-01-e0bsg6bpbrf2d3fd.canadacentral-01.azurewebsites.net/


## Features

- Secure document upload form
- Upload support for PDF, DOCX, TXT and other file types
- Cloud storage using Azure Blob Storage
- Generation of secure, time-limited SAS URLs
- Metadata storage (user info + file info)
- Submissions tracking page
- Clean and user-friendly interface

---

## Application Architecture

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **File Handling:** Multer (memory storage)
- **Cloud Storage:** Azure Blob Storage
- **Security:** Secure SAS (Shared Access Signature) URL
- **Data Tracking:** JSON file (`data/submissions.json`)

---

## Technologies Used

- Node.js
- Express.js
- Multer
- Azure Blob Storage SDK
- dotenv
- HTML5
- CSS3
- JavaScript

---

## Project Structure

```text
CloudSecureIT-Docker-ACR-WebApp-Certificates/
│
├── data/
│   └── submissions.json
├── public/
│   ├── index.html
│   └── submissions.html
├── screenshots/
├── src/
│   └── app.js
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```
