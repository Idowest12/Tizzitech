const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const target = `    try {
      const compressedFile = await compressImage(file);
      const formData = new FormData();
      formData.append('image', compressedFile);
      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`
        },
        body: formData
      });
      const data = await res.json();`;

const replacement = `    try {
      const compressedFile = await compressImage(file);
      
      // Convert to Base64 to bypass Vercel serverless limitations with multipart form data
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
      });
      reader.readAsDataURL(compressedFile);
      const base64Data = await base64Promise;

      const token = sessionStorage.getItem('tizzitech_admin_token') || '';
      
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${token}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64Data })
      });
      
      if (!res.ok && res.headers.get('content-type')?.includes('text/html')) {
          throw new Error('Server returned HTML. Vercel payload limit might be exceeded, or route crashed.');
      }
      
      const data = await res.json();`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/AdminDashboard.tsx', code);
