const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'tizzitech_products',
    });
    
    return res.json({ success: true, url: result.secure_url });
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image to Cloudinary.' });
  }
});`;

const replacement = `    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'tizzitech_products',
    });
    
    return res.json({ success: true, url: result.secure_url });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return res.status(500).json({ error: 'Failed to upload image: ' + (error.message || JSON.stringify(error)) });
  }
});`;

code = code.replace(target, replacement);
fs.writeFileSync('server.ts', code);
