const fs = require('fs');
let text = fs.readFileSync('js/sidebar.js', 'utf8');

const adminStart = text.indexOf('Admin: [');
const superAdminStart = text.indexOf('SuperAdmin: [');

let adminSection = text.substring(adminStart, superAdminStart);

// Remove Management block
adminSection = adminSection.replace(/\{\s*section:\s*"Management",\s*items:\s*\[\s*\{\s*id:\s*"users".*?\},?\s*\{\s*id:\s*"audit".*?\}?\s*\]\s*\},/s, '');

// Add approve to Main block
adminSection = adminSection.replace(
    /\{\s*id:\s*"redflags".*?\}/,
    '{ id: "approve",  icon: "fa-list-check",    label: "Approval Pending By Me", page: "admin.html#approve", badge: "approval" },\n          $&'
);

text = text.substring(0, adminStart) + adminSection + text.substring(superAdminStart);
fs.writeFileSync('js/sidebar.js', text);
console.log('Updated Admin sidebar');
