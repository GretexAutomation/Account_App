const fs = require('fs');
let html = fs.readFileSync('admin.html', 'utf8');

html = html.replace(/<i class="fa fa-list-check"><\/i> Admin Approval Queue/g, '<i class="fa fa-list-check"><\/i> Approval Pending By Me');
// Also update the titles array in JS
html = html.replace(/approve : "Approval Queue"/g, 'approve : "Approval Pending By Me"');

fs.writeFileSync('admin.html', html);
console.log('Updated title in admin.html');
