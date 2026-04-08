// ============================================================
// api.js — Gretex Invoice Web App (COMPLETE)
// Updated: CORS fix + Biller Queue + Approval APIs + CFO APIs
// ============================================================

const API = {

  // 🔁 Replace with your Web App URL
  BASE_URL: "https://script.google.com/macros/s/AKfycbyCGjp70iepiS4t5Zlb5LTk-bFsqtcZfSdrVrxeBKIxPvfx9IdeUZ4J-9ki1mDpwLBWOQ/exec",
            // https://script.google.com/macros/s/AKfycbyCGjp70iepiS4t5Zlb5LTk-bFsqtcZfSdrVrxeBKIxPvfx9IdeUZ4J-9ki1mDpwLBWOQ/exec Next
  // ─────────────────────────────────────────────
  // 🔧 CORE: Base request function
  // ─────────────────────────────────────────────
  async request(action, params = {}) {
    try {
      const token = Auth.getToken();
      const body  = { action, token: token || "", ...params };

      // ✅ CORS Fix: text/plain avoids preflight
      const response = await fetch(API.BASE_URL, {
        method : "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body   : JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        if (data.code === 401) {
          Auth.clearSession();
          window.location.href = "index.html";
          return null;
        }
        throw new Error(data.message || "Request failed");
      }

      return data;

    } catch (err) {
      console.error(`API Error [${action}]:`, err.message);
      Toast.error(err.message || "Something went wrong");
      return null;
    }
  },

  // ─────────────────────────────────────────────
  // 🔐 AUTH
  // ─────────────────────────────────────────────
  auth: {

    async login(email, password) {
      try {
        const response = await fetch(API.BASE_URL, {
          method : "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body   : JSON.stringify({ action: "login", email, password })
        });
        if (!response.ok) {
          return { success: false, message: `Server error: ${response.status}` };
        }
        return await response.json();
      } catch (err) {
        console.error("Login error:", err);
        return { success: false, message: "Connection failed. Check API URL." };
      }
    },

    async logout() {
      return await API.request("logout");
    },

    async getProfile() {
      return await API.request("getProfile");
    },

    async changePassword(oldPassword, newPassword) {
      return await API.request("changePassword", { oldPassword, newPassword });
    }
  },

  // ─────────────────────────────────────────────
  // 📊 DASHBOARD
  // ─────────────────────────────────────────────
  dashboard: {

    async getStats() {
      return await API.request("getDashboardStats");
    }
  },

  // ─────────────────────────────────────────────
  // 📋 INVOICES
  // ─────────────────────────────────────────────
  invoices: {

    async getAll(filters = {}) {
      return await API.request("getInvoices", filters);
    },

    async getDetail(rowIndex) {
      return await API.request("getInvoiceDetail", { rowIndex });
    },

    async updateFields(rowIndex, fields) {
      return await API.request("updateInvoiceFields", { rowIndex, fields });
    },

    async getRedFlags() {
      return await API.request("getRedFlagInvoices");
    }
  },

  // ─────────────────────────────────────────────
  // 📥 BILLER QUEUE
  // ─────────────────────────────────────────────
  biller: {

    async getQueue(filters = {}) {
      return await API.request("getBillerQueue", filters);
    },

    async getStats() {
      return await API.request("getBillerStats");
    },

    async updateReview(queueRowIndex, reviewData) {
      return await API.request("updateBillReview", {
        queueRowIndex, ...reviewData
      });
    },

    async sendForApproval(queueRowIndex, targetRole, targetName, notes) {
      return await API.request("sendBillForApproval", {
        queueRowIndex, targetRole, targetName, notes
      });
    },

    async getStatusHistory(invoiceNumber) {
      return await API.request("getBillStatusHistory", { invoiceNumber });
    },

    async sync() {
      return await API.request("syncBillerQueue");
    }
  },

  // ─────────────────────────────────────────────
  // ✅ ACCOUNT APPROVALS
  // ─────────────────────────────────────────────
  account: {

    async getQueue(filters = {}) {
      return await API.request("getApprovalQueue", filters);
    },

    async approveBill(queueRowIndex, note) {
      return await API.request("approveBill", { queueRowIndex, note });
    },

    async rejectBill(queueRowIndex, reason) {
      return await API.request("rejectBill", { queueRowIndex, reason });
    }
  },

  // ═════════════════════════════════════════════
  // ✅ CFO APPROVALS — WITH BYPASS AUTHORITY
  // ═════════════════════════════════════════════
  cfo: {

    async getQueue(filters = {}) {
      return await API.request("getApprovalQueue", filters);
    },

    async approveBill(queueRowIndex, note = "", bypassAccount = false, adminEmail = "") {
      return await API.request("approveBill", {
        queueRowIndex: queueRowIndex,
        note: note,
        bypassAccount: bypassAccount.toString(),
        adminEmail: adminEmail  // ✅ NEW: Target admin
      });
    },

    async rejectBill(queueRowIndex, reason = "") {
      return await API.request("rejectBill", {
        queueRowIndex: queueRowIndex,
        reason: reason
      });
    },

    async getQueueStats() {
      return await API.request("getQueueStats");
    }
  },

  // ═════════════════════════════════════════════
  // ✅ ADMIN APPROVALS — Final approval stage
  // ═════════════════════════════════════════════
  admin: {

    async getQueue(filters = {}) {
      return await API.request("getApprovalQueue", filters);
    },

    async approveBill(queueRowIndex, note = "") {
      return await API.request("approveBill", {
        queueRowIndex: queueRowIndex,
        note: note
      });
    },

    async rejectBill(queueRowIndex, reason = "") {
      return await API.request("rejectBill", {
        queueRowIndex: queueRowIndex,
        reason: reason
      });
    }
  },

  // ─────────────────────────────────────────────
  // 👥 USERS
  // ─────────────────────────────────────────────
  users: {

    async getAll() {
      return await API.request("getUsers");
    },

    async create(userData) {
      return await API.request("createUser", userData);
    },

    async update(userId, updates) {
      return await API.request("updateUser", { userId, ...updates });
    },

    async delete(userId) {
      return await API.request("deleteUser", { userId });
    },

    async toggleStatus(userId) {
      return await API.request("toggleUserStatus", { userId });
    },

    // ✅ NEW — Get users by role for dropdown
    async getByRole(role) {
      return await API.request("getUsersByRole", { role });
    },

    // ✅ NEW — Get all users grouped by role
    async getAllGrouped() {
      return await API.request("getAllRoleUsers");
    }
  },

  // ─────────────────────────────────────────────
  // 📊 REPORTS
  // ─────────────────────────────────────────────
  reports: {

    async getSummary() {
      return await API.request("getSummaryReport");
    }
  },

  // ─────────────────────────────────────────────
  // 📜 AUDIT
  // ─────────────────────────────────────────────
  audit: {

    async getLogs(limit = 100) {
      return await API.request("getAuditLog", { limit });
    }
  },

  // ─────────────────────────────────────────────
  // ⚙️ SETTINGS
  // ─────────────────────────────────────────────
  settings: {

    async get() {
      return await API.request("getSettings");
    },

    async update(settings) {
      return await API.request("updateSettings", { settings });
    }
  }
};


