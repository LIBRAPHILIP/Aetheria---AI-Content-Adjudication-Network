import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/AETHERIA/g, 'GENLAYER');
content = content.replace(/Aetheria/g, 'GenLayer');
content = content.replace(/aetheria/g, 'genlayer');

fs.writeFileSync('src/App.tsx', content);
console.log('done replacing');
