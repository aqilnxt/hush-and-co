const fs = require('fs');
const parser = require('@babel/parser');
const lines = fs
    .readFileSync('resources/js/pages/admin/MenuManager.jsx', 'utf8')
    .split(/\r?\n/);
const start = 860;
for (let end = 870; end <= 980; end += 1) {
    const slice = lines
        .slice(start - 1, end)
        .join('\n')
        .replace(/`/g, '\\`');
    const code = `const React = require('react'); function X(){ return (${slice}); }`;
    try {
        parser.parse(code, { sourceType: 'module', plugins: ['jsx'] });
        console.log(end + ': OK');
        break;
    } catch (err) {
        const loc = err.loc ? err.loc.line + ':' + err.loc.column : 'unknown';
        console.log(end + ': FAIL - ' + err.message + ' at ' + loc);
    }
}
