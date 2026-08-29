const fs = require('fs');
let sidebar = fs.readFileSync('js/sidebar.js', 'utf8');

// Add to Biller
sidebar = sidebar.replace(
    /{ id: "myinvoices",icon: "fa-file-invoice", label: "My Invoices",     page: "biller.html#invoices" }/,
    '{ id: "myinvoices",icon: "fa-file-invoice", label: "My Invoices",     page: "biller.html#invoices" },\n          { id: "flowup",    icon: "fa-list",           label: "Flowup",        page: "biller.html#flowup" }'
);
fs.writeFileSync('js/sidebar.js', sidebar);
console.log('Added flowup back to Biller in sidebar.js');
