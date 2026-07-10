const fs = require('fs');

// Patch PaystackService
let pCode = fs.readFileSync('src/services/paystack.ts', 'utf-8');
pCode = pCode.replace(
  /static async verifyTransaction\(reference: string\): Promise<boolean> \{\n    try \{\n      const response = await fetch\(`\/api\/payment\/verify\?reference=\$\{reference\}`\);\n      const data = await response\.json\(\);\n      return data\.success;\n    \} catch \(error\) \{\n      console\.error\('Error verifying transaction:', error\);\n      return false;\n    \}\n  \}/,
  `static async verifyTransaction(reference: string): Promise<{success: boolean, message?: string}> {
    try {
      const response = await fetch(\`/api/payment/verify?reference=\$\{reference\}\`);
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error: any) {
      console.error('Error verifying transaction:', error);
      return { success: false, message: error.message };
    }
  }`
);
fs.writeFileSync('src/services/paystack.ts', pCode);

// Patch CheckoutView
let cCode = fs.readFileSync('src/components/CheckoutView.tsx', 'utf-8');
cCode = cCode.replace(
  /const isVerified = await PaystackService\.verifyTransaction\(reference\.reference\);\n\s*if \(isVerified\) \{\n\s*handleConfirmOrder\(\);\n\s*\} else \{\n\s*setErrorMessage\('Payment verification failed\. Please contact support if you were debited\.'\);\n\s*\}/,
  `const verifyResult = await PaystackService.verifyTransaction(reference.reference);
          if (verifyResult.success) {
            handleConfirmOrder();
          } else {
            setErrorMessage('Payment verification failed: ' + (verifyResult.message || 'Please contact support if you were debited.'));
          }`
);
fs.writeFileSync('src/components/CheckoutView.tsx', cCode);
