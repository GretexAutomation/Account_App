const fs = require('fs');
let html = fs.readFileSync('biller.html', 'utf8');

const startIndex = html.indexOf('<div class="section" id="section-completed">');
const endIndex = html.indexOf('<div class="section" id="section-track">');

let completedHtml = html.substring(startIndex, endIndex);

let approvedHtml = `
      <div class="section" id="section-approved">
        <div class="card">
          <div class="card-header">
            <div class="card-title">
              <i class="fa fa-check-double"></i>
              Approved Bills
              <span id="approvedCount"
                style="font-weight:400;color:var(--gray-500);
                font-size:0.8rem"></span>
            </div>
          </div>
          <div id="approvedList" style="padding:16px">
            <div class="text-center"
              style="padding:32px;color:var(--gray-400)">
              <i class="fa fa-spinner fa-spin"></i> Loading...
            </div>
          </div>
        </div>
      </div>
`;

// Insert it right before section-track
html = html.replace('<div class="section" id="section-track">', approvedHtml + '\n      <div class="section" id="section-track">');

// Add to showSection
html = html.replace(/\} else if \(id === "completed"\) \{/g, '} else if (id === "approved") {\n        Dashboard.loadApprovedSection();\n    } else if (id === "completed") {');

// Add loadApprovedSection to Dashboard
const loadApprovedScript = `
  async loadApprovedSection() {
    await Dashboard.ensureQueue();
    const bills = Dashboard.queue.filter(b => (b["Approval Status"]||"") === "Approved");
    const count = document.getElementById("approvedCount");
    if (count) count.textContent = \`(\${bills.length} bills)\`;
    
    const el = document.getElementById("approvedList");
    if (!el) return;
    
    if (bills.length === 0) {
      el.innerHTML = \`<div class="empty-state" style="padding:32px">
        <div class="empty-icon">✅</div>
        <div class="empty-title">No approved bills</div>
      </div>\`;
      return;
    }
    el.innerHTML = bills.map(b => Dashboard.buildBillCard(b, false)).join("");
  },
`;
html = html.replace(/async loadCompletedSection\(\) \{/, loadApprovedScript + '\n  async loadCompletedSection() {');

fs.writeFileSync('biller.html', html);
console.log('Added section-approved properly');
