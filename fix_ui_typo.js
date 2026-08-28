const fs = require('fs');

['account.html', 'cfo.html', 'admin.html', 'superadmin.html'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Find and remove the floating `UI.`
    // Actually the floating `UI.` was caused by:
    // `generateTrackingTimeline(inv)` being replaced by `UI.generateTrackingTimeline(inv)`
    // And then the subsequent regex `UI.generateTrackingTimeline(inv) { ... }` deleting `generateTrackingTimeline(inv) { ... }` 
    // leaving just `UI.`

    content = content.replace(/UI\.\s*\n\s*async init\(\)/g, '\n  async init()');
    content = content.replace(/UI\.\s*async init\(\)/g, 'async init()');
    
    // Sometimes it's followed by init() without async
    content = content.replace(/UI\.\s*\n\s*init\(\)/g, '\n  init()');
    content = content.replace(/UI\.\s*init\(\)/g, 'init()');

    fs.writeFileSync(file, content);
    console.log('Fixed UI. in ' + file);
});
