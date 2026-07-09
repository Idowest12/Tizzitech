const req = { headers: {} };
try {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  console.log(ip);
} catch (e) {
  console.log("Error:", e.message);
}
