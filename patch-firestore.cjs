const fs = require('fs');
let code = fs.readFileSync('firestore.rules', 'utf-8');

const auditLogRules = `
    function isValidAuditLog(data) {
      return data.keys().hasAll(['id', 'timestamp', 'action', 'details', 'email', 'ip', 'userAgent'])
        && data.id is string
        && data.timestamp is number
        && data.action is string
        && data.details is string
        && data.email is string
        && data.ip is string
        && data.userAgent is string;
    }

    match /audit_logs/{logId} {
      allow read: if isAdmin();
      // Allow creation by anyone (since login attempts can be from unauthenticated users),
      // but enforce strict schema validation to prevent abuse.
      allow create: if isValidAuditLog(incoming());
    }
`;

code = code.replace(
  "    match /admins/{adminId} {",
  auditLogRules + "\n    match /admins/{adminId} {"
);

fs.writeFileSync('firestore.rules', code);
