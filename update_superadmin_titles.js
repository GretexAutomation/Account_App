const fs = require('fs');
let html = fs.readFileSync('superadmin.html', 'utf8');

// Rename Approvals card to Approval Pending By Me
html = html.replace(
    /<div style="font-weight:600;font-size:0.82rem;color:var\(--gray-800\)">Approvals<\/div>/,
    '<div style="font-weight:600;font-size:0.82rem;color:var(--gray-800)">Approval Pending By Me</div>'
);

// Rename Queue Title
html = html.replace(/<i class="fa fa-list-check"><\/i> Super Admin Approval Queue/g, '<i class="fa fa-list-check"></i> Approval Pending By Me');
html = html.replace(/approve : "Approval Queue"/g, 'approve : "Approval Pending By Me"');

fs.writeFileSync('superadmin.html', html);
console.log('Updated titles in superadmin.html');
