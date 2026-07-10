const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `app.post('/api/admin/upload-image', verifyAdminToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided.' });
  }

  // Convert buffer to Base64 string for Cloudinary upload
  const b64 = Buffer.from(req.file.buffer).toString('base64');
  let dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
  
  cloudinary.uploader.upload(dataURI, {
    resource_type: 'auto',
    folder: 'tizzitech_products',
  })
  .then((result) => {
    return res.json({ success: true, url: result.secure_url });
  })
  .catch((error) => {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image to Cloudinary.' });
  });
});`;

const replacement = `// Use express.json limit for large base64 strings
app.post('/api/admin/upload-image', verifyAdminToken, express.json({limit: '10mb'}), upload.single('image'), async (req, res) => {
  try {
    let dataURI = '';
    
    // Check if it's sent as a JSON body (base64)
    if (req.body && req.body.image) {
      dataURI = req.body.image;
    } 
    // Fallback to multer file upload if FormData is used
    else if (req.file) {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    } else {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'tizzitech_products',
    });
    
    return res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image to Cloudinary.' });
  }
});`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
