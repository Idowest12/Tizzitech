const http = require('http');

const data = JSON.stringify({
  key: 'DYungtizzi@67810'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/admin/authenticate',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    const resData = JSON.parse(body);
    const token = resData.token;
    console.log("Token:", token);
    
    // Now fetch orders
    const getReq = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/orders',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, (getRes) => {
      let getBody = '';
      getRes.on('data', (chunk) => getBody += chunk);
      getRes.on('end', () => {
        console.log("Status:", getRes.statusCode);
        console.log("Response length:", getBody.length);
        console.log("Response:", getBody.substring(0, 500));
      });
    });
    getReq.end();
  });
});

req.write(data);
req.end();
