const fs = require('fs');

const flowupJS = `
  flowupSelectedColumns: [
    "Timestamp",
    "A13. Invoice Number",
    "A14. Vendor Name",
    "A1. Billed To",
    "B8. TDS Amount",
    "D1. Final Payable Amt",
    "Current_Stage",
    "Approval Status",
    "Rejection By",
    "Rejection Remark",
    "Biller_Name", "Biller_Send_At",
    "Account_Name", "Account_Status", "Account_Send_At",
    "CFO_Name", "CFO_Status", "CFO_Send_At",
    "Admin_Name", "Admin_Status", "Admin_Send_At",
    "SA_Name", "SA_Status", "SA_Approved_At"
  ],
  flowupRowsPerPage: 30,
  flowupCurrentPage: 1,
  flowupActiveFilters: ["All"],

  toggleFlowupFilter(stage, checkbox) {
    if (stage === 'All') {
        Dashboard.flowupActiveFilters = checkbox.checked ? ["All"] : [];
        document.querySelectorAll('#stageFilterSelector input').forEach(cb => {
            if(cb !== checkbox) cb.checked = false;
        });
    } else {
        if (checkbox.checked) {
            Dashboard.flowupActiveFilters.push(stage);
            Dashboard.flowupActiveFilters = Dashboard.flowupActiveFilters.filter(s => s !== "All");
            document.querySelector('#stageFilterSelector input').checked = false;
        } else {
            Dashboard.flowupActiveFilters = Dashboard.flowupActiveFilters.filter(s => s !== stage);
        }
    }
    Dashboard.flowupCurrentPage = 1;
    Dashboard.renderFlowupTable();
  },

  async loadFlowupSection() {
    const tbody = document.getElementById('flowupBody');
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="30" class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    // In account.html getInvoices returns the full sheet. We use that.
    const res = (API.account && API.account.getInvoices) ? await API.account.getInvoices() :
                (API.cfo && API.cfo.getInvoices) ? await API.cfo.getInvoices() :
                (API.admin && API.admin.getInvoices) ? await API.admin.getInvoices() :
                {success: true, data: {invoices: Dashboard.queue || Dashboard.queueData || Dashboard.invoices || []}};
    
    if (res?.success) {
      let q = res.data.invoices || res.data.queue || [];
      // q.reverse(); // Now done globally in api.js

      q = q.map(b => {
          let rBy = "", rRem = "";
          if ((b["Account_Status"] || "").includes("Rejected")) { rBy = "Account"; rRem = b["Account_Remark"]; }
          else if ((b["CFO_Status"] || "").includes("Rejected")) { rBy = "CFO"; rRem = b["CFO_Remark"]; }
          else if ((b["Admin_Status"] || "").includes("Rejected")) { rBy = "Admin"; rRem = b["Admin_Remark"]; }
          else if ((b["SA_Status"] || "").includes("Rejected")) { rBy = "Super Admin"; rRem = b["SA_Remark"]; }
          b["Rejection By"] = rBy;
          b["Rejection Remark"] = rRem;
          return b;
      });

      Dashboard.flowupQueue = q;
      
      const head = document.getElementById('flowupHeader');
      if(head) {
        let hHtml = '<tr>';
        Dashboard.flowupSelectedColumns.forEach(col => {
           let bg = "#f8f9fa", color = "#475569";
           if (col.includes("Biller")) { bg = "#e3f2fd"; color = "#1e88e5"; }
           else if (col.includes("Account")) { bg = "#f3e5f5"; color = "#8e24aa"; }
           else if (col.includes("CFO")) { bg = "#fff3e0"; color = "#f4511e"; }
           else if (col.includes("Admin")) { bg = "#e8f5e9"; color = "#43a047"; }
           else if (col.includes("SA_")) { bg = "#ffebee"; color = "#e53935"; }
           else if (col.includes("Rejection")) { bg = "#ffcdd2"; color = "#c62828"; }
           hHtml += \`<th style="background:\${bg}; color:\${color}; position:sticky; top:0; z-index:10; border-bottom:2px solid #cbd5e1;">\${col}</th>\`;
        });
        hHtml += '</tr>';
        head.innerHTML = hHtml;
      }
      Dashboard.renderFlowupTable();
    }
  },

  renderFlowupTable() {
    const tbody = document.getElementById('flowupBody');
    const pagEl = document.getElementById('flowupPagination');
    if(!tbody) return;

    let queue = Dashboard.flowupQueue || [];
    
    if (!Dashboard.flowupActiveFilters.includes("All")) {
        queue = queue.filter(b => {
            const current = b["Current_Stage"] || "";
            const status = b["Approval Status"] || "";
            const isRejected = status === "Rejected" ||
                (b["Account_Status"]||"").includes("Rejected") ||
                (b["CFO_Status"]||"").includes("Rejected") ||
                (b["Admin_Status"]||"").includes("Rejected") ||
                (b["SA_Status"]||"").includes("Rejected");
                
            let matches = false;
            Dashboard.flowupActiveFilters.forEach(f => {
                if (f === "Rejected" && isRejected) matches = true;
                if (f === "Approved" && status === "Approved") matches = true;
                if (!isRejected && current.includes(f)) matches = true;
                if (f === "Super Admin" && current === "SA") matches = true;
            });
            return matches;
        });
    }

    Dashboard.flowupFilteredQueue = queue;
    const limit = Dashboard.flowupRowsPerPage;
    const totalItems = queue.length;
    const totalPages = Math.ceil(totalItems / limit);
    
    if (Dashboard.flowupCurrentPage > totalPages) Dashboard.flowupCurrentPage = totalPages || 1;
    const page = Dashboard.flowupCurrentPage;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paged = queue.slice(start, end);

    if (paged.length === 0) {
      tbody.innerHTML = \`<tr><td colspan="\${Dashboard.flowupSelectedColumns.length}" class="text-center" style="padding:40px; color:var(--gray-500);">No matching records found.</td></tr>\`;
      if(pagEl) pagEl.style.display = 'none';
      return;
    }

    let html = "";
    paged.forEach((inv, index) => {
      let isRejectedRow = Dashboard.flowupActiveFilters.includes("Rejected") || (inv["Approval Status"] === "Rejected") ||
                          (inv["Account_Status"]||"").includes("Rejected") ||
                          (inv["CFO_Status"]||"").includes("Rejected") ||
                          (inv["Admin_Status"]||"").includes("Rejected") ||
                          (inv["SA_Status"]||"").includes("Rejected");
      
      html += \`<tr style="\${isRejectedRow ? 'background-color:#fff0f0;' : ''}">\`;
      Dashboard.flowupSelectedColumns.forEach(col => {
        let val = inv[col] !== undefined ? inv[col] : "—";
        if (col === "Approval Status" || col === "Current_Stage") {
            val = UI.buildStatusBadge(val);
        }
        html += \`<td>\${val}</td>\`;
      });
      html += "</tr>";
    });

    tbody.innerHTML = html;

    if (pagEl) {
        pagEl.style.display = 'flex';
        pagEl.innerHTML = \`
            <div>Showing \${start + 1} to \${Math.min(end, totalItems)} of \${totalItems} entries</div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-outline btn-sm" \${page <= 1 ? 'disabled style="opacity:0.5"' : ''} onclick="Dashboard.changeFlowupPage(-1)">Previous</button>
                <button class="btn btn-outline btn-sm" \${page >= totalPages ? 'disabled style="opacity:0.5"' : ''} onclick="Dashboard.changeFlowupPage(1)">Next</button>
            </div>\`;
    }
  },

  changeFlowupPage(delta) {
    const totalPages = Math.ceil((Dashboard.flowupFilteredQueue?.length || 0) / Dashboard.flowupRowsPerPage);
    let newPage = Dashboard.flowupCurrentPage + delta;
    if (newPage >= 1 && newPage <= totalPages) {
        Dashboard.flowupCurrentPage = newPage;
        Dashboard.renderFlowupTable();
    }
  },
`;

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('flowupSelectedColumns')) {
        content = content.replace('const Dashboard = {', 'const Dashboard = {\n' + flowupJS);
        fs.writeFileSync(file, content);
        console.log('Injected JS into ' + file);
    } else {
        console.log('JS already present in ' + file);
    }
});
