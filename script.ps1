$files = @("admin.html", "superadmin.html", "cfo.html", "account.html")

$newTabs = @"
  buildAccountingTab(inv) {
    document.getElementById("tab-accounting").innerHTML = `<div class="section-header">📉 Accounting Checks</div><div class="detail-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      ${Dashboard.field("A1. Billed To", inv["A1. Billed To"])}
      ${Dashboard.field("A2. Our Name Correct", inv["A2. Our Name Correct"])}
      ${Dashboard.field("A3. Address Present", inv["A3. Address Present"])}
      ${Dashboard.field("A4. Our Address", inv["A4. Our Address"])}
      ${Dashboard.field("A5. Address Correct", inv["A5. Address Correct"])}
      ${Dashboard.field("A6. PAN Present", inv["A6. PAN Present"])}
      ${Dashboard.field("A7. Our PAN", inv["A7. Our PAN"])}
      ${Dashboard.field("A8. PAN Correct", inv["A8. PAN Correct"])}
      ${Dashboard.field("A9. GST Present", inv["A9. GST Present"])}
      ${Dashboard.field("A10. Our GST", inv["A10. Our GST"])}
      ${Dashboard.field("A11. GST Correct", inv["A11. GST Correct"])}
      ${Dashboard.field("A12. Invoice Date", inv["A12. Invoice Date"])}
      ${Dashboard.field("A13. Invoice Number", inv["A13. Invoice Number"])}
      ${Dashboard.field("A14. Vendor Name", inv["A14. Vendor Name"])}
      ${Dashboard.field("A15. Vendor Address", inv["A15. Vendor Address"])}
      ${Dashboard.field("A16. Bill Description", inv["A16. Bill Description"])}
      ${Dashboard.field("A17. Notes", inv["A17. Notes"])}
      ${Dashboard.field("A18. Rev/Capital", inv["A18. Rev/Capital"])}
      ${Dashboard.field("A19. Ledger Name", inv["A19. Ledger Name"])}
      ${Dashboard.field("A20. Basic Amount", Utils.formatCurrency(inv["A20. Basic Amount"]))}
      ${Dashboard.field("A21. Invoice Type", inv["A21. Invoice Type"])}
      ${Dashboard.field("A22. Final Invoice By", inv["A22. Final Invoice By"])}
    </div>`;
  },
  buildTdsTab(inv) {
    document.getElementById("tab-tds").innerHTML = `<div class="section-header">🔥 TDS Checks</div><div class="detail-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      ${Dashboard.field("B1. TDS Applicable", inv["B1. TDS Applicable"])}
      ${Dashboard.field("B2. Vendor PAN Avail", inv["B2. Vendor PAN Avail"])}
      ${Dashboard.field("B3. Vendor PAN", inv["B3. Vendor PAN"])}
      ${Dashboard.field("B4. PAN Inoperative", inv["B4. PAN Inoperative"])}
      ${Dashboard.field("B5. Entity Type", inv["B5. Vendor Entity Type"])}
      ${Dashboard.field("B6. TDS Section", inv["B6. TDS Section"])}
      ${Dashboard.field("B7. TDS Rate", inv["B7. TDS Rate"])}
      ${Dashboard.field("B8. TDS Amount", Utils.formatCurrency(inv["B8. TDS Amount"]))}
    </div>`;
  },
  buildGstTab(inv) {
    document.getElementById("tab-gst").innerHTML = `<div class="section-header">📑 GST Checks</div><div class="detail-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      ${Dashboard.field("C1. GST Charged", inv["C1. GST Charged"])}
      ${Dashboard.field("C2. Vendor GST Avail", inv["C2. Vendor GST Avail"])}
      ${Dashboard.field("C3. Vendor GST No", inv["C3. Vendor GST No"])}
      ${Dashboard.field("C4. Taxpayer Type", inv["C4. Taxpayer Type"])}
      ${Dashboard.field("C5. Comp GST Wrong", inv["C5. Comp GST Wrong"])}
      ${Dashboard.field("C6. GST Returns Filed", inv["C6. GST Returns Filed"])}
      ${Dashboard.field("C7. Our GST Correct", inv["C7. Our GST Correct"])}
      ${Dashboard.field("C8. Place of Supply", inv["C8. Place of Supply"])}
      ${Dashboard.field("C9. Correct GST Type", inv["C9. Correct GST Type"])}
      ${Dashboard.field("C10. Prior GST Pending", inv["C10. Prior GST Pending"])}
    </div>`;
  },
  buildProcessTab(inv) {
    document.getElementById("tab-process").innerHTML = `<div class="section-header">⚙️ Process Checks</div><div class="detail-grid" style="grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
      ${Dashboard.field("D1. Final Payable", Utils.formatCurrency(inv["D1. Final Payable Amt"]))}
      ${Dashboard.field("D2. Invoice By", inv["D2. Invoice By"])}
      ${Dashboard.field("D3. Received Via", inv["D3. Received Via"])}
      ${Dashboard.field("D4. HOD Name", inv["D4. HOD Name"])}
      ${Dashboard.field("D5. HOD Approval", inv["D5. HOD Approval"])}
      ${Dashboard.field("D6. HOD Screenshot", inv["D6. HOD Screenshot"])}
      ${Dashboard.field("D7. Arvind/Alok Apprvl", inv["D7. Arvind/Alok Apprvl"])}
      ${Dashboard.field("D8. Arvind/Alok SS", inv["D8. Arvind/Alok SS"])}
      ${Dashboard.field("D9. Update Person", inv["D9. Update Person"])}
      ${Dashboard.field("D10. Update Email", inv["D10. Update Email"])}
      ${Dashboard.field("D11. Narration", inv["D11. Narration"])}
    </div>`;
  },
"@

foreach ($f in $files) {
    $file = "d:\1. Apps\0.1 Update\B. Account_App-main\03. Account_App-V3\$f"
    $content = Get-Content $file -Raw
    
    # We will use Regex to replace everything from buildAccountingTab(inv) to the end of buildProcessTab(inv)
    $pattern = '(?s)buildAccountingTab\(inv\)\s*\{.*buildProcessTab\(inv\)\s*\{[^\}]+\},?'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, $newTabs
        [System.IO.File]::WriteAllText($file, $content)
        Write-Output "SUCCESS: $f tabs updated"
    } else {
        Write-Output "ERROR: Tabs not found in $f"
    }
}
