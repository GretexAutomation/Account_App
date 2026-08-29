const fs = require('fs');
let text = fs.readFileSync('js/sidebar.js', 'utf8');

// Add approve to Main block in SuperAdmin
text = text.replace(
    /SuperAdmin:\s*\[\s*\{\s*section:\s*"Main",\s*items:\s*\[\s*\{\s*id:\s*"dashboard".*?\},\s*\{\s*id:\s*"invoices".*?\},/s,
    '$&\n          { id: "approve",   icon: "fa-list-check",    label: "Approval Pending By Me",  page: "superadmin.html#approve", badge: "approval" },'
);

fs.writeFileSync('js/sidebar.js', text);
console.log('Updated SuperAdmin sidebar');
