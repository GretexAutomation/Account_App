import os
import re

file_path = "d:/1. Apps/0.1 Update/B. Account_App-main/03. Account_App-V3/superadmin.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add section-master after section-invoices closes
section_master_html = """
      <div class="section" id="section-master">
        <div class="card" style="margin-bottom:16px">
          <div class="card-body" style="padding:14px 20px">
            <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
              <div class="filter-tabs">
                <button class="master-tab active" data-mstatus="ALL">All</button>
                <button class="master-tab" data-mstatus="Pending">⏳ Pending</button>
                <button class="master-tab" data-mstatus="Approved">✅ Approved</button>
                <button class="master-tab" data-mstatus="Reject">❌ Reject</button>
              </div>
              <div style="flex:1;min-width:200px;position:relative">
                <i class="fa fa-search" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--gray-400)"></i>
                <input type="text" class="form-control" id="masterSearchInput" placeholder="Search vendor, invoice no..." style="padding-left:36px"/>
              </div>
              <button class="btn btn-outline btn-sm" onclick="Dashboard.loadDashboardData()"><i class="fa fa-rotate-right"></i> Refresh</button>
            </div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><div class="card-title"><i class="fa fa-database"></i> Master Invoices <span id="masterInvoicesCount"></span></div></div>
          <div class="table-wrapper">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:50px">#</th>
                  <th>INVOICE NO</th>
                  <th>VENDOR</th>
                  <th>DATE</th>
                  <th>BASIC AMT</th>
                  <th>FINAL PAYABLE</th>
                  <th>FLAGS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody id="masterInvoicesBody">
                <tr><td colspan="8" class="text-center" style="padding:32px;color:var(--gray-400)">Loading...</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
"""

# Find where section-invoices ends (right before section-approve)
content = content.replace('      <div class="section" id="section-approve">', section_master_html + '\n      <div class="section" id="section-approve">')


# 2. Update init() with event listeners
init_listeners = """    document.getElementById("masterSearchInput")?.addEventListener("input", Utils.debounce(() => Dashboard.filterMasterInvoices(), 350));
    document.querySelectorAll(".master-tab[data-mstatus]").forEach(btn => {
      btn.addEventListener("click", function() {
        document.querySelectorAll(".master-tab[data-mstatus]").forEach(b => b.classList.remove("active"));
        this.classList.add("active"); Dashboard.filterMasterInvoices();
      });
    });"""

content = content.replace('document.querySelectorAll(".filter-tab[data-status]").forEach(btn => {', init_listeners + '\n    document.querySelectorAll(".filter-tab[data-status]").forEach(btn => {')


# 3. Update showSection(id) titles
old_titles = 'const titles = { dashboard: "Super Admin Dashboard", invoices : "All Invoices"'
new_titles = 'const titles = { dashboard: "Super Admin Dashboard", master: "Master Invoices", invoices : "All Invoices"'
content = content.replace(old_titles, new_titles)


# 4. Update loadDashboardData to also call filterMasterInvoices()
old_load = 'Dashboard.allInvoicesData = res.data.invoices || [];\n          Dashboard.filterAllInvoices();'
new_load = 'Dashboard.allInvoicesData = res.data.invoices || [];\n          Dashboard.filterAllInvoices();\n          Dashboard.filterMasterInvoices();'
content = content.replace(old_load, new_load)


# 5. Add filterMasterInvoices() function
filter_master_js = """
  filterMasterInvoices() {
    const status = document.querySelector(".master-tab.active")?.dataset.mstatus || "ALL";
    const search = (document.getElementById("masterSearchInput")?.value || "").toLowerCase();
    let filtered = [...(Dashboard.allInvoicesData || [])];
    if (status !== "ALL") {
      filtered = filtered.filter(i => {
        const accStatus   = (i["Account_Status"] || "").toString();
        const cfoStatus   = (i["CFO_Status"] || "").toString();
        const adminStatus = (i["Admin_Status"] || "").toString();
        const saStatus    = (i["SA_Status"] || "").toString();
        const isRejectedAnywhere = [accStatus, cfoStatus, adminStatus, saStatus].some(s => s === "Rejected");
        
        if (status === "Reject") return isRejectedAnywhere;
        if (status === "Approved") return saStatus === "Approved";
        if (status === "Pending") return !isRejectedAnywhere && saStatus !== "Approved";
        return true;
      });
    }
    if (search) filtered = filtered.filter(i => (i["A13. Invoice Number"]||"").toLowerCase().includes(search) || (i["A14. Vendor Name"]||"").toLowerCase().includes(search));
    
    const tbody = document.getElementById("masterInvoicesBody");
    const count = document.getElementById("masterInvoicesCount");
    if(!tbody) return;
    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center" style="padding:32px;color:var(--gray-400)">No invoices found</td></tr>`; count.textContent = "(0)"; return;
    }
    count.textContent = `(${filtered.length})`;
    tbody.innerHTML = filtered.map((inv, idx) => {
        // Compute custom status badge for Master view
        const accStatus   = (inv["Account_Status"] || "").toString();
        const cfoStatus   = (inv["CFO_Status"] || "").toString();
        const adminStatus = (inv["Admin_Status"] || "").toString();
        const saStatus    = (inv["SA_Status"] || "").toString();
        const isRejectedAnywhere = [accStatus, cfoStatus, adminStatus, saStatus].some(s => s === "Rejected");
        let badgeHtml = '';
        if (isRejectedAnywhere) badgeHtml = '<span class="status-badge status-rejected">Rejected</span>';
        else if (saStatus === "Approved") badgeHtml = '<span class="status-badge status-approved">Approved</span>';
        else badgeHtml = '<span class="status-badge status-pending">Pending</span>';

        return `
      <tr onclick="Dashboard.openDetail(${inv.rowIndex})" style="cursor:pointer;transition:all 0.2s ease" onmouseover="this.style.background='var(--gray-50)'" onmouseout="this.style.background=''">
        <td style="color:var(--gray-500);font-size:0.85rem">${idx + 1}</td>
        <td style="font-weight:600;color:var(--primary)">${inv["A13. Invoice Number"] || "-"}</td>
        <td>${Utils.truncate(inv["A14. Vendor Name"], 25)}</td>
        <td style="font-size:0.85rem;color:var(--gray-600)">${inv["Timestamp"] || inv["A12. Invoice Date"] || "-"}</td>
        <td>${Utils.formatCurrency(inv["A20. Basic Amount"])}</td>
        <td style="font-weight:600">${Utils.formatCurrency(inv["D1. Final Payable Amt"])}</td>
        <td>${inv["?? Red Flags"] ? '🚩' : '-'}</td>
        <td>${badgeHtml}</td>
      </tr>
      `}).join("");
  },
"""

content = content.replace('  filterAllInvoices() {', filter_master_js + '\n  filterAllInvoices() {')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("SuperAdmin Master menu added")
