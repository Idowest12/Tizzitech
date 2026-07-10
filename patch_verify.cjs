const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

const target = `  try {
    const response = await fetch(\`https://api.paystack.co/transaction/verify/\$\{reference\}\`, {
      method: 'GET',
      headers: {
        Authorization: \`Bearer \$\{paystackSecret\}\`,
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    if (data.status && data.data.status === 'success') {
      return res.json({ success: true, data: data.data });
    } else {
      return res.status(400).json({ success: false, message: 'Transaction verification failed or is not successful.' });
    }
  } catch (err) {`;

const replacement = `  try {
    let cleanSecret = paystackSecret.trim();
    if (cleanSecret.startsWith('"') && cleanSecret.endsWith('"')) {
      cleanSecret = cleanSecret.slice(1, -1).trim();
    }
    if (cleanSecret.startsWith("'") && cleanSecret.endsWith("'")) {
      cleanSecret = cleanSecret.slice(1, -1).trim();
    }
    
    const response = await fetch(\`https://api.paystack.co/transaction/verify/\$\{reference\}\`, {
      method: 'GET',
      headers: {
        Authorization: \`Bearer \$\{cleanSecret\}\`,
        'Content-Type': 'application/json'
      },
    });
    const data = await response.json();
    
    if (data.status && data.data && data.data.status === 'success') {
      return res.json({ success: true, data: data.data });
    } else {
      console.error('Paystack API returned:', data);
      return res.status(400).json({ 
        success: false, 
        message: data.message || 'Transaction verification failed.',
        paystackResponse: data
      });
    }
  } catch (err: any) {`;

code = code.replace(target, replacement);

fs.writeFileSync('server.ts', code);
