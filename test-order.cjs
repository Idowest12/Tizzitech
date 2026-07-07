const jwt = require('jsonwebtoken');
const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET || 'tizzitech_super_secret_jwt_key_2025_override', { expiresIn: '7d' });
fetch('http://localhost:3000/api/admin/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json()).then(d => console.dir(d, {depth: null})).catch(console.error);
