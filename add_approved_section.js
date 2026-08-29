const fs = require('fs');
let html = fs.readFileSync('biller.html', 'utf8');

// 1. Find section-completed
const match = html.match(/<div class="section" id="section-completed">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);
if (match) {
    let completedHtml = match[0];
    
    // Create section-approved
    let approvedHtml = completedHtml.replace('id="section-completed"', 'id="section-approved"');
    
    // Remove the grid with Approved/Rejected stats completely
    approvedHtml = approvedHtml.replace(/<div style="display:grid;grid-template-columns:1fr 1fr;[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, '');
    
    // Remove the filter tabs
    approvedHtml = approvedHtml.replace(/<div class="card" style="margin-bottom:16px">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, '');
    
    // Update IDs and Titles
    approvedHtml = approvedHtml.replace(/Completed Bills/g, 'Approved Bills');
    approvedHtml = approvedHtml.replace(/completedCount/g, 'approvedCount');
    approvedHtml = approvedHtml.replace(/completedList/g, 'approvedList');
    
    // Insert section-approved right after section-completed
    html = html.replace(completedHtml, completedHtml + '\n\n' + approvedHtml);
    
    // Add logic to showSection
    html = html.replace(/} else if \(id === "completed"\) {/g, '} else if (id === "approved") {\n        Dashboard.loadApprovedSection();\n    } else if (id === "completed") {');
    
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
    
    // Wait, the Read View text also needs preserving if it gets lost, but we're just copying.
    
    fs.writeFileSync('biller.html', html);
    console.log('Added section-approved successfully.');
} else {
    console.log('Could not find section-completed');
}
