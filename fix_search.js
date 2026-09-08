const fs = require('fs');

const files = ['biller.html', 'account.html', 'cfo.html', 'admin.html', 'superadmin.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    
    // Replace i or b variables with String() casting
    html = html.replace(/\((i|b)\["A13\. Invoice Number"\]\s*\|\|""\)\.toLowerCase\(\)/g, 'String($1["A13. Invoice Number"]||"").toLowerCase()');
    html = html.replace(/\((i|b)\["A14\. Vendor Name"\]\s*\|\|""\)\.toLowerCase\(\)/g, 'String($1["A14. Vendor Name"]||"").toLowerCase()');
    html = html.replace(/\((i|b)\["A16\. Bill Description"\]\s*\|\|""\)\.toLowerCase\(\)/g, 'String($1["A16. Bill Description"]||"").toLowerCase()');
    
    fs.writeFileSync(file, html);
    console.log(`Fixed search filter string conversion in ${file}`);
  }
});
