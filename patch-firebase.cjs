const fs = require('fs');
let code = fs.readFileSync('src/firebase.ts', 'utf-8');

const auditLogFn = `
export const logAuditActivity = async (action: string, details: string, email: string) => {
  try {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    // Best effort attempt to gather client IP/UA if possible on client side, but we also rely on backend validation
    const userAgent = navigator.userAgent;
    let ip = 'unknown';
    try {
      const res = await fetch('https://api.ipify.org?format=json');
      const data = await res.json();
      ip = data.ip;
    } catch(e) {}
    
    await setDoc(doc(db, 'audit_logs', id), {
      id,
      timestamp: Date.now(),
      action,
      details,
      email,
      ip,
      userAgent
    });
  } catch (e) {
    console.error("Failed to log activity:", e);
  }
};
`;

code = code + '\n' + auditLogFn;
fs.writeFileSync('src/firebase.ts', code);