// ============================================================
// Auth — Session Management
// ============================================================
const Auth = {

  saveSession(data) {
    sessionStorage.setItem("gretex_token", data.token);
    sessionStorage.setItem("gretex_user", JSON.stringify({
      name     : data.name,
      email    : data.email,
      role     : data.role,
      dashboard: data.dashboard
    }));
  },

  getToken() {
    return sessionStorage.getItem("gretex_token") || null;
  },

  getUser() {
    try {
      const u = sessionStorage.getItem("gretex_user");
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },

  getRole() {
    const user = Auth.getUser();
    return user ? user.role : null;
  },

  isLoggedIn() {
    return !!Auth.getToken() && !!Auth.getUser();
  },

  clearSession() {
    sessionStorage.removeItem("gretex_token");
    sessionStorage.removeItem("gretex_user");
  },

  requireAuth() {
    if (!Auth.isLoggedIn()) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },

  requireRole(...allowedRoles) {
    if (!Auth.requireAuth()) return false;
    const role = Auth.getRole();
    if (!allowedRoles.includes(role)) {
      window.location.href = "index.html";
      return false;
    }
    return true;
  },

  async logout() {
    try { await API.auth.logout(); } catch (e) {}
    Auth.clearSession();
    window.location.href = "index.html";
  },

  can: {
    viewInvoices()   {
      return ["Account","CFO","Admin","SuperAdmin","Billing"]
        .includes(Auth.getRole());
    },
    editInvoices()   {
      return ["Biller","Account","CFO","Admin","SuperAdmin"]
        .includes(Auth.getRole());
    },
    approveInvoices(){
      return ["Account","CFO","Admin","SuperAdmin"]
        .includes(Auth.getRole());
    },
    manageUsers()    {
      return ["Admin","SuperAdmin"].includes(Auth.getRole());
    },
    viewReports()    {
      return ["CFO","Admin","SuperAdmin"].includes(Auth.getRole());
    },
    viewAuditLog()   {
      return ["Admin","SuperAdmin"].includes(Auth.getRole());
    },
    manageSettings() {
      return ["Admin","SuperAdmin"].includes(Auth.getRole());
    }
  }
};


// ============================================================
// Toast Notifications
// ============================================================
const Toast = {

  container: null,

  init() {
    if (!Toast.container) {
      Toast.container = document.createElement("div");
      Toast.container.className = "toast-container";
      document.body.appendChild(Toast.container);
    }
  },

  show(message, type = "info", duration = 3500) {
    Toast.init();
    const icons = {
      success: "✅", error: "❌",
      warning: "⚠️", info : "ℹ️"
    };
    const toast     = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size:1rem;flex-shrink:0">${icons[type]||"ℹ️"}</span>
      <span style="flex:1;font-size:0.83rem;line-height:1.4">${message}</span>
      <button onclick="this.parentElement.remove()"
        style="background:none;border:none;cursor:pointer;
               color:#9aa0a6;font-size:1rem;padding:0 0 0 8px">✕</button>`;
    Toast.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity   = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg) { Toast.show(msg, "success"); },
  error(msg)   { Toast.show(msg, "error", 5000); },
  warning(msg) { Toast.show(msg, "warning"); },
  info(msg)    { Toast.show(msg, "info"); }
};


// ============================================================
// Loader
// ============================================================
const Loader = {

  overlay: null,

  show(text = "Loading...") {
    if (!Loader.overlay) {
      Loader.overlay = document.createElement("div");
      Loader.overlay.className = "loading-overlay";
      Loader.overlay.innerHTML = `
        <div class="spinner"></div>
        <div class="loading-text" id="loaderText">${text}</div>`;
      document.body.appendChild(Loader.overlay);
    } else {
      const el = document.getElementById("loaderText");
      if (el) el.textContent = text;
      Loader.overlay.style.display = "flex";
    }
  },

  hide() {
    if (Loader.overlay) Loader.overlay.style.display = "none";
  }
};


// ============================================================
// Utils
// ============================================================
const Utils = {

  formatCurrency(amount) {
    const n = Number(amount) || 0;
    return "₹" + n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  formatDate(val) {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric"
    });
  },

  formatDateTime(val) {
    if (!val) return "—";
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  },

  statusBadge(status) {
    const map = { "PASS": "badge-pass", "REVIEW": "badge-review", "FAIL": "badge-fail" };
    const cls  = map[status] || "badge-info";
    const icon = status === "PASS" ? "✅" : status === "REVIEW" ? "⚠️" :
                 status === "FAIL" ? "❌" : "•";
    return `<span class="badge ${cls}">${icon} ${status || "N/A"}</span>`;
  },

  // ✅ NEW: Approval status badge
  approvalBadge(status) {
    const map = {
      "New"     : { cls: "badge-info",    icon: "🆕" },
      "Reviewed": { cls: "badge-warning", icon: "👁️" },
      "Approved": { cls: "badge-pass",    icon: "✅" },
      "Rejected": { cls: "badge-fail",    icon: "❌" },
      "Pending" : { cls: "badge-review",  icon: "⏳" }
    };

    // Handle "Sent to X" status
    if (status && status.startsWith("Sent")) {
      return `<span class="badge" style="background:#e8f0fe;
        color:#1a73e8;font-weight:700">📤 ${status}</span>`;
    }

    // Handle bypass status
    if (status && status.includes("Bypass")) {
      return `<span class="badge" style="background:#fff3e0;
        color:#e65100;font-weight:700">⚡ ${status}</span>`;
    }

    const config = map[status] || { cls: "badge-info", icon: "•" };
    return `<span class="badge ${config.cls}">
      ${config.icon} ${status || "N/A"}</span>`;
  },

  roleBadge(role) {
    return `<span class="role-badge role-${role}">${role}</span>`;
  },

  userStatusBadge(status) {
    const cls = status === "Active"   ? "status-active"   :
                status === "Inactive" ? "status-inactive" :
                "status-deleted";
    return `<span class="badge ${cls}">${status}</span>`;
  },

  getInitials(name) {
    if (!name) return "?";
    return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
  },

  getRoleColor(role) {
    const colors = {
      "Biller"    : "#7c4dff",
      "Account"   : "#1a73e8",
      "CFO"       : "#00897b",
      "Admin"     : "#f57c00",
      "SuperAdmin": "#c62828",
      "Billing"   : "#2e7d32"
    };
    return colors[role] || "#9aa0a6";
  },

  truncate(str, len = 30) {
    if (!str) return "—";
    return str.length > len ? str.substring(0, len) + "..." : str;
  },

  buildRedFlags(flagStr) {
    if (!flagStr || flagStr.trim() === "") return "—";
    return flagStr.split("|").map(f => `
      <div class="red-flag-item">🚩 ${f.trim()}</div>
    `).join("");
  },

  debounce(fn, delay = 400) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  async confirm(message, title = "Are you sure?") {
    return new Promise(resolve => {
      const overlay     = document.createElement("div");
      overlay.className = "modal-overlay active";
      overlay.innerHTML = `
        <div class="modal-box" style="max-width:400px">
          <div class="modal-header">
            <h5 class="modal-title">⚠️ ${title}</h5>
          </div>
          <div class="modal-body">
            <p style="font-size:0.875rem;color:var(--gray-700);
              line-height:1.6">${message}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" id="confirmNo">Cancel</button>
            <button class="btn btn-danger" id="confirmYes">Confirm</button>
          </div>
        </div>`;
      document.body.appendChild(overlay);
      overlay.querySelector("#confirmYes").onclick = () => {
        overlay.remove(); resolve(true);
      };
      overlay.querySelector("#confirmNo").onclick = () => {
        overlay.remove(); resolve(false);
      };
    });
  },

  // ✅ BILL LOCK CHECK - Only lock when sent for approval or final decision
  isBillLocked(status) {
    // Lock only if: "Sent to X" OR "Approved" OR "Rejected"
    // "Reviewed" is NOT locked - biller can still edit and save
    if (!status) return false;
    return status.indexOf("Sent") !== -1 || 
           status === "Approved" || 
           status === "Rejected";
  }
};

