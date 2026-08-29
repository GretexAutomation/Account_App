const fs = require('fs');

const css = `
    /* ── Grid Layout for All Bills ── */
    .bills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      padding: 16px;
      max-height: 800px;
      overflow-y: auto;
    }
    .bills-grid > div:not(.bill-card) {
      grid-column: 1 / -1;
      text-align: center;
      padding: 32px;
    }
    .bill-card {
      background   : var(--white);
      border       : 1px solid var(--gray-200);
      border-radius: var(--border-radius);
      padding      : 14px 18px;
      cursor       : pointer;
      transition   : var(--transition);
      display      : flex;
    }
    .bill-card:hover {
      border-color: var(--primary);
      box-shadow  : 0 2px 12px rgba(26,115,232,0.1);
      transform   : translateX(2px);
    }
    .bill-card.new-bill      { border-left: 4px solid #1a73e8; }
    .bill-card.reviewed-bill { border-left: 4px solid #f9ab00; }
    .bill-card.sent-bill     { border-left: 4px solid #34a853; }
    .bill-card.approved-bill { border-left: 4px solid #34a853; opacity:.85; }
    .bill-card.rejected-bill { border-left: 4px solid #ea4335; opacity:.85; }

    .bills-grid .bill-card {
      margin-bottom: 0;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      height: 100%;
    }
    .bills-grid .bill-card > div:first-child { width: 100%; }
    .bills-grid .bill-card > div:last-child {
      width: 100%;
      text-align: right;
      margin-top: auto;
    }
    .flag-count {
      display: inline-flex; align-items: center; gap: 3px;
      background: #fff0f0; color: var(--danger);
      padding: 2px 8px; border-radius: 20px;
      font-size: 0.7rem; font-weight: 700;
    }
`;

function processFile(file) {
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add CSS
    if (!content.includes('.bills-grid {')) {
        content = content.replace('</style>', css + '\n  </style>');
    }

    // 2. Add UI.js
    if (!content.includes('js/ui.js')) {
        content = content.replace('<script src="js/sidebar.js"></script>', '<script src="js/ui.js"></script>\n  <script src="js/sidebar.js"></script>');
    }

    // 3. Replace tables with Grid containers
    const tableRegex = /<div class="table-responsive">[\s\S]*?<table class="table">[\s\S]*?<tbody id="([^"]+)">[\s\S]*?<\/tbody>[\s\S]*?<\/table>[\s\S]*?<\/div>/g;
    content = content.replace(tableRegex, (match, tbodyId) => {
        return `<div id="${tbodyId}" class="bills-grid">
            <div class="text-center" style="padding:32px;color:var(--gray-400)">
              <i class="fa fa-spinner fa-spin"></i> Loading...
            </div>
          </div>`;
    });

    // 4. Update render logic loops
    content = content.replace(/pagedData\.map\(inv => `[\s\S]*?`\)\.join\(""\);/g, `pagedData.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);
    content = content.replace(/pagedQueue\.map\(inv => `[\s\S]*?`\)\.join\(""\);/g, `pagedQueue.map(inv => UI.buildBillCard(inv, 'Dashboard.openDetail(INDEX)')).join("");`);

    // 5. Empty states inside render logic
    // account.html / cfo.html / admin.html etc check for length === 0 and insert <tr>. We need to insert UI.emptyState.
    content = content.replace(/tbody\.innerHTML = `<tr><td colspan="\d+"[^>]*>.*?<\/td><\/tr>`;/g, `tbody.innerHTML = UI.emptyState("No records found");`);
    // Specifically matching `<div class="empty-state">...` inside a td
    content = content.replace(/tbody\.innerHTML = `<tr><td colspan="\d+"[^>]*>[\s\S]*?<\/div><\/td><\/tr>`;/g, `tbody.innerHTML = UI.emptyState("Queue is empty");`);


    // 6. Fix `openDetail` timeline if it exists
    content = content.replace(/generateTrackingTimeline\s*\(\s*inv\s*\)/g, `UI.generateTrackingTimeline(inv)`);
    // We should also delete the old `generateTrackingTimeline` from the file if it's there
    content = content.replace(/generateTrackingTimeline\s*\(inv\)\s*{[\s\S]*?return html;\s*},/g, '');

    fs.writeFileSync(file, content);
    console.log("Processed " + file);
}

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(processFile);
