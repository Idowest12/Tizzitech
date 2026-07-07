const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutView.tsx', 'utf8');
code = code.replace(
  /if \(\!data\.success\) \{\s*setErrorMessage\([\s\S]*?return;\s*\}\s*\{\s*setErrorMessage\([\s\S]*?return;\s*\}/,
  `if (!data.success) {
    setErrorMessage(data.message || 'Failed to place order.');
    setIsSuccess(false);
    return;
  }`
);
fs.writeFileSync('src/components/CheckoutView.tsx', code);
