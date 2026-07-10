const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  /export const sendEmail = async \(to: string, subject: string, html: string\) => \{\n  if \(process\.env\.SMTP_HOST && process\.env\.SMTP_USER\) \{/,
  `export const sendEmail = async (to: string, subject: string, html: string) => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {`
); // Let's check how many occurrences of export const sendEmail there are

