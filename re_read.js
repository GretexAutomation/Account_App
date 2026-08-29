const fs = require('fs');
['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let text = fs.readFileSync(file, 'utf8');
    text = text.replace(/<i class="fa fa-eye"><\/i> View/g, '<i class="fa fa-eye"></i> Read View');
    text = text.replace(/>View<\/button>/g, '>Read View</button>');
    fs.writeFileSync(file, text);
});
console.log('Restored Read View');
