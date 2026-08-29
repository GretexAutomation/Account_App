const fs = require('fs');

['admin.html', 'superadmin.html'].forEach(file => {
    let html = fs.readFileSync(file, 'utf8');
    
    html = html.replace(/\(item\["A13\. Invoice Number"\]\|\|""\)\.replace/g, 'String(item["A13. Invoice Number"]||"").replace');
    
    fs.writeFileSync(file, html);
    console.log(`Fixed replace bug in ${file}`);
});
