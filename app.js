/* eslint-disable no-use-before-define */
(() => {
  // ===========
  // Config
  // ===========
  const STORAGE_KEYS = {
    auth: "edukaAuth",
    students: "edukaStudents",
    feeTypes: "edukaFeeTypes",
    assignments: "edukaFeeAssignments",
    payments: "edukaPayments",
    receipts: "edukaReceipts",
    receiptCounter: "edukaReceiptCounter",
  };

  const SCHOOL_INFO = {
    name: "Ecole Privée Eduka",
    address: "Quartier Central, Ville (Prototype)",
    phone: "+000 000 000 (Démo)",
    email: "contact@eduka.example",
  };

  // Identifiants fictifs pour la démo
  const ADMIN_USERS = [{ username: "admin", password: "Eduka123" }];

  const MONEY = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    maximumFractionDigits: 0,
  });

  const dateToISO = (d) => {
    const dt = d instanceof Date ? d : new Date(d);
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const safeNumber = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };

  const uid = () =>
    `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

  // ===========
  // Storage
  // ===========
  const loadJSON = (key, fallback) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  };

  const saveJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const getAuth = () => loadJSON(STORAGE_KEYS.auth, { loggedIn: false });

  const setAuth = (auth) => saveJSON(STORAGE_KEYS.auth, auth);

  // ===========
  // Data (in-memory)
  // ===========
  let state = {
    students: [],
    feeTypes: [],
    assignments: [],
    payments: [],
    receipts: [],
    receiptCounter: 0,
  };

  const persistState = () => {
    saveJSON(STORAGE_KEYS.students, state.students);
    saveJSON(STORAGE_KEYS.feeTypes, state.feeTypes);
    saveJSON(STORAGE_KEYS.assignments, state.assignments);
    saveJSON(STORAGE_KEYS.payments, state.payments);
    saveJSON(STORAGE_KEYS.receipts, state.receipts);
    localStorage.setItem(STORAGE_KEYS.receiptCounter, String(state.receiptCounter));
  };

  function seedIfEmpty() {
    const hasStudents = Array.isArray(state.students) && state.students.length > 0;
    const hasFeeTypes = Array.isArray(state.feeTypes) && state.feeTypes.length > 0;

    if (hasStudents && hasFeeTypes) return;

    // --- Fee types
    const feeTypes = [
      { id: uid(), name: "Frais de scolarité", description: "Paiement annuel / semestriel" },
      { id: uid(), name: "Transport", description: "Navette / transport scolaire" },
      { id: uid(), name: "Cantine", description: "Repas de midi (cantine)" },
      { id: uid(), name: "Autres", description: "Frais divers" },
    ];

    const [ftS, ftT, ftC, ftO] = feeTypes;

    // --- Students (démo)
    const students = [
      {
        id: uid(),
        fullName: "Aminata Traoré",
        gender: "F",
        dob: "2012-04-15",
        className: "1A",
        parentName: "Balla Traoré",
        parentPhone: "+225 01 02 03 04 05",
        address: "Abidjan (Prototype)",
        registrationNumber: "REG-1A-0001",
      },
      {
        id: uid(),
        fullName: "Moussa Diallo",
        gender: "M",
        dob: "2011-11-02",
        className: "1A",
        parentName: "Kadiatou Diallo",
        parentPhone: "+225 06 07 08 09 10 11",
        address: "Abidjan (Prototype)",
        registrationNumber: "REG-1A-0002",
      },
      {
        id: uid(),
        fullName: "Sarah Kouamé",
        gender: "F",
        dob: "2010-08-23",
        className: "2A",
        parentName: "Jean Kouamé",
        parentPhone: "+225 12 13 14 15 16 17",
        address: "Abidjan (Prototype)",
        registrationNumber: "REG-2A-0001",
      },
      {
        id: uid(),
        fullName: "Issa Koné",
        gender: "M",
        dob: "2010-03-09",
        className: "2A",
        parentName: "Fatou Koné",
        parentPhone: "+225 18 19 20 21 22 23",
        address: "Abidjan (Prototype)",
        registrationNumber: "REG-2A-0002",
      },
    ];

    const [s1, s2, s3, s4] = students;

    // --- Assignments to classes
    const assignments = [];
    const addClassAssignment = (className, feeTypeId, amount) => {
      assignments.push({
        id: uid(),
        scope: "class",
        scopeId: className,
        feeTypeId,
        amount,
      });
    };

    addClassAssignment("1A", ftS.id, 50000);
    addClassAssignment("1A", ftT.id, 15000);
    addClassAssignment("1A", ftC.id, 10000);

    addClassAssignment("2A", ftS.id, 60000);
    addClassAssignment("2A", ftT.id, 17000);
    addClassAssignment("2A", ftC.id, 12000);

    // Exemple d’affectation directe à un étudiant
    assignments.push({
      id: uid(),
      scope: "student",
      scopeId: s2.id,
      feeTypeId: ftO.id,
      amount: 8000,
    });

    // --- Seed payments (partial payments)
    const payments = [
      {
        id: uid(),
        studentId: s1.id,
        feeTypeId: ftS.id,
        amount: 30000,
        date: dateToISO(new Date(Date.now() - 18 * 24 * 60 * 60 * 1000)),
        method: "Espèces",
        notes: "Premier versement (démo)",
      },
      {
        id: uid(),
        studentId: s1.id,
        feeTypeId: ftT.id,
        amount: 15000,
        date: dateToISO(new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)),
        method: "Espèces",
        notes: "",
      },
      {
        id: uid(),
        studentId: s2.id,
        feeTypeId: ftS.id,
        amount: 50000,
        date: dateToISO(new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)),
        method: "Virement",
        notes: "Paiement semestriel (démo)",
      },
      {
        id: uid(),
        studentId: s3.id,
        feeTypeId: ftS.id,
        amount: 20000,
        date: dateToISO(new Date(Date.now() - 9 * 24 * 60 * 60 * 1000)),
        method: "Espèces",
        notes: "",
      },
      {
        id: uid(),
        studentId: s3.id,
        feeTypeId: ftC.id,
        amount: 12000,
        date: dateToISO(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
        method: "Espèces",
        notes: "",
      },
    ];

    state.students = students;
    state.feeTypes = feeTypes;
    state.assignments = assignments;
    state.payments = payments;
    state.receipts = [];
    state.receiptCounter = 0;
    persistState();
  }

  function loadState() {
    state.students = loadJSON(STORAGE_KEYS.students, []);
    state.feeTypes = loadJSON(STORAGE_KEYS.feeTypes, []);
    state.assignments = loadJSON(STORAGE_KEYS.assignments, []);
    state.payments = loadJSON(STORAGE_KEYS.payments, []);
    state.receipts = loadJSON(STORAGE_KEYS.receipts, []);
    state.receiptCounter = safeNumber(localStorage.getItem(STORAGE_KEYS.receiptCounter) || 0);
    seedIfEmpty();
  }

  // ===========
  // Helpers: lookups
  // ===========
  const studentById = (id) => state.students.find((s) => s.id === id);
  const feeTypeById = (id) => state.feeTypes.find((f) => f.id === id);
  const getClassList = () =>
    Array.from(new Set(state.students.map((s) => s.className)))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, "fr"));

  // ===========
  // Finance computations
  // ===========
  function getExpectedByFeeType(studentId) {
    const student = studentById(studentId);
    if (!student) return { expectedByFeeType: {}, totalExpected: 0 };

    const expectedByFeeType = {};
    for (const a of state.assignments) {
      const matches =
        (a.scope === "class" && a.scopeId === student.className) ||
        (a.scope === "student" && a.scopeId === studentId);
      if (!matches) continue;

      expectedByFeeType[a.feeTypeId] = (expectedByFeeType[a.feeTypeId] || 0) + safeNumber(a.amount);
    }

    const totalExpected = Object.values(expectedByFeeType).reduce((sum, n) => sum + n, 0);
    return { expectedByFeeType, totalExpected };
  }

  function getPaymentsSumByFeeType(studentId) {
    const paidByFeeType = {};
    for (const p of state.payments) {
      if (p.studentId !== studentId) continue;
      paidByFeeType[p.feeTypeId] = (paidByFeeType[p.feeTypeId] || 0) + safeNumber(p.amount);
    }
    return paidByFeeType;
  }

  function computeStudentBalances(studentId) {
    const student = studentById(studentId);
    if (!student) {
      return {
        byFeeType: {},
        totalExpected: 0,
        totalPaid: 0,
        totalRemaining: 0,
      };
    }

    const { expectedByFeeType } = getExpectedByFeeType(studentId);
    const paidByFeeType = getPaymentsSumByFeeType(studentId);

    const byFeeType = {};
    let totalExpected = 0;
    let totalPaid = 0;
    let totalRemaining = 0;

    for (const [feeTypeId, expected] of Object.entries(expectedByFeeType)) {
      const paid = safeNumber(paidByFeeType[feeTypeId] || 0);
      const remaining = Math.max(0, expected - paid);
      byFeeType[feeTypeId] = { expected, paid, remaining };
      totalExpected += expected;
      totalPaid += paid;
      totalRemaining += remaining;
    }

    // Si des paiements existent pour des frais non affectés, on les ignore pour les soldes
    // (prototype simple; logique "attendu" pilotée par les affectations).
    return { byFeeType, totalExpected, totalPaid, totalRemaining };
  }

  function getStudentsPending() {
    return state.students
      .map((s) => ({ student: s, balances: computeStudentBalances(s.id) }))
      .filter((x) => x.balances.totalRemaining > 0)
      .sort((a, b) => b.balances.totalRemaining - a.balances.totalRemaining);
  }

  function computeDashboardStats() {
    const totalStudents = state.students.length;
    const totalCollected = state.payments.reduce((sum, p) => sum + safeNumber(p.amount), 0);
    const totalExpectedRemaining = getStudentsPending().reduce((sum, x) => sum + x.balances.totalRemaining, 0);

    // "Montant total en attente" = totalRemaining sur tous les étudiants (sur affectations)
    // (pas seulement paiements partiels). getStudentsPending le filtre déjà.
    return {
      totalStudents,
      totalCollected,
      totalExpectedRemaining,
    };
  }

  // ===========
  // Receipt generation
  // ===========
  function getOrCreateReceiptForPayment(paymentId) {
    const existing = state.receipts.find((r) => r.paymentId === paymentId);
    if (existing) return existing;

    const payment = state.payments.find((p) => p.id === paymentId);
    if (!payment) throw new Error("Paiement introuvable.");

    const student = studentById(payment.studentId);
    const feeType = feeTypeById(payment.feeTypeId);
    if (!student || !feeType) throw new Error("Données manquantes pour le reçu.");

    // Calcul soldes après le paiement (incluant ce paiement)
    const balances = computeStudentBalances(student.id);

    state.receiptCounter += 1;
    const receiptNumber = `EDU-${String(state.receiptCounter).padStart(6, "0")}`;

    const receipt = {
      id: uid(),
      receiptNumber,
      paymentId: payment.id,
      createdAt: new Date().toISOString(),
      school: SCHOOL_INFO,
      student: {
        fullName: student.fullName,
        registrationNumber: student.registrationNumber,
        className: student.className,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        address: student.address,
      },
      feeType: {
        name: feeType.name,
      },
      payment: {
        date: payment.date,
        amount: safeNumber(payment.amount),
        method: payment.method || "",
        notes: payment.notes || "",
      },
      remainingAfterPayment: balances.byFeeType[payment.feeTypeId]?.remaining ?? 0,
      totalRemainingAfterPayment: balances.totalRemaining,
    };

    state.receipts.push(receipt);
    persistState();
    return receipt;
  }

  function buildReceiptHtml(receipt) {
    const fmt = (n) => MONEY.format(n);
    const issued = dateToISO(new Date(receipt.createdAt));
    const paymentDate = receipt.payment.date;
    const feeName = receipt.feeType.name;

    const safeText = (s) =>
      String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

    return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reçu ${safeText(receipt.receiptNumber)}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;background:#fff;color:#111;margin:0;padding:0;}
      .wrap{max-width:980px;margin:0 auto;padding:28px;}
      .top{display:flex;justify-content:space-between;gap:20px;border-bottom:1px solid #eee;padding-bottom:18px;margin-bottom:18px;}
      .school h1{font-size:20px;margin:0 0 6px 0;}
      .school .meta{font-size:12px;color:#444;line-height:1.5;}
      .receiptTitle{font-size:16px;font-weight:700;text-align:right;}
      .receiptNo{margin-top:6px;font-size:24px;font-weight:800;}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin:18px 0;}
      .box{border:1px solid #eee;border-radius:10px;padding:14px;}
      .box h2{font-size:13px;margin:0 0 10px 0;color:#333;text-transform:uppercase;letter-spacing:.02em;}
      table{width:100%;border-collapse:collapse;}
      th,td{border:1px solid #eee;padding:10px;font-size:13px;vertical-align:top;}
      th{background:#fafafa;text-align:left;}
      .totalRow td{font-weight:800;}
      .small{font-size:12px;color:#444;line-height:1.5;}
      .actions{margin-top:18px;font-size:12px;color:#666;}
      @media print{
        .wrap{padding:0;}
        .actions{display:none;}
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="top">
        <div class="school">
          <h1>${safeText(receipt.school.name)}</h1>
          <div class="meta">
            ${safeText(receipt.school.address)}<br/>
            Tel: ${safeText(receipt.school.phone)}<br/>
            Email: ${safeText(receipt.school.email)}
          </div>
        </div>
        <div class="receiptTitle">
          RECU DE PAIEMENT
          <div class="receiptNo">${safeText(receipt.receiptNumber)}</div>
          <div class="small">Émis le : ${safeText(issued)}</div>
        </div>
      </div>

      <div class="grid">
        <div class="box">
          <h2>Étudiant</h2>
          <div class="small">
            <b>${safeText(receipt.student.fullName)}</b><br/>
            N° inscription : ${safeText(receipt.student.registrationNumber)}<br/>
            Classe : ${safeText(receipt.student.className)}<br/>
            Adresse : ${safeText(receipt.student.address)}
          </div>
        </div>
        <div class="box">
          <h2>Parent / Tuteur</h2>
          <div class="small">
            <b>${safeText(receipt.student.parentName)}</b><br/>
            Téléphone : ${safeText(receipt.student.parentPhone)}
          </div>
        </div>
      </div>

      <div class="box">
        <h2>Détails du paiement</h2>
        <table>
          <thead>
            <tr>
              <th style="width:26%;">Date</th>
              <th style="width:26%;">Type de frais</th>
              <th style="width:22%;">Montant</th>
              <th style="width:26%;">Mode</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${safeText(paymentDate)}</td>
              <td>${safeText(feeName)}</td>
              <td><b>${fmt(receipt.payment.amount)}</b></td>
              <td>${safeText(receipt.payment.method)}</td>
            </tr>
            <tr>
              <td colspan="4">
                <div class="small"><b>Notes :</b> ${safeText(receipt.payment.notes)}</div>
              </td>
            </tr>
            <tr class="totalRow">
              <td colspan="2">Reste pour ce type de frais</td>
              <td colspan="2">${fmt(receipt.remainingAfterPayment)}</td>
            </tr>
            <tr>
              <td colspan="2">Reste total (tous frais)</td>
              <td colspan="2"><b>${fmt(receipt.totalRemainingAfterPayment)}</b></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="actions">
        Prototype (données simulées). Utilisez la fonction d’impression de votre navigateur si besoin.
      </div>
    </div>
  </body>
</html>`;
  }

  function openPrintWindow(html) {
    const w = window.open("", "_blank", "noopener,noreferrer");
    if (!w) return false;
    w.document.open();
    w.document.write(html);
    w.document.close();
    // Laisser le navigateur rendre puis lancer print
    setTimeout(() => {
      try {
        w.focus();
        w.print();
      } catch {
        // ignore
      }
    }, 250);
    return true;
  }

  function downloadTextFile(filename, content, mime = "text/html") {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  // ===========
  // UI helpers
  // ===========
  const el = (selector) => document.querySelector(selector);

  function setActiveNav(routeHash) {
    document.querySelectorAll("[data-route]").forEach((a) => {
      a.classList.toggle("active", a.getAttribute("href") === routeHash);
    });
  }

  function setAppContentClickHandler(handler) {
    const host = el("#appContent");
    if (!host) return;
    if (host.__clickHandler) host.removeEventListener("click", host.__clickHandler);
    host.__clickHandler = handler;
    host.addEventListener("click", handler);
  }

  function showGlobalSpinner(on) {
    const s = el("#globalSpinner");
    if (!s) return;
    s.classList.toggle("d-none", !on);
  }

  function showAlert(type, message) {
    const appContent = el("#appContent");
    if (!appContent) return;
    const host = document.createElement("div");
    host.className = `alert alert-${type} alert-dismissible fade show mb-3`;
    host.role = "alert";
    host.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Fermer"></button>
    `;
    appContent.prepend(host);
    setTimeout(() => {
      try {
        host.remove();
      } catch {
        // ignore
      }
    }, 4500);
  }

  function money(n) {
    return MONEY.format(n || 0);
  }

  function renderTableEmpty(message) {
    return `
      <div class="text-center text-muted py-4">
        <div class="fw-semibold">${message}</div>
      </div>
    `;
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "2-digit", day: "2-digit" });
  }

  // ===========
  // Routing / Views
  // ===========
  const routes = {
    login: "#login",
    dashboard: "#dashboard",
    students: "#students",
    fees: "#fees",
    payments: "#payments",
    pending: "#pending",
    receipts: "#receipts",
  };

  function getRouteHash() {
    const h = window.location.hash || routes.dashboard;
    // normalize:
    for (const k of Object.keys(routes)) {
      if (h === routes[k]) return routes[k];
    }
    return routes.dashboard;
  }

  function setPageTitle(title, subtitle = "") {
    const t = el("#pageTitle");
    const s = el("#pageSubtitle");
    if (t) t.textContent = title;
    if (s) s.textContent = subtitle;
  }

  function renderLoginView() {
    setPageTitle("Connexion", "Accès administrateur (simulation)");
    el("#appSidebar").style.display = "none";
    const menuBtn = document.querySelector('[data-bs-target="#mobileNav"]');
    if (menuBtn) menuBtn.classList.add("d-none");

    const appContent = el("#appContent");
    appContent.innerHTML = `
      <div class="login-wrapper">
        <div class="w-100" style="max-width: 520px;">
          <div class="mb-3">
            <div class="fw-bold fs-4">Eduka</div>
            <div class="text-muted">Prototype de gestion des paiements scolaires.</div>
          </div>

          <div class="card shadow-sm">
            <div class="card-body">
              <form id="loginForm" class="needs-validation" novalidate>
                <div class="mb-3">
                  <label class="form-label">Nom d’utilisateur</label>
                  <input class="form-control" name="username" autocomplete="username" required />
                </div>
                <div class="mb-3">
                  <label class="form-label">Mot de passe</label>
                  <input class="form-control" type="password" name="password" autocomplete="current-password" required />
                </div>
                <div class="d-grid gap-2">
                  <button class="btn btn-primary" type="submit">Se connecter</button>
                  <div class="text-muted small">
                    Démo: <b>admin</b> / <b>Eduka123</b>
                  </div>
                </div>
                <div class="mt-3 text-muted small">
                  Données et authentification sont simulées (localStorage).
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    const form = el("#loginForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const username = String(fd.get("username") || "").trim();
      const password = String(fd.get("password") || "").trim();

      if (!username || !password) {
        showAlert("danger", "Veuillez renseigner le nom d’utilisateur et le mot de passe.");
        return;
      }

      const ok = ADMIN_USERS.some((u) => u.username === username && u.password === password);
      if (!ok) {
        showAlert("danger", "Identifiants incorrects (simulation).");
        return;
      }

      setAuth({ loggedIn: true, username, loginAt: new Date().toISOString() });
      renderAuthedShell();
      navigate(routes.dashboard);
      showAlert("success", "Connexion réussie.");
    });
  }

  function renderAuthedShell() {
    el("#appSidebar").style.display = "";
    const auth = getAuth();
    el("#adminLabel").textContent = `Connecté: ${auth.username}`;
    const adminLabelMobile = el("#adminLabelMobile");
    if (adminLabelMobile) adminLabelMobile.textContent = `Connecté: ${auth.username}`;
    const menuBtn = document.querySelector('[data-bs-target="#mobileNav"]');
    if (menuBtn) menuBtn.classList.remove("d-none");
  }

  function navigate(hash) {
    if (window.location.hash === hash) {
      renderRoute();
      return;
    }
    window.location.hash = hash;
  }

  function renderDashboardView() {
    setPageTitle("Tableau de bord", "Vue d’ensemble des paiements");
    el("#appSidebar").style.display = "";

    const stats = computeDashboardStats();
    const recent = [...state.payments].sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 8);

    const recentRows = recent
      .map((p) => {
        const s = studentById(p.studentId);
        const f = feeTypeById(p.feeTypeId);
        return `
          <tr>
            <td>${formatDate(p.date)}</td>
            <td>${s ? s.fullName : "-"}</td>
            <td>${f ? f.name : "-"}</td>
            <td><b>${money(p.amount)}</b></td>
            <td class="text-muted small">${p.method || ""}</td>
          </tr>
        `;
      })
      .join("");

    el("#appContent").innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Étudiants</div>
              <div class="fs-3 fw-bold">${stats.totalStudents}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Total collecté</div>
              <div class="fs-3 fw-bold">${money(stats.totalCollected)}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Montant en attente</div>
              <div class="fs-3 fw-bold">${money(stats.totalExpectedRemaining)}</div>
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6 col-lg-3">
          <div class="card border-0 bg-white shadow-sm">
            <div class="card-body">
              <div class="text-muted small">Paiements (nb)</div>
              <div class="fs-3 fw-bold">${state.payments.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="row g-3 mt-1">
        <div class="col-12 col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between gap-2">
                <div>
                  <div class="fw-bold">Paiements récents</div>
                  <div class="text-muted small">Dernières transactions enregistrées</div>
                </div>
                <a class="btn btn-outline-primary btn-sm" href="#payments">Voir tous</a>
              </div>
              <div class="table-responsive mt-3">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Étudiant</th>
                      <th>Frais</th>
                      <th>Montant</th>
                      <th>Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recent.length ? recentRows : `<tr><td colspan="5">${renderTableEmpty("Aucun paiement pour le moment.")}</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <div class="col-12 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="fw-bold">Paiements en attente</div>
              <div class="text-muted small mt-1">Étudiants avec un solde impayé</div>
              <div class="mt-3">
                ${(() => {
                  const pending = getStudentsPending().slice(0, 6);
                  if (!pending.length) {
                    return `<div class="text-muted">Aucun solde en attente.</div>`;
                  }
                  return `
                    <div class="list-group list-group-flush">
                      ${pending
                        .map(
                          (x) => `
                        <div class="list-group-item d-flex align-items-center justify-content-between gap-2">
                          <div>
                            <div class="fw-semibold">${x.student.fullName}</div>
                            <div class="text-muted small">${x.student.className}</div>
                          </div>
                          <div class="fw-bold">${money(x.balances.totalRemaining)}</div>
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  `;
                })()}
              </div>
              <a class="btn btn-primary btn-sm w-100 mt-3" href="#pending">Gérer les impayés</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // =======================
  // Students View
  // =======================
  function studentFormModalHtml(mode, student = null) {
    const isEdit = mode === "edit";
    const title = isEdit ? "Modifier l’étudiant" : "Ajouter un étudiant";

    const genderOptions = `
      <option value="M" ${student && student.gender === "M" ? "selected" : ""}>Masculin</option>
      <option value="F" ${student && student.gender === "F" ? "selected" : ""}>Féminin</option>
    `;

    return `
      <div class="modal fade" id="studentModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <div>
                <div class="modal-title fw-bold">${title}</div>
                <div class="text-muted small">Champs requis pour la démo</div>
              </div>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
            </div>

            <div class="modal-body">
              <form id="studentForm" class="needs-validation" novalidate>
                <input type="hidden" name="studentId" value="${student ? student.id : ""}" />
                <div class="row g-3">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Nom complet</label>
                    <input class="form-control" name="fullName" required value="${student ? student.fullName : ""}" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Genre</label>
                    <select class="form-select" name="gender" required>
                      ${genderOptions}
                    </select>
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">Date de naissance</label>
                    <input class="form-control" type="date" name="dob" required value="${student ? student.dob : ""}" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Classe / Niveau</label>
                    <input class="form-control" name="className" required value="${student ? student.className : ""}" placeholder="Ex: 1A" />
                  </div>

                  <div class="col-12 col-md-6">
                    <label class="form-label">Parent / Tuteur</label>
                    <input class="form-control" name="parentName" required value="${student ? student.parentName : ""}" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Téléphone parent</label>
                    <input class="form-control" name="parentPhone" required value="${student ? student.parentPhone : ""}" placeholder="+225 ..." />
                  </div>

                  <div class="col-12">
                    <label class="form-label">Adresse</label>
                    <textarea class="form-control" rows="2" name="address" required>${student ? student.address : ""}</textarea>
                  </div>

                  <div class="col-12">
                    <label class="form-label">Numéro d’inscription</label>
                    <input class="form-control" name="registrationNumber" required value="${
                      student ? student.registrationNumber : ""
                    }" placeholder="Ex: REG-1A-0001" />
                    <div class="form-text">Doit être unique (prototype).</div>
                  </div>
                </div>

                <div class="mt-3">
                  <div class="alert alert-info mb-0">
                    Les soldes sont calculés à partir des affectations de frais (page <b>Frais &amp; Affectations</b>).
                  </div>
                </div>
              </form>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                Annuler
              </button>
              <button type="submit" form="studentForm" class="btn btn-primary">
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function renderStudentsView() {
    setPageTitle("Étudiants", "Ajouter, modifier, supprimer, filtrer");
    el("#appSidebar").style.display = "";

    const classList = getClassList();

    const rows = state.students
      .slice()
      .sort((a, b) => String(a.className).localeCompare(String(b.className), "fr") || a.fullName.localeCompare(b.fullName, "fr"))
      .map((s) => {
        const balances = computeStudentBalances(s.id);
        return `
          <tr data-student-id="${s.id}">
            <td>${s.registrationNumber}</td>
            <td>
              <div class="fw-semibold">${s.fullName}</div>
              <div class="text-muted small">${s.parentName}</div>
            </td>
            <td>${s.gender === "M" ? "M" : "F"}</td>
            <td>${s.dob}</td>
            <td>${s.className}</td>
            <td><b>${money(balances.totalExpected)}</b></td>
            <td><b>${money(balances.totalRemaining)}</b></td>
            <td class="text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" data-action="editStudent" data-id="${s.id}">
                  Modifier
                </button>
                <button class="btn btn-sm btn-outline-danger" data-action="deleteStudent" data-id="${s.id}">
                  Supprimer
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    el("#appContent").innerHTML = `
      <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div>
          <div class="fw-bold fs-5">Gestion des étudiants</div>
          <div class="text-muted small">Recherche et filtres + aperçu des soldes</div>
        </div>
        <button class="btn btn-primary" id="btnAddStudent">
          Ajouter un étudiant
        </button>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-12 col-md-6">
              <label class="form-label">Recherche</label>
              <input class="form-control" id="studentSearch" placeholder="Nom, N° inscription, parent..." />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Classe</label>
              <select class="form-select" id="studentClassFilter">
                <option value="">Toutes les classes</option>
                ${classList.map((c) => `<option value="${c}">${c}</option>`).join("")}
              </select>
            </div>
            <div class="col-12 col-md-2 d-flex align-items-end">
              <button class="btn btn-outline-secondary w-100" id="btnResetStudentFilters" type="button">
                Réinitialiser
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm align-middle" id="studentsTable">
              <thead>
                <tr>
                  <th>N° inscription</th>
                  <th>Étudiant</th>
                  <th>Genre</th>
                  <th>Date naissance</th>
                  <th>Classe</th>
                  <th>Total attendu</th>
                  <th>Reste à payer</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${rows || `<tr><td colspan="8">${renderTableEmpty("Aucun étudiant pour le moment.")}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      ${studentFormModalHtml("add")}
    `;

    const search = el("#studentSearch");
    const classFilter = el("#studentClassFilter");
    const resetBtn = el("#btnResetStudentFilters");

    const modalEl = el("#studentModal");
    let modal = null;
    if (modalEl) modal = new bootstrap.Modal(modalEl, { backdrop: "static" });

    const openAdd = () => {
      el("#studentModal").remove();
      el("#appContent").insertAdjacentHTML("beforeend", studentFormModalHtml("add"));
      const newModalEl = el("#studentModal");
      modal = new bootstrap.Modal(newModalEl, { backdrop: "static" });
      attachStudentFormHandlers("add");
      modal.show();
    };

    const openEdit = (studentId) => {
      const s = studentById(studentId);
      if (!s) return;
      el("#studentModal").remove();
      el("#appContent").insertAdjacentHTML("beforeend", studentFormModalHtml("edit", s));
      const newModalEl = el("#studentModal");
      modal = new bootstrap.Modal(newModalEl, { backdrop: "static" });
      attachStudentFormHandlers("edit");
      modal.show();
    };

    const attachStudentFormHandlers = (mode) => {
      const form = el("#studentForm");
      const fdRequired = ["fullName", "gender", "dob", "className", "parentName", "parentPhone", "address", "registrationNumber"];
      form.addEventListener(
        "submit",
        (ev) => {
          ev.preventDefault();
          const fd = new FormData(form);

          for (const key of fdRequired) {
            if (!String(fd.get(key) || "").trim()) {
              showAlert("danger", `Champ requis: ${key}.`);
              return;
            }
          }

          const studentId = String(fd.get("studentId") || "");
          const registrationNumber = String(fd.get("registrationNumber") || "").trim();
          const duplicate = state.students.some(
            (s) => s.registrationNumber === registrationNumber && (!studentId || s.id !== studentId)
          );
          if (duplicate) {
            showAlert("danger", "Le numéro d’inscription doit être unique.");
            return;
          }

          const payload = {
            fullName: String(fd.get("fullName") || "").trim(),
            gender: String(fd.get("gender") || "").trim(),
            dob: String(fd.get("dob") || "").trim(),
            className: String(fd.get("className") || "").trim(),
            parentName: String(fd.get("parentName") || "").trim(),
            parentPhone: String(fd.get("parentPhone") || "").trim(),
            address: String(fd.get("address") || "").trim(),
            registrationNumber,
          };

          if (mode === "edit" && studentId) {
            const idx = state.students.findIndex((s) => s.id === studentId);
            if (idx === -1) return;
            state.students[idx] = { ...state.students[idx], ...payload };
          } else {
            state.students.push({ id: uid(), ...payload });
          }

          persistState();
          modal.hide();
          renderRoute();
          showAlert("success", "Étudiant enregistré.");
        },
        { once: true }
      );
    };

    el("#btnAddStudent").addEventListener("click", openAdd);

    setAppContentClickHandler((e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (!id) return;
      if (action === "editStudent") openEdit(id);

      if (action === "deleteStudent") {
        const s = studentById(id);
        if (!s) return;
        const ok = window.confirm(`Supprimer l’étudiant "${s.fullName}" ?`);
        if (!ok) return;

        // Supprimer aussi les paiements liés (prototype)
        state.students = state.students.filter((x) => x.id !== id);
        state.payments = state.payments.filter((p) => p.studentId !== id);
        state.receipts = state.receipts.filter((r) => {
          const payment = state.payments.find((p) => p.id === r.paymentId);
          return Boolean(payment);
        });
        persistState();
        showAlert("success", "Étudiant supprimé.");
        renderRoute();
      }
    });

    const applyFilters = () => {
      const q = String(search.value || "").toLowerCase().trim();
      const classVal = String(classFilter.value || "").trim();

      document.querySelectorAll("#studentsTable tbody tr").forEach((tr) => {
        const id = tr.getAttribute("data-student-id");
        const s = studentById(id);
        if (!s) return;

        const haystack = `${s.fullName} ${s.registrationNumber} ${s.parentName} ${s.parentPhone} ${s.className}`.toLowerCase();
        const matchesQ = !q || haystack.includes(q);
        const matchesClass = !classVal || s.className === classVal;
        tr.style.display = matchesQ && matchesClass ? "" : "none";
      });
    };

    search.addEventListener("input", applyFilters);
    classFilter.addEventListener("change", applyFilters);
    resetBtn.addEventListener("click", () => {
      search.value = "";
      classFilter.value = "";
      applyFilters();
    });
  }

  // =======================
  // Fees View
  // =======================
  function renderFeesView() {
    setPageTitle("Frais & Affectations", "Définir les types et assigner aux classes/étudiants");
    el("#appSidebar").style.display = "";

    const feeTypeRows = state.feeTypes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      .map(
        (f) => `
      <tr>
        <td>${f.name}</td>
        <td class="text-muted small">${f.description || ""}</td>
        <td class="text-end">
          <div class="d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-primary" data-action="editFeeType" data-id="${f.id}">Modifier</button>
            <button class="btn btn-sm btn-outline-danger" data-action="deleteFeeType" data-id="${f.id}">Supprimer</button>
          </div>
        </td>
      </tr>
    `
      )
      .join("");

    const assignmentsRows = state.assignments
      .slice()
      .sort((a, b) => String(a.scopeId).localeCompare(String(b.scopeId), "fr"))
      .map((a) => {
        const fee = feeTypeById(a.feeTypeId);
        const scopeLabel = a.scope === "class" ? `Classe ${a.scopeId}` : `Étudiant ${studentById(a.scopeId)?.fullName || a.scopeId}`;
        return `
          <tr>
            <td>${scopeLabel}</td>
            <td>${fee ? fee.name : a.feeTypeId}</td>
            <td><b>${money(a.amount)}</b></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-danger" data-action="deleteAssignment" data-id="${a.id}">
                Retirer
              </button>
            </td>
          </tr>
        `;
      })
      .join("");

    const classList = getClassList();
    const studentsOptions = state.students
      .slice()
      .sort((a, b) => a.className.localeCompare(b.className, "fr") || a.fullName.localeCompare(b.fullName, "fr"))
      .map((s) => `<option value="${s.id}">${s.fullName} (${s.className})</option>`)
      .join("");

    el("#appContent").innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-lg-7">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <div>
                  <div class="fw-bold fs-5">Types de frais</div>
                  <div class="text-muted small">Ajouter/modifier les catégories</div>
                </div>
                <button class="btn btn-primary btn-sm" id="btnAddFeeType">Ajouter un type</button>
              </div>

              <div class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Nom</th>
                      <th>Description</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${feeTypeRows || `<tr><td colspan="3">${renderTableEmpty("Aucun type de frais pour le moment.")}</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-5">
          <div class="card shadow-sm h-100">
            <div class="card-body">
              <div class="fw-bold">Aperçu - total attendu par étudiant</div>
              <div class="text-muted small">Basé sur les affectations (classes + étudiant)</div>

              <div class="mt-3">
                <label class="form-label">Choisir un étudiant</label>
                <select class="form-select" id="feePreviewStudent">
                  ${studentsOptions || `<option value="">Aucun étudiant</option>`}
                </select>
              </div>

              <div class="mt-3">
                <div class="d-flex justify-content-between">
                  <div class="text-muted small">Total attendu</div>
                  <div class="fw-bold" id="feePreviewExpected">-</div>
                </div>
                <div class="d-flex justify-content-between mt-2">
                  <div class="text-muted small">Total payé</div>
                  <div class="fw-bold" id="feePreviewPaid">-</div>
                </div>
                <div class="d-flex justify-content-between mt-2">
                  <div class="text-muted small">Reste à payer</div>
                  <div class="fw-bold text-danger" id="feePreviewRemaining">-</div>
                </div>
              </div>

              <div class="mt-3">
                <div class="text-muted small">Détail par frais</div>
                <div class="table-responsive mt-2">
                  <table class="table table-sm align-middle" id="feePreviewTable">
                    <thead>
                      <tr>
                        <th>Frais</th>
                        <th>Attendu</th>
                        <th>Reste</th>
                      </tr>
                    </thead>
                    <tbody></tbody>
                  </table>
                </div>
              </div>
              <a class="btn btn-outline-primary btn-sm w-100 mt-3" href="#payments">Enregistrer un paiement</a>
            </div>
          </div>
        </div>

        <div class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <div>
                  <div class="fw-bold fs-5">Affectations</div>
                  <div class="text-muted small">Assigner des frais aux classes et/ou aux étudiants</div>
                </div>
                <button class="btn btn-primary btn-sm" id="btnAddAssignment">Ajouter une affectation</button>
              </div>

              <div class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Portée</th>
                      <th>Type de frais</th>
                      <th>Montant</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${assignmentsRows || `<tr><td colspan="4">${renderTableEmpty("Aucune affectation pour le moment.")}</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Fee type modal placeholder -->
      <div id="feeTypeModalHost"></div>

      <!-- Assignment modal placeholder -->
      <div id="assignmentModalHost"></div>
    `;

    const feeTypeModalHost = el("#feeTypeModalHost");
    const assignmentModalHost = el("#assignmentModalHost");

    const openFeeTypeModal = (mode, feeType = null) => {
      const isEdit = mode === "edit";
      const title = isEdit ? "Modifier le type de frais" : "Ajouter un type de frais";
      feeTypeModalHost.innerHTML = `
        <div class="modal fade" id="feeTypeModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <div>
                  <div class="modal-title fw-bold">${title}</div>
                  <div class="text-muted small">Catégorie de frais</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
              </div>
              <div class="modal-body">
                <form id="feeTypeForm" class="needs-validation" novalidate>
                  <input type="hidden" name="feeTypeId" value="${feeType ? feeType.id : ""}" />
                  <div class="mb-3">
                    <label class="form-label">Nom</label>
                    <input class="form-control" name="name" required value="${feeType ? feeType.name : ""}" />
                  </div>
                  <div class="mb-0">
                    <label class="form-label">Description</label>
                    <textarea class="form-control" rows="3" name="description">${feeType ? feeType.description || "" : ""}</textarea>
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" form="feeTypeForm" class="btn btn-primary">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const m = new bootstrap.Modal(el("#feeTypeModal"), { backdrop: "static" });
      const form = el("#feeTypeForm");

      form.addEventListener(
        "submit",
        (ev) => {
          ev.preventDefault();
          const fd = new FormData(form);
          const feeTypeId = String(fd.get("feeTypeId") || "");
          const name = String(fd.get("name") || "").trim();
          const description = String(fd.get("description") || "").trim();

          if (!name) {
            showAlert("danger", "Veuillez renseigner le nom du type de frais.");
            return;
          }

          const duplicate = state.feeTypes.some((f) => f.name.toLowerCase() === name.toLowerCase() && (!feeTypeId || f.id !== feeTypeId));
          if (duplicate) {
            showAlert("danger", "Un type de frais avec ce nom existe déjà.");
            return;
          }

          if (feeTypeId) {
            const idx = state.feeTypes.findIndex((f) => f.id === feeTypeId);
            if (idx === -1) return;
            state.feeTypes[idx] = { ...state.feeTypes[idx], name, description };
          } else {
            state.feeTypes.push({ id: uid(), name, description });
          }

          persistState();
          m.hide();
          renderRoute();
          showAlert("success", "Type de frais enregistré.");
        },
        { once: true }
      );

      m.show();
    };

    const openAssignmentModal = () => {
      assignmentModalHost.innerHTML = `
        <div class="modal fade" id="assignmentModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
              <div class="modal-header">
                <div>
                  <div class="modal-title fw-bold">Ajouter une affectation</div>
                  <div class="text-muted small">Assigner un montant à un type de frais</div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fermer"></button>
              </div>
              <div class="modal-body">
                <form id="assignmentForm" class="needs-validation" novalidate>
                  <div class="row g-3">
                    <div class="col-12 col-md-4">
                      <label class="form-label">Portée</label>
                      <select class="form-select" id="assignmentScope" required>
                        <option value="class">Classe</option>
                        <option value="student">Étudiant</option>
                      </select>
                    </div>

                    <div class="col-12 col-md-4" id="assignmentScopeClassWrap">
                      <label class="form-label">Classe</label>
                      <select class="form-select" name="scopeClass" required>
                        ${classList.map((c) => `<option value="${c}">${c}</option>`).join("")}
                      </select>
                    </div>

                    <div class="col-12 col-md-4 d-none" id="assignmentScopeStudentWrap">
                      <label class="form-label">Étudiant</label>
                      <select class="form-select" name="scopeStudent" required>
                        ${state.students
                          .slice()
                          .sort((a, b) => a.className.localeCompare(b.className, "fr") || a.fullName.localeCompare(b.fullName, "fr"))
                          .map((s) => `<option value="${s.id}">${s.fullName} (${s.className})</option>`)
                          .join("")}
                      </select>
                    </div>

                    <div class="col-12 col-md-4">
                      <label class="form-label">Type de frais</label>
                      <select class="form-select" name="feeTypeId" required>
                        ${state.feeTypes
                          .map((f) => `<option value="${f.id}">${f.name}</option>`)
                          .join("")}
                      </select>
                    </div>

                    <div class="col-12 col-md-4">
                      <label class="form-label">Montant</label>
                      <input class="form-control" name="amount" type="number" min="0" step="1" required value="0" />
                      <div class="form-text">En XOF</div>
                    </div>
                  </div>

                  <div class="mt-3 alert alert-warning mb-0">
                    Les soldes et montants attendus sont recalculés automatiquement.
                  </div>
                </form>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Annuler</button>
                <button type="submit" form="assignmentForm" class="btn btn-primary">Ajouter</button>
              </div>
            </div>
          </div>
        </div>
      `;

      const m = new bootstrap.Modal(el("#assignmentModal"), { backdrop: "static" });
      const scopeSel = el("#assignmentScope");
      const classWrap = el("#assignmentScopeClassWrap");
      const studentWrap = el("#assignmentScopeStudentWrap");

      scopeSel.addEventListener("change", () => {
        const isStudent = scopeSel.value === "student";
        classWrap.classList.toggle("d-none", isStudent);
        studentWrap.classList.toggle("d-none", !isStudent);
      });

      const form = el("#assignmentForm");
      form.addEventListener(
        "submit",
        (ev) => {
          ev.preventDefault();
          const fd = new FormData(form);

          const scope = scopeSel.value;
          const scopeId = scope === "class" ? String(fd.get("scopeClass") || "") : String(fd.get("scopeStudent") || "");
          const feeTypeId = String(fd.get("feeTypeId") || "");
          const amount = safeNumber(fd.get("amount"));

          if (!scopeId || !feeTypeId || amount <= 0) {
            showAlert("danger", "Veuillez vérifier la portée, le type de frais et un montant > 0.");
            return;
          }

          state.assignments.push({ id: uid(), scope, scopeId, feeTypeId, amount });
          persistState();
          m.hide();
          renderRoute();
          showAlert("success", "Affectation ajoutée.");
        },
        { once: true }
      );

      m.show();
    };

    // Preview logic
    const previewSel = el("#feePreviewStudent");
    const previewExpected = el("#feePreviewExpected");
    const previewPaid = el("#feePreviewPaid");
    const previewRemaining = el("#feePreviewRemaining");
    const previewTbody = el("#feePreviewTable tbody");

    const updatePreview = () => {
      const id = String(previewSel.value || "");
      if (!id) {
        previewExpected.textContent = "-";
        previewPaid.textContent = "-";
        previewRemaining.textContent = "-";
        previewTbody.innerHTML = "";
        return;
      }

      const balances = computeStudentBalances(id);
      previewExpected.textContent = money(balances.totalExpected);
      previewPaid.textContent = money(balances.totalPaid);
      previewRemaining.textContent = money(balances.totalRemaining);

      const byFeeTypeEntries = Object.entries(balances.byFeeType);
      previewTbody.innerHTML = byFeeTypeEntries
        .map(([feeTypeId, info]) => {
          const ft = feeTypeById(feeTypeId);
          return `
            <tr>
              <td>${ft ? ft.name : feeTypeId}</td>
              <td>${money(info.expected)}</td>
              <td><b>${money(info.remaining)}</b></td>
            </tr>
          `;
        })
        .join("");
    };
    previewSel.addEventListener("change", updatePreview);
    updatePreview();

    el("#btnAddFeeType").addEventListener("click", () => openFeeTypeModal("add"));
    el("#btnAddAssignment").addEventListener("click", () => {
      if (!state.feeTypes.length || !state.students.length) {
        showAlert("danger", "Créez d’abord des étudiants et des types de frais.");
        return;
      }
      openAssignmentModal();
    });

    setAppContentClickHandler((e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      if (!id) return;

      if (action === "editFeeType") {
        const ft = feeTypeById(id);
        if (!ft) return;
        openFeeTypeModal("edit", ft);
      }

      if (action === "deleteFeeType") {
        const ft = feeTypeById(id);
        if (!ft) return;
        const ok = window.confirm(`Supprimer le type de frais "${ft.name}" ? (prototype)`);
        if (!ok) return;

        // Retirer affectations et paiements liés (prototype)
        state.feeTypes = state.feeTypes.filter((x) => x.id !== id);
        state.assignments = state.assignments.filter((a) => a.feeTypeId !== id);
        state.payments = state.payments.filter((p) => p.feeTypeId !== id);
        state.receipts = state.receipts.filter((r) => {
          const payment = state.payments.find((p) => p.id === r.paymentId);
          return Boolean(payment);
        });
        persistState();
        showAlert("success", "Type de frais supprimé.");
        renderRoute();
      }

      if (action === "deleteAssignment") {
        const a = state.assignments.find((x) => x.id === id);
        if (!a) return;
        const ok = window.confirm("Retirer cette affectation ?");
        if (!ok) return;
        state.assignments = state.assignments.filter((x) => x.id !== id);
        persistState();
        showAlert("success", "Affectation retirée.");
        renderRoute();
      }
    });
  }

  // =======================
  // Payments View
  // =======================
  function renderPaymentsView() {
    setPageTitle("Paiements", "Enregistrer des paiements (partiels) + reçus");
    el("#appSidebar").style.display = "";

    const studentsSorted = state.students
      .slice()
      .sort((a, b) => a.className.localeCompare(b.className, "fr") || a.fullName.localeCompare(b.fullName, "fr"));

    const studentOptions = studentsSorted.map((s) => `<option value="${s.id}">${s.fullName} (${s.className})</option>`).join("");

    const recent = [...state.payments]
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
      .slice(0, 50);

    const rows = recent
      .map((p) => {
        const s = studentById(p.studentId);
        const ft = feeTypeById(p.feeTypeId);
        // Remaining for that feeType after this payment
        // Since we compute from current state, it matches "after all payments including this one".
        const balances = computeStudentBalances(p.studentId);
        const rem = balances.byFeeType[p.feeTypeId]?.remaining ?? 0;
        return `
          <tr>
            <td>${formatDate(p.date)}</td>
            <td>
              <div class="fw-semibold">${s ? s.fullName : "-"}</div>
              <div class="text-muted small">${s ? s.className : ""}</div>
            </td>
            <td>${ft ? ft.name : "-"}</td>
            <td><b>${money(p.amount)}</b></td>
            <td class="text-muted small">${p.method || ""}</td>
            <td class="text-muted small">${p.notes || ""}</td>
            <td class="text-end">
              <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-primary" data-action="openReceipt" data-id="${p.id}">
                  Reçu
                </button>
                <div class="text-end mt-1 d-none d-lg-block">
                  <div class="text-muted small">Reste</div>
                  <div class="fw-bold">${money(rem)}</div>
                </div>
              </div>
            </td>
          </tr>
        `;
      })
      .join("");

    const filterOptions = [{ id: "", label: "Tous les étudiants" }, ...studentsSorted.map((s) => ({ id: s.id, label: `${s.fullName} (${s.className})` }))];

    const filterSelect = filterOptions.map((o) => `<option value="${o.id}">${o.label}</option>`).join("");

    el("#appContent").innerHTML = `
      <div class="row g-3">
        <div class="col-12 col-lg-4">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="fw-bold fs-5">Enregistrer un paiement</div>
              <div class="text-muted small">Support des paiements partiels</div>

              <form id="paymentForm" class="mt-3 needs-validation" novalidate>
                <div class="mb-3">
                  <label class="form-label">Étudiant</label>
                  <select class="form-select" name="studentId" id="paymentStudentId" required>
                    ${studentOptions || `<option value="">Aucun étudiant</option>`}
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Type de frais</label>
                  <select class="form-select" name="feeTypeId" id="paymentFeeTypeId" required>
                    <option value="">Sélectionner</option>
                  </select>
                </div>

                <div class="mb-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <label class="form-label mb-0">Reste à payer pour ce type</label>
                    <div class="fw-bold text-danger" id="paymentRemainingLabel">-</div>
                  </div>
                  <div class="form-text">Calculé à partir des affectations et paiements enregistrés</div>
                </div>

                <div class="mb-3">
                  <label class="form-label">Montant payé</label>
                  <input class="form-control" name="amount" type="number" min="1" step="1" required value="0" />
                </div>

                <div class="row g-2">
                  <div class="col-12 col-md-6">
                    <label class="form-label">Date</label>
                    <input class="form-control" name="date" type="date" required value="${dateToISO(new Date())}" />
                  </div>
                  <div class="col-12 col-md-6">
                    <label class="form-label">Mode</label>
                    <select class="form-select" name="method" required>
                      <option value="Espèces">Espèces</option>
                      <option value="Virement">Virement</option>
                      <option value="Carte">Carte</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div class="mb-3 mt-2">
                  <label class="form-label">Notes</label>
                  <textarea class="form-control" rows="2" name="notes"></textarea>
                </div>

                <button type="submit" class="btn btn-primary w-100">Enregistrer</button>
                <div class="text-muted small mt-2">
                  Si aucun solde n’est disponible, sélectionnez un autre étudiant / type.
                </div>
              </form>
            </div>
          </div>
        </div>

        <div class="col-12 col-lg-8">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
                <div>
                  <div class="fw-bold fs-5">Historique des paiements</div>
                  <div class="text-muted small">Cliquez sur "Reçu" pour générer/imprimer/télécharger</div>
                </div>
                <div style="min-width: 240px;">
                  <label class="form-label mb-1">Filtrer</label>
                  <select class="form-select form-select-sm" id="paymentsStudentFilter">
                    ${filterSelect}
                  </select>
                </div>
              </div>
              <div class="table-responsive">
                <table class="table table-sm align-middle" id="paymentsTable">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Étudiant</th>
                      <th>Frais</th>
                      <th>Montant</th>
                      <th>Mode</th>
                      <th>Notes</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${rows || `<tr><td colspan="7">${renderTableEmpty("Aucun paiement enregistré.")}</td></tr>`}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const form = el("#paymentForm");
    const studentSel = el("#paymentStudentId");
    const feeTypeSel = el("#paymentFeeTypeId");
    const remainingLabel = el("#paymentRemainingLabel");

    const rebuildFeeTypeOptions = () => {
      const sid = String(studentSel.value || "");
      feeTypeSel.innerHTML = `<option value="">Sélectionner</option>`;
      remainingLabel.textContent = "-";
      if (!sid) return;

      const balances = computeStudentBalances(sid);
      const entries = Object.entries(balances.byFeeType)
        .map(([feeTypeId, info]) => ({ feeTypeId, remaining: info.remaining, expected: info.expected }))
        .filter((x) => x.remaining > 0)
        .sort((a, b) => b.remaining - a.remaining);

      if (!entries.length) {
        feeTypeSel.innerHTML = `<option value="">Aucun solde disponible</option>`;
        return;
      }

      feeTypeSel.innerHTML += entries
        .map((x) => {
          const ft = feeTypeById(x.feeTypeId);
          return `<option value="${x.feeTypeId}">${ft ? ft.name : x.feeTypeId} (Reste: ${money(x.remaining)})</option>`;
        })
        .join("");
    };

    const updateRemainingLabel = () => {
      const sid = String(studentSel.value || "");
      const fid = String(feeTypeSel.value || "");
      if (!sid || !fid) {
        remainingLabel.textContent = "-";
        return;
      }
      const balances = computeStudentBalances(sid);
      const rem = balances.byFeeType[fid]?.remaining ?? 0;
      remainingLabel.textContent = money(rem);
    };

    studentSel.addEventListener("change", () => {
      rebuildFeeTypeOptions();
      updateRemainingLabel();
    });
    feeTypeSel.addEventListener("change", updateRemainingLabel);

    rebuildFeeTypeOptions();
    updateRemainingLabel();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(form);

      const studentId = String(fd.get("studentId") || "");
      const feeTypeId = String(fd.get("feeTypeId") || "");
      const amount = safeNumber(fd.get("amount"));
      const date = String(fd.get("date") || "");
      const method = String(fd.get("method") || "");
      const notes = String(fd.get("notes") || "").trim();

      if (!studentId || !feeTypeId) {
        showAlert("danger", "Veuillez sélectionner un étudiant et un type de frais.");
        return;
      }
      if (!date) {
        showAlert("danger", "Veuillez renseigner une date.");
        return;
      }
      if (amount <= 0) {
        showAlert("danger", "Le montant doit être > 0.");
        return;
      }

      const balances = computeStudentBalances(studentId);
      const remaining = balances.byFeeType[feeTypeId]?.remaining ?? 0;
      if (remaining <= 0) {
        showAlert("danger", "Ce type de frais n’a pas de solde disponible pour l’étudiant.");
        return;
      }
      if (amount > remaining) {
        showAlert("danger", `Montant trop élevé. Solde disponible: ${money(remaining)}.`);
        return;
      }

      state.payments.push({
        id: uid(),
        studentId,
        feeTypeId,
        amount,
        date,
        method,
        notes,
      });

      persistState();
      showAlert("success", "Paiement enregistré.");
      form.reset();
      // re-init defaults
      el("input[name='date']").value = dateToISO(new Date());
      rebuildFeeTypeOptions();
      updateRemainingLabel();
      renderRoute();
    });

    // Filter payments table
    const filterSel = el("#paymentsStudentFilter");
    filterSel.addEventListener("change", () => {
      const sid = String(filterSel.value || "");
      document.querySelectorAll("#paymentsTable tbody tr").forEach((tr) => {
        const sName = tr.querySelector("div.fw-semibold")?.textContent || "";
        // best effort: use student id dataset not present; fallback filter by text includes student name
        if (!sid) {
          tr.style.display = "";
          return;
        }
        const s = studentById(sid);
        tr.style.display = s && sName === s.fullName ? "" : "none";
      });
    });

    // Receipt actions
    setAppContentClickHandler((e) => {
      const btn = e.target.closest("[data-action='openReceipt']");
      if (!btn) return;
      const paymentId = btn.getAttribute("data-id");
      if (!paymentId) return;
      try {
        const receipt = getOrCreateReceiptForPayment(paymentId);
        sessionStorage.setItem("edukaReceiptFocusId", receipt.id);
        navigate(routes.receipts);
        showAlert("success", `Reçu généré (${receipt.receiptNumber}).`);
      } catch (err) {
        showAlert("danger", String(err?.message || err));
      }
    });
  }

  // =======================
  // Pending View
  // =======================
  function renderPendingView() {
    setPageTitle("Paiements en attente", "Étudiants avec soldes impayés");
    el("#appSidebar").style.display = "";

    const classList = getClassList();
    const pending = getStudentsPending();

    const pendingRows = pending
      .map((x) => {
        return `
          <tr data-student-id="${x.student.id}">
            <td>${x.student.registrationNumber}</td>
            <td>
              <div class="fw-semibold">${x.student.fullName}</div>
              <div class="text-muted small">${x.student.parentName}</div>
            </td>
            <td>${x.student.className}</td>
            <td><b class="text-danger">${money(x.balances.totalRemaining)}</b></td>
          </tr>
        `;
      })
      .join("");

    el("#appContent").innerHTML = `
      <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div>
          <div class="fw-bold fs-5">Impays</div>
          <div class="text-muted small">Filtrer par classe et voir le total dû</div>
        </div>
        <a class="btn btn-primary" href="#payments">Enregistrer un paiement</a>
      </div>

      <div class="card shadow-sm mb-3">
        <div class="card-body">
          <div class="row g-2">
            <div class="col-12 col-md-6">
              <label class="form-label">Classe</label>
              <select class="form-select" id="pendingClassFilter">
                <option value="">Toutes les classes</option>
                ${classList.map((c) => `<option value="${c}">${c}</option>`).join("")}
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Total dû (filtrage)</label>
              <div class="fs-4 fw-bold text-danger" id="pendingTotalDue">-</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm align-middle" id="pendingTable">
              <thead>
                <tr>
                  <th>N° inscription</th>
                  <th>Étudiant</th>
                  <th>Classe</th>
                  <th>Total dû</th>
                </tr>
              </thead>
              <tbody>
                ${pendingRows || `<tr><td colspan="4">${renderTableEmpty("Aucun solde en attente.")}</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    const filterSel = el("#pendingClassFilter");
    const totalDueEl = el("#pendingTotalDue");

    const update = () => {
      const cls = String(filterSel.value || "");
      let total = 0;
      document.querySelectorAll("#pendingTable tbody tr").forEach((tr) => {
        const sid = tr.getAttribute("data-student-id");
        const s = studentById(sid);
        const balances = s ? computeStudentBalances(s.id) : null;
        const matches = !cls || s?.className === cls;
        tr.style.display = matches ? "" : "none";
        if (matches && balances) total += balances.totalRemaining;
      });
      totalDueEl.textContent = money(total);
    };

    filterSel.addEventListener("change", update);
    update();
  }

  // =======================
  // Receipts View
  // =======================
  function renderReceiptsView() {
    setPageTitle("Reçus", "Imprimer / télécharger des reçus générés");
    el("#appSidebar").style.display = "";

    const receipts = state.receipts
      .slice()
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    const focusId = sessionStorage.getItem("edukaReceiptFocusId");
    sessionStorage.removeItem("edukaReceiptFocusId");

    el("#appContent").innerHTML = `
      <div class="d-flex align-items-center justify-content-between gap-2 mb-3">
        <div>
          <div class="fw-bold fs-5">Reçus</div>
          <div class="text-muted small">Chaque paiement peut générer un reçu unique</div>
        </div>
        <a class="btn btn-outline-primary" href="#payments">Retour aux paiements</a>
      </div>

      <div class="card shadow-sm">
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-sm align-middle" id="receiptsTable">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Date</th>
                  <th>Étudiant</th>
                  <th>Frais</th>
                  <th>Montant</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${
                  receipts.length
                    ? receipts
                        .map((r) => {
                          const trId = `receiptRow_${r.id}`;
                          return `
                          <tr id="${trId}">
                            <td><b>${r.receiptNumber}</b></td>
                            <td>${formatDate(r.payment.date)}</td>
                            <td>
                              <div class="fw-semibold">${r.student.fullName}</div>
                              <div class="text-muted small">${r.student.className} • ${r.student.registrationNumber}</div>
                            </td>
                            <td>${r.feeType.name}</td>
                            <td><b>${money(r.payment.amount)}</b></td>
                            <td class="text-end">
                              <div class="d-flex justify-content-end gap-2 flex-wrap">
                                <button class="btn btn-sm btn-outline-primary" data-action="printReceipt" data-id="${r.id}">
                                  Imprimer
                                </button>
                                <button class="btn btn-sm btn-outline-secondary" data-action="downloadReceipt" data-id="${r.id}">
                                  Télécharger
                                </button>
                              </div>
                            </td>
                          </tr>
                        `;
                        })
                        .join("")
                    : `<tr><td colspan="6">${renderTableEmpty("Aucun reçu généré pour le moment.")}</td></tr>`
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    if (focusId) {
      setTimeout(() => {
        const row = document.getElementById(`receiptRow_${focusId}`);
        row?.scrollIntoView({ behavior: "smooth", block: "center" });
        if (row) {
          row.classList.add("table-primary");
          setTimeout(() => row.classList.remove("table-primary"), 1200);
        }
      }, 250);
    }

    setAppContentClickHandler((e) => {
      const btn = e.target.closest("[data-action]");
      if (!btn) return;
      const action = btn.getAttribute("data-action");
      const id = btn.getAttribute("data-id");
      const receipt = state.receipts.find((r) => r.id === id);
      if (!receipt) return;

      const html = buildReceiptHtml(receipt);

      if (action === "printReceipt") {
        const ok = openPrintWindow(html);
        if (!ok) showAlert("warning", "Popup bloquée: ouvrez une fenêtre pour imprimer.");
      }

      if (action === "downloadReceipt") {
        downloadTextFile(`recu_${receipt.receiptNumber}.html`, html, "text/html");
        showAlert("success", "Téléchargement démarré.");
      }
    });
  }

  function renderRoute() {
    const auth = getAuth();
    const routeHash = getRouteHash();

    const authed = auth && auth.loggedIn;

    if (!authed) {
      if (routeHash !== routes.login) window.location.hash = routes.login;
      renderLoginView();
      return;
    }

    if (routeHash === routes.login) {
      window.location.hash = routes.dashboard;
      return;
    }

    // Mark active in sidebar
    setActiveNav(routeHash);
    renderAuthedShell();

    if (routeHash === routes.dashboard) renderDashboardView();
    else if (routeHash === routes.students) renderStudentsView();
    else if (routeHash === routes.fees) renderFeesView();
    else if (routeHash === routes.payments) renderPaymentsView();
    else if (routeHash === routes.pending) renderPendingView();
    else if (routeHash === routes.receipts) renderReceiptsView();
    else renderDashboardView();
  }

  function initApp() {
    loadState();

    const auth = getAuth();
    if (auth?.loggedIn) renderAuthedShell();

    // Logout
    const logoutBtn = el("#btnLogout");
    logoutBtn?.addEventListener("click", () => {
      setAuth({ loggedIn: false });
      showAlert("success", "Déconnexion effectuée.");
      renderLoginView();
      window.location.hash = routes.login;
    });

    const logoutBtnMobile = el("#btnLogoutMobile");
    logoutBtnMobile?.addEventListener("click", () => {
      setAuth({ loggedIn: false });
      showAlert("success", "Déconnexion effectuée.");
      renderLoginView();
      window.location.hash = routes.login;
    });

    window.addEventListener("hashchange", () => {
      showGlobalSpinner(false);
      renderRoute();
    });

    // First render
    if (!window.location.hash) {
      window.location.hash = auth?.loggedIn ? routes.dashboard : routes.login;
    }
    renderRoute();
  }

  initApp();
})();

