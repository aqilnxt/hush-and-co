const fs = require('fs');
const parser = require('@babel/parser');
const code = fs.readFileSync(
    'resources/js/pages/admin/MenuManager.jsx',
    'utf8',
);
try {
    parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
    console.log('PARSE_OK');
} catch (e) {
    console.error('PARSE_ERROR:', e.message);
    if (e.loc) console.error('LOC:', e.loc);
    if (e.codeFrame) console.error(e.codeFrame);
    process.exit(1);
}
