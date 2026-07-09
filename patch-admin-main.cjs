const fs = require('fs');
let code = fs.readFileSync('src/admin-main.tsx', 'utf-8');

code = `
window.addEventListener('error', function(e) {
  document.body.innerHTML += '<div style="color:red;position:fixed;top:0;left:0;z-index:9999;background:white;padding:20px;">' + e.error?.message + '<br/>' + e.error?.stack + '</div>';
});
` + code;

fs.writeFileSync('src/admin-main.tsx', code);
