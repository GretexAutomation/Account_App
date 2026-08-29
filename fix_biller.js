const fs = require('fs');
let html = fs.readFileSync('biller.html', 'utf8');

// 1. Remove the injected section-approved tag
html = html.replace('<div class="section" id="section-approved">\n\n        \n', '        \n');
html = html.replace('<div class="section" id="section-approved">\n\n', '');
html = html.replace('<div class="section" id="section-approved">', '');

// 2. Remove the injected JS loadApprovedSection() 
html = html.replace(/async loadApprovedSection\(\) \{[\s\S]*?\},/s, '');

// 3. Remove the injected else if for showSection
html = html.replace(/\} else if \(id === "approved"\) \{\s*Dashboard\.loadApprovedSection\(\);\s*\}/s, '');

fs.writeFileSync('biller.html', html);
console.log('Fixed biller.html DOM');
