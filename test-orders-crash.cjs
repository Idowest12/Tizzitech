const jwt = require('jsonwebtoken');
const token = jwt.sign({ userId: 'U999', email: 'test999@example.com', role: 'user' }, process.env.JWT_SECRET || 'tizzitech_super_secret_jwt_key_2025_override', { expiresIn: '7d' });
fetch('http://localhost:3000/api/users/U999/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(res => res.text()).then(console.log).catch(console.error);
