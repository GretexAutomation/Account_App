const fs = require('fs');
let html = fs.readFileSync('biller.html', 'utf8');

html = html.replace('     else if (id === "completed") {', '    } else if (id === "approved") {\n        Dashboard.loadApprovedSection();\n    } else if (id === "completed") {');

fs.writeFileSync('biller.html', html);
console.log('Fixed syntax error in biller.html');
