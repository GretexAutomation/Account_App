const fs = require('fs');

const flowupHTML = `
      <!-- ========================================== -->
      <!-- FLOWUP MODULE -->
      <!-- ========================================== -->
      <div class="section" id="section-flowup" style="width: 100%; overflow: hidden;">
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="card-title"><i class="fa fa-list"></i> Flowup (Invoice Journey)</div>
          </div>
          
          <!-- Filters -->
          <div id="stageFilterSelector" style="padding:12px 16px; border-bottom:1px solid var(--gray-200); background:#fafafa; display:flex; gap:16px; align-items:center; flex-wrap:wrap;">
              <strong style="font-size:0.85rem; color:var(--gray-700);">Filter:</strong>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('All', this)" checked> All</label>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('New', this)"> New</label>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('Account', this)"> Account</label>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('CFO', this)"> CFO</label>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('Admin', this)"> Admin</label>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('Super Admin', this)"> Super Admin</label>
              <label style="font-size:0.8rem; cursor:pointer;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('Approved', this)"> Approved</label>
              <label style="font-size:0.8rem; cursor:pointer; color:var(--danger); font-weight:bold;"><input type="checkbox" onchange="Dashboard.toggleFlowupFilter('Rejected', this)"> Rejected</label>
          </div>

          <div class="table-responsive" style="max-height: 65vh; overflow-y: auto;">
            <table class="table" style="min-width: 1800px; white-space: nowrap;">
              <thead id="flowupHeader">
                <!-- Injected via JS -->
              </thead>
              <tbody id="flowupBody">
                <tr><td colspan="20" class="text-center" style="padding:40px"><i class="fa fa-spinner fa-spin"></i> Loading...</td></tr>
              </tbody>
            </table>
          </div>
          
          <!-- Pagination -->
          <div id="flowupPagination" style="padding: 12px 16px; border-top: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; color: var(--gray-600); background: #fafafa;">
          </div>
        </div>
      </div>
`;

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
            document.querySelector("#stageFilterSelector input").checked = false;
        } else {
            Dashboard.flowupActiveFilters = Dashboard.flowupActiveFilters.filter(s => s !== stage);
        }
    }
    Dashboard.flowupCurrentPage = 1;
    Dashboard.renderFlowupTable();
  },

  async loadFlowupSection() {
    const tbody = document.getElementById("flowupBody");
    if(!tbody) return;
    tbody.innerHTML = '<tr><td colspan="30" class="text-center"><i class="fa fa-spinner fa-spin"></i> Loading...</td></tr>';
    
    // In account.html getInvoices usually works, but getQueue gets the full sheet if it's the right endpoint. 
    // We will just use whatever full queue endpoint is appropriate or rely on Dashboard.queue.
    // Actually, getInvoices returns the full sheet for these roles.
    const res = (API.account && API.account.getInvoices) ? await API.account.getInvoices() :
                (API.cfo && API.cfo.getInvoices) ? await API.cfo.getInvoices() :
                (API.admin && API.admin.getInvoices) ? await API.admin.getInvoices() :
                {success: true, data: {invoices: Dashboard.queue || Dashboard.queueData || Dashboard.invoices || []}};
    
    if (res?.success) {
      let q = res.data.invoices || res.data.queue || [];
      q.reverse(); // Newest first

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
      
      const head = document.getElementById("flowupHeader");
      if(head) {
        let hHtml = "<tr>";
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
        hHtml += "</tr>";
        head.innerHTML = hHtml;
      }
      Dashboard.renderFlowupTable();
    }
  },

  renderFlowupTable() {
    const tbody = document.getElementById("flowupBody");
    const pagEl = document.getElementById("flowupPagination");
    if(!tbody) return;

    let queue = Dashboard.flowupQueue || [];
    
    // Apply Filters
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
        if (col === "Approval Status") {
            val = UI.buildStatusBadge(val);
        } else if (col === "Current_Stage") {
            val = UI.buildStatusBadge(val);
        }
        html += \`<td>\${val}</td>\`;
      });
      html += "</tr>";
    });

    tbody.innerHTML = html;

    // Pagination
    if (pagEl) {
        pagEl.style.display = 'flex';
        pagEl.innerHTML = \`
            <div>Showing \${start + 1} to \${Math.min(end, totalItems)} of \${totalItems} entries</div>
            <div style="display: flex; gap: 8px;">
                <button class="btn btn-outline btn-sm" \${page <= 1 ? 'disabled style="opacity:0.5"' : ''} onclick="Dashboard.changeFlowupPage(-1)">Previous</button>
                <button class="btn btn-outline btn-sm" \${page >= totalPages ? 'disabled style="opacity:0.5"' : ''} onclick="Dashboard.changeFlowupPage(1)">Next</button>
            </div>
        \`;
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

function injectFlowup(file) {
    let content = fs.readFileSync(file, 'utf8');

    if (content.includes('id="section-flowup"')) {
        console.log("Already has flowup: " + file);
        return;
    }

    // Insert HTML before </main>
    content = content.replace('</main>', flowupHTML + '\n      </main>');

    // Insert JS at the bottom of Dashboard object (before users: [])
    // We can inject it right after `queue: [],` or anywhere in Dashboard.
    content = content.replace('queueData     : [],', 'queueData     : [],\n' + flowupJS);
    content = content.replace('invoices      : [],', 'invoices      : [],\n' + flowupJS);

    // Also need to call `Dashboard.loadFlowupSection()` when user switches tab
    // The tabs are usually managed by `Dashboard.showSection(id)`
    // Let's modify `showSection` to call loadFlowupSection
    // actually sidebar.js already calls `Dashboard.loadFlowupSection()` if it exists! (Wait, sidebar.js does NOT call loadFlowupSection, it just changes active section)
    // Wait, in biller.html, loadFlowupSection is called in init() or showSection()?
    // Let's just hook it to showSection in JS.
    content = content.replace(/showSection\(id\)\s*{/, `showSection(id) {\n    if(id === 'flowup') { Dashboard.loadFlowupSection(); }\n`);

    fs.writeFileSync(file, content);
    console.log("Injected flowup to " + file);
}

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(injectFlowup);
