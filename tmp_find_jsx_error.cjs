const fs = require('fs');
const parser = require('@babel/parser');
const lines = fs
    .readFileSync('resources/js/pages/admin/MenuManager.jsx', 'utf8')
    .split('\n');
for (let i = 50; i <= lines.length; i += 10) {
    const code = lines.slice(0, i).join('\n');
    try {
        parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    } catch (e) {
        console.error('Error at slice lines:', i);
        console.error(e.message);
        process.exit(0);
    }
}
console.log('No error in progressive slices');
