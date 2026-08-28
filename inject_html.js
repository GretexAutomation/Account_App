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

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    if (!content.includes('id="section-flowup"')) {
        // Find the first modal or scripts
        const regexes = [
            /<!--\s*App Modals\s*-->/,
            /<div class="modal"/,
            /<script src="js\/ui\.js"/
        ];
        
        let injected = false;
        for (let r of regexes) {
            const match = content.match(r);
            if (match) {
                const idx = match.index;
                content = content.substring(0, idx) + '\n' + flowupHTML + '\n' + content.substring(idx);
                injected = true;
                break;
            }
        }
        
        if (injected) {
            fs.writeFileSync(file, content);
            console.log('Injected Flowup HTML in ' + file);
        } else {
            console.log('Could not find injection point in ' + file);
        }
    } else {
        console.log('Already exists in ' + file);
    }
});
