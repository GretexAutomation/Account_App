const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// 1. Remove the "Total Users" stat card
html = html.replace(/<div class="stat-card" style="border-left:4px solid var\(--role-admin\); cursor:pointer" onclick="Dashboard.showSection\('users'\)">[\s\S]*?<\/div>\s*<\/div>/, '');

// 2. Remove the "User Mgmt" card
html = html.replace(/<div class="card" style="cursor:pointer" onclick="Dashboard.showSection\('users'\)">[\s\S]*?<\/div>\s*<\/div>/, '');

// 3. Remove the "Audit Log" card
html = html.replace(/<div class="card" style="cursor:pointer" onclick="Dashboard.showSection\('audit'\)">[\s\S]*?<\/div>\s*<\/div>/, '');

// 4. Rename "Approvals" to "Approval Pending By Me" in the remaining card
html = html.replace(
    /<div style="font-weight:600;color:var\(--secondary\)">Approvals<\/div>/,
    '<div style="font-weight:600;color:var(--secondary)">Approval Pending By Me</div>'
);

fs.writeFileSync('admin.html', html);
console.log('Updated admin.html dashboard cards');
