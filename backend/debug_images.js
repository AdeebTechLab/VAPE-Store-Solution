const fs = require('fs');
const path = require('path');
const http = require('http');

const UPLOADS_DIR = path.join(__dirname, 'uploads');

console.log('Checking uploads directory:', UPLOADS_DIR);

if (fs.existsSync(UPLOADS_DIR)) {
    console.log('Uploads directory exists.');
    const files = fs.readdirSync(UPLOADS_DIR);
    console.log('Files in uploads:', files);

    if (files.length > 0) {
        const testFile = files[0];
        console.log(`Testing access to: http://localhost:5000/uploads/${testFile}`);

        http.get(`http://localhost:5000/uploads/${testFile}`, (res) => {
            console.log('Response status:', res.statusCode);
            console.log('Content-Type:', res.headers['content-type']);
        }).on('error', (e) => {
            console.error('Error fetching file:', e.message);
        });
    } else {
        console.log('No files to test.');
    }
} else {
    console.error('Uploads directory does NOT exist.');
}
