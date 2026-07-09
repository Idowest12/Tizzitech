const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(
  "setDeliveryZones([...deliveryZones, newZone]);",
  "const nz = [...deliveryZones, newZone];\n                              setDeliveryZones(nz);\n                              saveSettings(null, null, nz);"
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
