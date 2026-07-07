import https from 'https';

const API_KEY = "AIzaSyABanS45RFgZKdrrYzK9VXjZYdpr1qIIMw";
const PROJECT_ID = "tizzitech-ecommerce";

https.get(`https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders?key=${API_KEY}`, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
