const fs = require('fs');
let sidebar = fs.readFileSync('js/sidebar.js', 'utf8');

if (!sidebar.includes('id: "approved"')) {
    sidebar = sidebar.replace(
        /\{\s*id:\s*"flowup".*?\}/,
        '$&,\n          { id: "approved",  icon: "fa-check-double",   label: "Approved",      page: "biller.html#approved" }'
    );
    fs.writeFileSync('js/sidebar.js', sidebar);
    console.log('Added approved to Biller in sidebar.js');
} else {
    console.log('Approved already in sidebar');
}
