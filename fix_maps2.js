const fs = require('fs');

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // account.html renderTable
    content = content.replace(/if\(tbody\) tbody\.innerHTML = page\.map\(\(inv, i\) => `[\s\S]*?`\)\.join\(""\);/g, 
        `if(tbody) tbody.innerHTML = page.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    // account.html renderQueue
    content = content.replace(/if\(tbody\) tbody\.innerHTML = page\.map\(\(item, i\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `if(tbody) tbody.innerHTML = page.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    // Any other generic matches that missed
    content = content.replace(/tbody\.innerHTML = page\.map\(\(item, i\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `tbody.innerHTML = page.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    content = content.replace(/tbody\.innerHTML = page\.map\(\(inv, i\) => \{[\s\S]*?\}\)\.join\(""\);/g, 
        `tbody.innerHTML = page.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    fs.writeFileSync(file, content);
    console.log('Fixed mapping in ' + file);
});
