const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

// The block for 'users' stat card:
html = html.replace(/<div class="stat-card"[^>]*onclick="Dashboard\.showSection\('users'\)"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// The block for 'users' dashboard card:
html = html.replace(/<div class="card"[^>]*onclick="Dashboard\.showSection\('users'\)"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// The block for 'audit' dashboard card:
html = html.replace(/<div class="card"[^>]*onclick="Dashboard\.showSection\('audit'\)"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');

// Re-apply Read View:
html = html.replace(/<i class="fa fa-eye"><\/i> View/g, '<i class="fa fa-eye"></i> Read View');
html = html.replace(/>View<\/button>/g, '>Read View</button>');

// Rename Approvals -> Approval Pending By Me
html = html.replace(/<div style="font-weight:600;color:var\(--secondary\)">Approvals<\/div>/, '<div style="font-weight:600;color:var(--secondary)">Approval Pending By Me</div>');
html = html.replace(/<i class="fa fa-list-check"><\/i> Admin Approval Queue/g, '<i class="fa fa-list-check"></i> Approval Pending By Me');
html = html.replace(/approve : "Approval Queue"/g, 'approve : "Approval Pending By Me"');

fs.writeFileSync('admin.html', html);
console.log('Fixed admin.html');
