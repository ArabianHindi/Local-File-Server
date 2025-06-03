const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Create upload directory if it doesn't exist
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR);
}

// Set up Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => cb(null, file.originalname)
});
const upload = multer({ storage });

// Serve uploaded files
app.use('/files', express.static(UPLOAD_DIR));

// Upload form
app.get('/', (req, res) => {
    const files = fs.readdirSync(UPLOAD_DIR);
    const fileList = files.map(f => `<li><a href="/files/${f}">${f}</a></li>`).join('');
    res.send(`
        <h1>Upload a File</h1>
        <form action="/upload" method="POST" enctype="multipart/form-data">
            <input type="file" name="file" />
            <button type="submit">Upload</button>
        </form>
        <h2>Files</h2>
        <ul>${fileList}</ul>
    `);
});

// Handle file upload
app.post('/upload', upload.single('file'), (req, res) => {
    res.redirect('/');
});

// Start server
app.listen(PORT, () => {
    const os = require('os');
    const networkInterfaces = os.networkInterfaces();
    const localIPs = [];

    for (const iface of Object.values(networkInterfaces)) {
        for (const config of iface) {
            if (config.family === 'IPv4' && !config.internal) {
                localIPs.push(config.address);
            }
        }
    }

    console.log(`File server running at:`);
    localIPs.forEach(ip => console.log(`→ http://${ip}:${PORT}`));
});
