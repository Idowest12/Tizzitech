const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

code = code.replace(
  `export interface Order {`,
  `export interface Order {
  email?: string;
  fullname?: string;`
);

fs.writeFileSync('src/types.ts', code);