// ─────────────────────────────────────────────
// SMART TRACKING GENERATOR
// ─────────────────────────────────────────────
function generateTrackingTimeline(inv) {
  // Define all stages exactly as per your columns
  const steps = [
    { key: "Received", label: "Received",    date: inv["Timestamp"],       icon: "fa-envelope" },
    { key: "Biller",   label: "Biller",      date: inv["Biller_Send_At"],  icon: "fa-user-check", statusCol: "" },
    { key: "Account",  label: "Account",     date: inv["Account_Send_At"], icon: "fa-calculator", statusCol: inv["Account_Status"] },
    { key: "CFO",      label: "CFO",         date: inv["CFO_Send_At"],     icon: "fa-briefcase",  statusCol: inv["CFO_Status"] },
    { key: "Admin",    label: "Admin",       date: inv["Admin_Send_At"],   icon: "fa-user-shield",statusCol: inv["Admin_Status"] },
    { key: "SA",       label: "Super Admin", date: inv["SA_Approved_At"],  icon: "fa-crown",      statusCol: inv["SA_Status"] }
  ];

  const currentStage = inv["Current_Stage"] || "New";
  let hasRejected = steps.some(s => s.statusCol && s.statusCol.includes("Rejected"));
  let stageReached = false;

  let html = `<div class="tracking-wrapper"><div class="tracking-container">`;

  steps.forEach((step, index) => {
    let statusClass = "";
    let iconHtml = `<i class="fa ${step.icon}"></i>`;
    let dateText = step.date ? step.date : "Pending...";

    if (step.date && step.date !== "") {
      // Stage is COMPLETED
      statusClass = "completed";
      iconHtml = `<i class="fa fa-check"></i>`; 
      
      // If this specific stage was the one that rejected it
      if (step.statusCol && step.statusCol.includes("Rejected")) {
        statusClass = "rejected";
        iconHtml = `<i class="fa fa-times"></i>`;
      }
    } else {
      // Stage is NOT completed yet
      if (!stageReached && !hasRejected && currentStage !== "Completed") {
        // This is the currently ACTIVE stage
        statusClass = "active";
        stageReached = true; 
      }
    }

    html += `
      <div class="track-step ${statusClass}">
        <div class="track-icon">${iconHtml}</div>
        <div class="track-text">
          <h6>${step.label}</h6>
          <p>${dateText}</p>
        </div>
      </div>
    `;
  });

  html += `</div></div>`;
  return html;
}