const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 'U123', email: 'idowu6259@gmail.com', role: 'user' }, process.env.JWT_SECRET || 'tizzitech_super_secret_jwt_key_2025_override', { expiresIn: '7d' });
fetch('http://localhost:3000/api/users/U123/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.json()).then(d => console.dir(d, {depth: null})).catch(console.error);
