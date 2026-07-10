const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target1 = `      const welcomeHtml = \`
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <h2 style="color: #007bff;">Welcome to Tizzitech!</h2>
          <p>Thank you for subscribing to our newsletter. You'll be the first to know about our latest tech accessories, exclusive deals, and more.</p>
          <p>Stay tuned!</p>
          <p>- The Tizzitech Team</p>
        </div>
      \`;`;

const replacement1 = `      const welcomeHtml = \`
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
          <h2 style="color: #007bff;">Thank You for Subscribing!</h2>
          <p>Thank you for subscribing to our newsletter. We will keep you updated at all times on new products, real tech insights, and maintenance updates.</p>
          <p>Stay tuned!</p>
          <p>- The Tizzitech Team</p>
        </div>
      \`;`;

code = code.replace(target1, replacement1);

const target2 = `  const welcomeHtml = \`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Welcome to Tizzitech!</h2>
      <p>Thank you for subscribing to our newsletter. You'll be the first to know about our latest tech accessories, exclusive deals, and more.</p>
      <p>Stay tuned!</p>
      <p>- The Tizzitech Team</p>
    </div>
  \`;`;

const replacement2 = `  const welcomeHtml = \`
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 20px;">
      <h2 style="color: #007bff;">Thank You for Subscribing!</h2>
      <p>Thank you for subscribing to our newsletter. We will keep you updated at all times on new products, real tech insights, and maintenance updates.</p>
      <p>Stay tuned!</p>
      <p>- The Tizzitech Team</p>
    </div>
  \`;`;

code = code.replace(target2, replacement2);

fs.writeFileSync('server.ts', code);
