const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `    if (req.body && req.body.image) {
      dataURI = req.body.image;
    }`;

const replacement = `    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(500).json({ error: 'Cloudinary credentials are not configured on the server.' });
    }

    if (req.body && req.body.image) {
      dataURI = req.body.image;
    }`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
