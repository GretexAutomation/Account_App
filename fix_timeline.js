const fs = require('fs');

const files = ['biller.html', 'account.html', 'cfo.html', 'admin.html', 'superadmin.html'];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let html = fs.readFileSync(file, 'utf8');
    
    // Replace the condition in generateTrackingTimeline
    html = html.replace(
      /if \(step\.date && step\.date !== ""\) \{/g,
      'if ((step.date && step.date !== "") || (step.statusCol && step.statusCol.includes("Approved")) || (step.statusCol && step.statusCol.includes("Rejected"))) {\n        if (!step.date || step.date === "") dateText = "Done";'
    );
    
    fs.writeFileSync(file, html);
    console.log(`Updated timeline logic in ${file}`);
  }
});
