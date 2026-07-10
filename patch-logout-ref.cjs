const fs = require('fs');
let code = fs.readFileSync('src/AdminApp.tsx', 'utf-8');

code = code.replace(
  /      setOtpValue\(''\);\n      setAdminEmail\(''\);\n    \} catch\(e\) \{/,
  `      setOtpValue('');
      setAdminEmail('');
      isManualLogin.current = false;
    } catch(e) {`
);

fs.writeFileSync('src/AdminApp.tsx', code);
