const fs = require('fs');

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;
    
    // 1. Remove Flowup CSS, JS, and HTML
    if (content.includes('id="section-flowup"')) {
        content = content.replace(/<!-- ========================================== -->\s*<!-- FLOWUP MODULE -->\s*<!-- ========================================== -->\s*<div class="section" id="section-flowup"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*/g, '');
        // fallback generic removal
        content = content.replace(/<div class="section" id="section-flowup"[\s\S]*?id="flowupPagination"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, '');
        changed = true;
    }
    if (content.includes('flowupSelectedColumns')) {
        content = content.replace(/flowupSelectedColumns: \[[\s\S]*?changeFlowupPage\(delta\) \{[\s\S]*?\},/g, '');
        changed = true;
    }
    
    // 2. Remove ui.js script
    if (content.includes('<script src="js/ui.js"></script>')) {
        content = content.replace('<script src="js/ui.js"></script>\n', '');
        content = content.replace('<script src="js/ui.js"></script>', '');
        changed = true;
    }

    // 3. Remove .bills-grid CSS if it's there
    // Actually .bills-grid was only in css file or style tag, I didn't inject it except maybe in style. Let's ignore it, it's harmless.

    // 4. Revert UI.buildBillCard
    // Let's replace any UI.buildBillCard with a standard table row.
    
    // We know they have standard columns. Let's use a very standard one that matches them all roughly.
    const standardRow = `\`<tr style="cursor:pointer" onclick="Dashboard.openDetail(\${inv.rowIndex || inv.queueRowIndex})">
        <td style="color:var(--gray-400);font-size:0.75rem">\${idx+1}</td>
        <td style="white-space:nowrap;font-size:0.8rem">\${inv["Timestamp"] || inv["A12. Invoice Date"] || "-"}</td>
        <td><strong style="font-size:0.83rem">\${inv["A13. Invoice Number"] || "-"}</strong></td>
        <td style="font-size:0.82rem">\${inv["A14. Vendor Name"] ? inv["A14. Vendor Name"].substring(0,20) : ""}</td>
        <td style="font-size:0.83rem">\${inv["A20. Basic Amount"] || ""}</td>
        <td>\${inv["B8. TDS Amount"] || "N/A"}</td>
        <td><strong style="font-size:0.83rem">\${inv["D1. Final Payable Amt"] || ""}</strong></td>
        <td>\${inv["Approval Status"] || inv["Current_Stage"] || "Pending"}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Dashboard.openDetail(\${inv.rowIndex || inv.queueRowIndex})"><i class="fa fa-eye"></i></button></td>
    </tr>\``;

    // For queue which has pagedQueue.map((inv, idx) => ...) or data.map((inv, idx) => ...)
    content = content.replace(/page\.map\(inv => UI\.buildBillCard\(inv, 'Dashboard\.openDetail\(INDEX\)'\)\)/g, 
        `page.map((inv, idx) => ${standardRow})`);
        
    content = content.replace(/pagedQueue\.map\(inv => UI\.buildBillCard\(inv, 'Dashboard\.openDetail\(INDEX\)'\)\)/g, 
        `pagedQueue.map((inv, idx) => ${standardRow})`);

    content = content.replace(/pagedData\.map\(inv => UI\.buildBillCard\(inv, 'Dashboard\.openDetail\(INDEX\)'\)\)/g, 
        `pagedData.map((inv, idx) => ${standardRow})`);

    content = content.replace(/data\.map\(inv => UI\.buildBillCard\(inv, 'Dashboard\.openDetail\(INDEX\)'\)\)/g, 
        `data.map((inv, idx) => ${standardRow})`);

    fs.writeFileSync(file, content);
    console.log('Restored ' + file);
});
