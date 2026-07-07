const jwt = require('jsonwebtoken');
console.log(jwt.sign({ role: 'admin' }, 'super_secure_jwt_string_893247832).'));
