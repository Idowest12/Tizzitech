const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const regex = /<div class="logo" style="display: flex; align-items: center; gap: 10px;">[\s\S]*?<\/div>/;

const newLogoHtml = `<div class="logo" style="display: flex; align-items: center; gap: 10px;">
                  <img src="\${window.location.origin}/logo.svg" alt="Tizzitech Logo" style="height: 48px;" />
                </div>`;

code = code.replace(regex, newLogoHtml);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
