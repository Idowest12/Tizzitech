const fs = require('fs');
let lines = fs.readFileSync('server.ts', 'utf-8').split('\n');

const startIdx = lines.findIndex((l, i) => l.includes('// ========================================================') && i > 1700);
let endIdx = -1;
if (startIdx !== -1) {
    endIdx = lines.findIndex((l, i) => l.includes('// ========================================================') && i > startIdx);
}

if (startIdx !== -1 && endIdx !== -1) {
    lines.splice(startIdx, endIdx - startIdx + 1);
    fs.writeFileSync('server.ts', lines.join('\n'));
    console.log('Removed duplicate endpoints from line ' + (startIdx + 1) + ' to ' + (endIdx + 1));
} else {
    console.log('Could not find the duplicate endpoints block.');
}
