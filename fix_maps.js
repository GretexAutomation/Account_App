const fs = require('fs');

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Admin/SuperAdmin queue
    content = content.replace(/tbody\.innerHTML = data\.map\(\(item, i\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `tbody.innerHTML = data.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    // CFO/Account queue mapped with { }
    content = content.replace(/tbody\.innerHTML = pagedQueue\.map\(\(inv, idx\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `tbody.innerHTML = pagedQueue.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);
    
    // CFO/Account queue mapped with ` `
    content = content.replace(/tbody\.innerHTML = pagedQueue\.map\(inv => `[\s\S]*?`\)\.join\(""\);/g, 
        `tbody.innerHTML = pagedQueue.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    // CFO/Account invoices mapped with { }
    content = content.replace(/tbody\.innerHTML = pagedData\.map\(\(inv, idx\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `tbody.innerHTML = pagedData.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    // CFO/Account invoices mapped with ` `
    content = content.replace(/tbody\.innerHTML = pagedData\.map\(inv => `[\s\S]*?`\)\.join\(""\);/g, 
        `tbody.innerHTML = pagedData.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);
        
    // In superadmin.html and admin.html All Invoices:
    content = content.replace(/tbody\.innerHTML = data\.map\(\(inv, idx\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `tbody.innerHTML = data.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);
        
    content = content.replace(/tbody\.innerHTML = data\.map\(inv => `[\s\S]*?`\)\.join\(""\);/g, 
        `tbody.innerHTML = data.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    fs.writeFileSync(file, content);
    console.log('Fixed mapping in ' + file);
});
