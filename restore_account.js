const fs = require('fs');

let acc = fs.readFileSync('account.html', 'utf8');

acc = acc.replace(/if\(tbody\)\s*tbody\.innerHTML = page\.map\(inv => UI\.buildBillCard\(inv, 'Dashboard\.openDetail\\(INDEX\\)'\)\)\.join\(""\);/g, 
`if(tbody) tbody.innerHTML = page.map((inv, i) => \`
      <tr style="cursor:pointer" onclick="Dashboard.openDetail(\${inv.rowIndex})">
        <td style="color:var(--gray-400);font-size:0.75rem">\${start + i + 1}</td>
        <td style="white-space:nowrap;font-size:0.8rem">\${inv["Timestamp"] || inv["A12. Invoice Date"] || "-"}</td>
        <td><strong style="font-size:0.83rem">\${inv["A13. Invoice Number"] || "-"}</strong></td>
        <td style="font-size:0.82rem">\${Utils.truncate(inv["A14. Vendor Name"], 18)}</td>
        <td style="color:var(--gray-500);font-size:0.78rem">\${Utils.truncate(inv["A16. Bill Description"], 22)}</td>
        <td style="font-size:0.83rem">\${Utils.formatCurrency(inv["A20. Basic Amount"])}</td>
        <td>\${inv["B1. TDS Applicable"] === "Yes" ? \\\`<span style="color:var(--warning);font-weight:600;font-size:0.82rem">\${Utils.formatCurrency(inv["B8. TDS Amount"])}</span>\\\` : \\\`<span style="color:var(--gray-300);font-size:0.8rem">N/A</span>\\\`}</td>
        <td><strong style="font-size:0.83rem">\${Utils.formatCurrency(inv["D1. Final Payable Amt"])}</strong></td>
        <td><span class="badge \${inv["A21. Invoice Type"] === 'Proforma' ? 'badge-warning' : 'badge-info'}" style="font-size:0.68rem">\${inv["A21. Invoice Type"] || "-"}</span></td>
        <td>\${inv["🚩 Red Flags"] && inv["🚩 Red Flags"] !== "" ? \\\`<span style="color:var(--danger);font-size:0.78rem;font-weight:600;cursor:pointer" title="\${inv["🚩 Red Flags"]}">🚩 \${inv["🚩 Red Flags"].split("|").length}</span>\\\` : \\\`<span style="color:var(--gray-200)">-</span>\\\`}</td>
        <td>\${Utils.statusBadge(inv["Current_Stage"])}</td>
        <td><button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); Dashboard.openDetail(\${inv.rowIndex})" title="View Details"><i class="fa fa-eye"></i></button></td>
      </tr>
    \`).join("");`);

fs.writeFileSync('account.html', acc);
console.log('Restored account.html renderTable');
