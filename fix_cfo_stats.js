const fs = require('fs');
let html = fs.readFileSync('cfo.html', 'utf8');

// We will inject the local stats calculation right after Dashboard.allInvoicesData is populated.
const injection = `
        const all = Dashboard.allInvoicesData;
        let bTot = all.length, bPend = 0, bApp = 0, bRej = 0;
        let aTot = 0, aPend = 0, aApp = 0, aRej = 0;
        
        all.forEach(inv => {
           // Biller Queue Stats
           const bs = inv["Approval Status"] || "";
           if (bs === "Approved") bApp++;
           else if (bs === "Rejected" || bs === "Reject") bRej++;
           else bPend++;
           
           // Account Queue Stats
           const as = inv["Account_Status"] || "";
           // Only count invoices that actually reached account or have account status
           if (as) aTot++;
           if (as === "Approved") aApp++;
           else if (as === "Rejected" || as === "Reject") aRej++;
           else if (as) aPend++;
        });
        
        if (document.getElementById("billerTotal")) document.getElementById("billerTotal").textContent = bTot;
        if (document.getElementById("billerPending")) document.getElementById("billerPending").textContent = bPend;
        if (document.getElementById("billerApproved")) document.getElementById("billerApproved").textContent = bApp;
        if (document.getElementById("billerRejected")) document.getElementById("billerRejected").textContent = bRej;
        
        if (document.getElementById("accountTotal")) document.getElementById("accountTotal").textContent = aTot;
        if (document.getElementById("accountPending")) document.getElementById("accountPending").textContent = aPend;
        if (document.getElementById("accountApproved")) document.getElementById("accountApproved").textContent = aApp;
        if (document.getElementById("accountRejected")) document.getElementById("accountRejected").textContent = aRej;
`;

html = html.replace('Dashboard.allInvoicesData = res.data.invoices || [];', 'Dashboard.allInvoicesData = res.data.invoices || [];\n' + injection);

fs.writeFileSync('cfo.html', html);
console.log('Fixed CFO dashboard stats manually');
