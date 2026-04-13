// ============================================================
// Catálogo de formulários
// Para adicionar um novo form:
//   1. Crie o arquivo JSON em forms/ seguindo a estrutura existente.
//   2. Adicione uma entrada neste array com id, title, description e file.
// ============================================================
const FORM_CATALOG = [
  {
    id: "inspecao-codigo-s1",
    title: "Inspeção de Código — Semana 1",
    description: "Rastreio de código Java. Responda sem executar. Teste A/B habilitado.",
    respondEnabled: false,
    enabled: false,
    file: "forms/inspecao-codigo-s1.json"
  },
  {
    id: "inspecao-codigo-s2",
    title: "Inspeção de Código — Semana 2",
    description: "Compare alternativas de código e indique qual parece mais adequada para produção.",
    respondEnabled: false,
    enabled: false,
    file: "forms/inspecao-codigo-s2.json"
  },
  {
    id: "analise-1",
    title: "Análise de Código - 09/04/2026",
    description: "Avalie o código e dê uma nota de legibilidade entre 1 e 5 para o código.",
    respondEnabled: true,
    enabled: true,
    resultsEnabled: true,
    exportEnabled: true,
    file: "forms/analise-1.json"
  }
  // Exemplo de como adicionar um segundo form:
  // {
  //   id: "outro-form",
  //   title: "Novo Formulário",
  //   description: "Descrição do formulário.",
  //   file: "forms/outro-form.json"
  // }
];

// ============================================================
// Estado global
// ============================================================
const STORAGE_KEY = "if006.inspecao-codigo.progress";
const STORAGE_VERSION = 1;

const state = {
  currentView: "home",
  formMeta: null,
  form: null,           // JSON carregado do arquivo do formulário
  group: null,          // "A", "B" ou "default"
  pages: [],            // pages do grupo selecionado
  pageIndex: 0,
  questionIndex: 0,
  userData: { nome: "", email: "", cpfFinal: null },
  registrationDraft: { nome: "", email: "", cpfInput: "" },
  startedAt: null,
  timerInterval: null,
  timerStartMs: null,
  answers: [],
  draftAnswer: { questionId: null, value: "", confidence: "" }
  // Cada resposta: { pageId, pageTitle, questionId, label, questionType, value, timeSec, confidence }
};

// ============================================================
// Refs de DOM (preenchidas em initEls)
// ============================================================
const el = {};

function initEls() {
  [
    "home-card", "register-card", "quiz-card", "result-card",
    "form-list", "home-error", "home-resume",
    "register-title", "register-desc",
    "input-nome", "input-email", "cpf-field", "input-cpf", "group-preview",
    "register-btn", "register-back-btn", "register-error",
    "question-title", "group-badge", "progress", "page-description",
    "code-panel", "code-block", "question-area", "quiz-error",
    "result-headline", "result-table-body", "result-text",
    "copy-result-btn", "submit-sheets-btn", "restart-btn",
    "copy-feedback", "submit-feedback",
    "dashboard-card", "dashboard-title", "dashboard-meta",
    "dashboard-loading", "dashboard-error", "dashboard-charts",
    "dashboard-back-btn", "dashboard-nav", "dashboard-page-select",
    "dashboard-page-counter", "dashboard-prev-btn", "dashboard-next-btn",
    "dashboard-page-detail", "dashboard-page-title", "dashboard-page-description",
    "dashboard-page-code-panel", "dashboard-page-code",
    "dashboard-export-csv-btn", "dashboard-export-feedback",
    "dashboard-word-filter-question", "dashboard-word-filter-values", "dashboard-word-filter-clear", "dashboard-word-filter-meta",
    "dashboard-overview", "dashboard-overview-table-body",
    "dashboard-bar-slot", "dashboard-box-slot", "dashboard-word-slot", "dashboard-summary-slot"
  ].forEach(id => {
    el[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
  });
}

// ============================================================
// Utilitários
// ============================================================
function showView(name) {
  ["home-card", "register-card", "quiz-card", "result-card", "dashboard-card"].forEach(id => {
    document.getElementById(id).classList.add("hidden");
  });
  document.getElementById(name + "-card").classList.remove("hidden");
  state.currentView = name;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function isFormEnabled(meta) {
  return isRespondEnabled(meta);
}

function isRespondEnabled(meta) {
  if (typeof meta.respondEnabled === "boolean") {
    return meta.respondEnabled;
  }
  return meta.enabled !== false;
}

function isExportEnabled(meta) {
  return meta.exportEnabled === true;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function formatSavedAt(value) {
  if (!value) return "agora";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "recentemente";
  return date.toLocaleString("pt-BR");
}

function buildDraftAnswerForCurrentQuestion() {
  if (state.currentView !== "quiz" || !state.form || state.pageIndex >= state.pages.length) {
    return state.draftAnswer;
  }

  const question = currentQuestion();
  if (!question || question.type !== "open") {
    return { questionId: null, value: "", confidence: "" };
  }

  const input = document.getElementById("open-answer");
  const confidence = document.getElementById("confidence-select");
  return {
    questionId: question.id,
    value: input ? input.value : state.draftAnswer.value,
    confidence: confidence ? confidence.value : state.draftAnswer.confidence
  };
}

function syncRegisterDraftFromDom() {
  if (state.currentView !== "register") return;
  state.registrationDraft = {
    nome: el.inputNome.value,
    email: el.inputEmail.value,
    cpfInput: el.inputCpf.value
  };
}

function buildProgressSnapshot() {
  syncRegisterDraftFromDom();
  state.draftAnswer = buildDraftAnswerForCurrentQuestion();

  return {
    version: STORAGE_VERSION,
    savedAt: new Date().toISOString(),
    view: state.currentView,
    formId: state.formMeta ? state.formMeta.id : null,
    group: state.group,
    pageIndex: state.pageIndex,
    questionIndex: state.questionIndex,
    userData: state.userData,
    registrationDraft: state.registrationDraft,
    startedAt: state.startedAt ? state.startedAt.toISOString() : null,
    answers: state.answers,
    draftAnswer: state.draftAnswer
  };
}

function saveProgress() {
  if (!state.formMeta) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(buildProgressSnapshot()));
  } catch {
    // Se o localStorage estiver indisponível, o fluxo segue sem persistência.
  }
}

function loadSavedProgress() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== STORAGE_VERSION || !parsed.formId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function clearSavedProgress() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nada a fazer.
  }
}

function resetState() {
  stopTimer();
  Object.assign(state, {
    currentView: "home",
    formMeta: null,
    form: null,
    group: null,
    pages: [],
    pageIndex: 0,
    questionIndex: 0,
    userData: { nome: "", email: "", cpfFinal: null },
    registrationDraft: { nome: "", email: "", cpfInput: "" },
    startedAt: null,
    timerStartMs: null,
    answers: [],
    draftAnswer: { questionId: null, value: "", confidence: "" }
  });
}

async function fetchFormDefinition(meta) {
  const res = await fetch(meta.file);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function renderResumeBox() {
  const saved = loadSavedProgress();
  if (!saved) {
    el.homeResume.classList.add("hidden");
    el.homeResume.innerHTML = "";
    return;
  }

  const meta = FORM_CATALOG.find(item => item.id === saved.formId);
  if (!meta) {
    clearSavedProgress();
    el.homeResume.classList.add("hidden");
    el.homeResume.innerHTML = "";
    return;
  }

  const enabled = isFormEnabled(meta);
  const actionButtons = enabled
    ? `
      <div class="resume-actions">
        <button id="resume-progress-btn" type="button">Continuar de onde parei</button>
        <button id="discard-progress-btn" type="button" class="btn-secondary">Descartar progresso salvo</button>
      </div>
    `
    : `
      <div class="resume-actions">
        <button id="discard-progress-btn" type="button" class="btn-secondary">Remover progresso salvo</button>
      </div>
    `;

  el.homeResume.innerHTML = `
    <div class="resume-box">
      <p>
        <strong>Há um progresso salvo</strong><br>
        Formulário: ${escapeHtml(meta.title)}<br>
        Último salvamento: ${escapeHtml(formatSavedAt(saved.savedAt))}
      </p>
      <p class="muted">${enabled
        ? "Você pode retomar a atividade no ponto em que saiu."
        : "O formulário salvo está desabilitado no momento. O progresso continua visível, mas não pode ser retomado."}</p>
      ${actionButtons}
    </div>
  `;
  el.homeResume.classList.remove("hidden");

  if (enabled) {
    document.getElementById("resume-progress-btn").addEventListener("click", resumeSavedProgress);
  }
  document.getElementById("discard-progress-btn").addEventListener("click", discardSavedProgress);
}

async function resumeSavedProgress() {
  el.homeError.textContent = "";
  const saved = loadSavedProgress();
  if (!saved) {
    renderHome();
    return;
  }

  const meta = FORM_CATALOG.find(item => item.id === saved.formId);
  if (!meta || !isFormEnabled(meta)) {
    renderHome();
    return;
  }

  try {
    const form = await fetchFormDefinition(meta);
    const registrationDraft = saved.registrationDraft || {};
    const userData = saved.userData || {};
    const group = typeof saved.group === "string" ? saved.group : null;
    const pages = group && form.groups[group] ? form.groups[group] : [];

    state.formMeta = meta;
    state.form = form;
    state.group = group;
    state.pages = pages;
    state.userData = {
      nome: userData.nome || "",
      email: userData.email || "",
      cpfFinal: userData.cpfFinal ?? null
    };
    state.registrationDraft = {
      nome: registrationDraft.nome ?? state.userData.nome,
      email: registrationDraft.email ?? state.userData.email,
      cpfInput: registrationDraft.cpfInput ?? (state.userData.cpfFinal ?? "")
    };
    state.startedAt = saved.startedAt ? new Date(saved.startedAt) : null;
    state.answers = Array.isArray(saved.answers) ? saved.answers : [];
    state.draftAnswer = saved.draftAnswer || { questionId: null, value: "", confidence: "" };

    if (saved.view === "quiz" && pages.length > 0) {
      state.pageIndex = clamp(saved.pageIndex || 0, 0, pages.length - 1);
      const questions = pages[state.pageIndex].questions || [];
      state.questionIndex = clamp(saved.questionIndex || 0, 0, Math.max(questions.length - 1, 0));
      showView("quiz");
      renderCurrentQuestion();
      return;
    }

    if (saved.view === "result" && state.answers.length > 0) {
      state.pageIndex = pages.length > 0 ? pages.length - 1 : 0;
      state.questionIndex = 0;
      showResults();
      return;
    }

    state.pageIndex = 0;
    state.questionIndex = 0;
    showRegister();
  } catch {
    el.homeError.textContent =
      "Não foi possível restaurar o progresso salvo. Verifique se o arquivo do formulário continua disponível.";
  }
}

function discardSavedProgress() {
  clearSavedProgress();
  resetState();
  renderHome();
}

function prepareFormState(meta, form) {
  stopTimer();
  state.formMeta = meta;
  state.form = form;
  state.group = null;
  state.pages = [];
  state.pageIndex = 0;
  state.questionIndex = 0;
  state.userData = { nome: "", email: "", cpfFinal: null };
  state.registrationDraft = { nome: "", email: "", cpfInput: "" };
  state.startedAt = null;
  state.answers = [];
  state.draftAnswer = { questionId: null, value: "", confidence: "" };
  state.timerStartMs = null;
}

// ============================================================
// Tela 1 — Seleção do formulário
// ============================================================
function renderHome() {
  el.homeError.textContent = "";
  el.formList.innerHTML = "";
  renderResumeBox();

  if (FORM_CATALOG.length === 0) {
    el.formList.innerHTML = '<p class="muted">Nenhum formulário disponível.</p>';
    showView("home");
    return;
  }

  FORM_CATALOG.forEach(meta => {
    const respondEnabled = isRespondEnabled(meta);
    const hasResults = meta.resultsEnabled === true;
    const canExport  = hasResults && isExportEnabled(meta);
    const div = document.createElement("div");
    div.className = `form-card${respondEnabled ? "" : " is-disabled"}`;
    div.innerHTML = `
      <div class="form-card-info">
        <strong>${escapeHtml(meta.title)}</strong>
        <p class="muted">${escapeHtml(meta.description)}</p>
        <div class="form-card-status${respondEnabled ? "" : " is-disabled"}">${respondEnabled ? "Disponível" : (meta.disabledLabel || "Desabilitado")}</div>
      </div>
      <div class="form-card-actions">
        <button type="button" class="btn-respond" ${respondEnabled ? "" : "disabled aria-disabled=\"true\""}>${respondEnabled ? "Responder" : "Indisponível"}</button>
        ${hasResults ? '<button type="button" class="btn-results btn-secondary">Ver resultados</button>' : ""}
        ${canExport ? '<button type="button" class="btn-export-all btn-secondary">Exportar (ZIP)</button>' : ""}
        ${canExport ? '<p class="muted export-feedback" style="margin:0" aria-live="polite"></p>' : ""}
      </div>
    `;
    if (respondEnabled) {
      div.querySelector(".btn-respond").addEventListener("click", () => selectForm(meta));
    }
    if (hasResults) {
      div.querySelector(".btn-results").addEventListener("click", () => openDashboard(meta));
      if (canExport) {
        const exportBtn = div.querySelector(".btn-export-all");
        const exportFeedback = div.querySelector(".export-feedback");
        exportBtn.addEventListener("click", () => {
          exportResultsPackageFromHome(meta, exportBtn, exportFeedback);
        });
      }
    }
    el.formList.appendChild(div);
  });

  showView("home");
}

async function selectForm(meta) {
  if (!isFormEnabled(meta)) return;
  el.homeError.textContent = "";
  try {
    const form = await fetchFormDefinition(meta);
    prepareFormState(meta, form);
    showRegister();
  } catch {
    el.homeError.textContent =
      "Não foi possível carregar o formulário. Verifique se o servidor está rodando e o arquivo existe.";
  }
}

// ============================================================
// Tela 2 — Identificação
// ============================================================
function showRegister() {
  const form = state.form;
  el.registerTitle.textContent = form.title;
  el.registerDesc.textContent = form.description || "";
  el.inputNome.value = state.registrationDraft.nome || state.userData.nome || "";
  el.inputEmail.value = state.registrationDraft.email || state.userData.email || "";
  el.inputCpf.value = state.registrationDraft.cpfInput || "";
  el.registerError.textContent = "";

  if (form.hasAbTest) {
    el.cpfField.classList.remove("hidden");
  } else {
    el.cpfField.classList.add("hidden");
  }

  updateGroupPreview();
  showView("register");
  saveProgress();
}

function updateGroupPreview() {
  const raw = el.inputCpf.value.trim();
  if (raw === "") {
    el.groupPreview.textContent = "Grupo será definido automaticamente: par = A, ímpar = B.";
    return;
  }
  const digit = Number(raw);
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    el.groupPreview.textContent = "Digite um número válido de 0 a 9.";
    return;
  }
  el.groupPreview.textContent =
    `Com final ${digit}, você irá para o Grupo ${digit % 2 === 0 ? "A" : "B"}.`;
}

function validateAndStartQuiz() {
  const nome  = el.inputNome.value.trim();
  const email = el.inputEmail.value.trim();
  const form  = state.form;

  if (!nome) {
    el.registerError.textContent = "Informe seu nome completo.";
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    el.registerError.textContent = "Informe um e-mail válido.";
    return;
  }

  let group    = "default";
  let cpfFinal = null;

  if (form.hasAbTest) {
    const raw   = el.inputCpf.value.trim();
    const digit = Number(raw);
    if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
      el.registerError.textContent = "Informe o último dígito do CPF (0 a 9).";
      return;
    }
    cpfFinal = digit;
    group    = digit % 2 === 0 ? "A" : "B";
  }

  state.userData   = { nome, email, cpfFinal };
  state.registrationDraft = { nome, email, cpfInput: el.inputCpf.value.trim() };
  state.group      = group;
  state.pages      = form.groups[group];
  state.pageIndex  = 0;
  state.questionIndex = 0;
  state.answers    = [];
  state.startedAt  = new Date();
  state.draftAnswer = { questionId: null, value: "", confidence: "" };

  el.registerError.textContent = "";
  showView("quiz");
  saveProgress();
  renderCurrentQuestion();
}

// ============================================================
// Tela 3 — Quiz
// ============================================================
function currentPage()     { return state.pages[state.pageIndex]; }
function currentQuestion() { return currentPage().questions[state.questionIndex]; }

function renderCurrentQuestion() {
  stopTimer();
  el.quizError.textContent = "";

  const page     = currentPage();
  const question = currentQuestion();
  const total    = state.pages.length;

  el.questionTitle.textContent = page.title;
  el.progress.textContent      = `Página ${state.pageIndex + 1} de ${total}`;

  // Descrição da página (opcional)
  if (page.description) {
    el.pageDescription.textContent = page.description;
    el.pageDescription.classList.remove("hidden");
  } else {
    el.pageDescription.classList.add("hidden");
  }

  // Código (opcional)
  if (page.code) {
    el.codeBlock.textContent = page.code;
    el.codeBlock.removeAttribute("data-highlighted");
    hljs.highlightElement(el.codeBlock);
    el.codePanel.classList.remove("hidden");
  } else {
    el.codePanel.classList.add("hidden");
  }

  // Badge do grupo
  if (state.form.hasAbTest) {
    el.groupBadge.textContent = `Grupo ${state.group}`;
    el.groupBadge.classList.remove("hidden");
  } else {
    el.groupBadge.classList.add("hidden");
  }

  // Renderiza a questão
  el.questionArea.innerHTML = "";
  if (question.type === "open") {
    renderOpenQuestion(question);
  } else if (question.type === "multiple-choice") {
    renderMultipleChoiceQuestion(question);
  }

  saveProgress();
}

function renderOpenQuestion(q) {
  const hasTimer      = q.hasTimer === true;
  const hasConfidence = q.confidenceScale === true;
  const wrapper       = document.createElement("div");
  wrapper.className   = "question-wrapper";

  const h3 = document.createElement("h3");
  h3.textContent = q.label;
  wrapper.appendChild(h3);

  if (hasTimer) {
    const timerP = document.createElement("p");
    timerP.className = "timer";
    timerP.style.display = "none";
    timerP.innerHTML = `Tempo: <strong id="live-timer">0.0s</strong>`;
    wrapper.appendChild(timerP);
  }

  const input = document.createElement("input");
  input.type        = "text";
  input.id          = "open-answer";
  input.placeholder = q.placeholder || "Digite sua resposta";
  if (state.draftAnswer.questionId === q.id) {
    input.value = state.draftAnswer.value || "";
  }
  input.addEventListener("input", () => {
    state.draftAnswer = {
      questionId: q.id,
      value: input.value,
      confidence: state.draftAnswer.questionId === q.id ? state.draftAnswer.confidence : ""
    };
    saveProgress();
  });
  wrapper.appendChild(input);

  if (hasConfidence) {
    const confLabel = document.createElement("label");
    confLabel.setAttribute("for", "confidence-select");
    confLabel.textContent = "Confiança na resposta (1 a 5)";
    wrapper.appendChild(confLabel);

    const select = document.createElement("select");
    select.id = "confidence-select";
    select.innerHTML = `
      <option value="">Selecione</option>
      <option value="1">1 – Chutei</option>
      <option value="2">2 – Baixa confiança</option>
      <option value="3">3 – Média confiança</option>
      <option value="4">4 – Boa confiança</option>
      <option value="5">5 – Certeza</option>
    `;
    if (state.draftAnswer.questionId === q.id && state.draftAnswer.confidence) {
      select.value = state.draftAnswer.confidence;
    }
    select.addEventListener("change", () => {
      state.draftAnswer = {
        questionId: q.id,
        value: input.value,
        confidence: select.value
      };
      saveProgress();
    });
    wrapper.appendChild(select);
  }

  const btn = document.createElement("button");
  btn.type        = "button";
  btn.textContent = "Confirmar resposta";
  btn.addEventListener("click", () => confirmOpenAnswer(q, hasTimer, hasConfidence));
  wrapper.appendChild(btn);

  el.questionArea.appendChild(wrapper);

  if (hasTimer) startTimer();
  input.focus();
}

function renderMultipleChoiceQuestion(q) {
  const wrapper     = document.createElement("div");
  wrapper.className = "question-wrapper";

  const h3 = document.createElement("h3");
  h3.textContent = q.label;
  wrapper.appendChild(h3);

  const optRow     = document.createElement("div");
  optRow.className = "options-row";

  q.options.forEach(opt => {
    const btn       = document.createElement("button");
    btn.type        = "button";
    btn.className   = "btn-option";
    btn.textContent = opt;
    btn.addEventListener("click", () => confirmMultipleChoice(q, opt));
    optRow.appendChild(btn);
  });

  wrapper.appendChild(optRow);
  el.questionArea.appendChild(wrapper);
}

// -------- confirmações --------

function confirmOpenAnswer(q, hasTimer, hasConfidence) {
  const input = document.getElementById("open-answer");
  const value = input ? input.value.trim() : "";

  if (!value) {
    el.quizError.textContent = "Digite sua resposta antes de continuar.";
    return;
  }

  let timeSec = null;
  if (hasTimer && state.timerStartMs !== null) {
    timeSec = Number(((Date.now() - state.timerStartMs) / 1000).toFixed(2));
  }
  stopTimer();

  let confidence = null;
  if (hasConfidence) {
    const sel = document.getElementById("confidence-select");
    if (!sel || !sel.value) {
      el.quizError.textContent = "Informe seu nível de confiança antes de continuar.";
      return;
    }
    confidence = Number(sel.value);
  }

  recordAnswer(q, value, timeSec, confidence);
  state.draftAnswer = { questionId: null, value: "", confidence: "" };
  el.quizError.textContent = "";
  advanceQuiz();
}

function confirmMultipleChoice(q, value) {
  recordAnswer(q, value, null, null);
  state.draftAnswer = { questionId: null, value: "", confidence: "" };
  el.quizError.textContent = "";
  advanceQuiz();
}

function recordAnswer(q, value, timeSec, confidence) {
  const page = currentPage();
  state.answers.push({
    pageId: page.id,
    pageTitle: page.title,
    questionId: q.id,
    label: q.label,
    questionType: q.type,
    value,
    timeSec,
    confidence
  });
}

function advanceQuiz() {
  state.questionIndex += 1;
  if (state.questionIndex >= currentPage().questions.length) {
    state.pageIndex    += 1;
    state.questionIndex = 0;
  }
  if (state.pageIndex >= state.pages.length) {
    showResults();
    return;
  }
  saveProgress();
  renderCurrentQuestion();
}

// ============================================================
// Temporizador
// ============================================================
function startTimer() {
  state.timerStartMs = Date.now();
  state.timerInterval = setInterval(() => {}, 100);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// ============================================================
// Tela 4 — Resultados
// ============================================================
function showResults() {
  stopTimer();
  el.copyFeedback.textContent   = "";
  el.submitFeedback.textContent = "";

  const { nome } = state.userData;
  const timed    = state.answers.filter(a => a.timeSec !== null);
  const total    = timed.reduce((s, a) => s + a.timeSec, 0);

  let headline = nome;
  if (state.form.hasAbTest)  headline += ` — Grupo ${state.group}`;
  if (timed.length > 0)      headline += ` — Tempo total: ${total.toFixed(2)}s`;
  el.resultHeadline.textContent = headline;

  el.resultTableBody.innerHTML = "";
  state.answers.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${escapeHtml(row.pageTitle)}</td>
      <td>${escapeHtml(truncate(row.label, 50))}</td>
      <td>${escapeHtml(String(row.value))}</td>
      <td>${row.timeSec   !== null ? row.timeSec.toFixed(2) : "—"}</td>
      <td>${row.confidence !== null ? row.confidence        : "—"}</td>
    `;
    el.resultTableBody.appendChild(tr);
  });

  el.resultText.value = buildResultText();
  showView("result");
  saveProgress();
}

function buildResultText() {
  const { nome, email, cpfFinal } = state.userData;
  const lines = [
    `formulario: ${state.form.id}`,
    `nome: ${nome}`,
    `email: ${email}`,
    `grupo: ${state.group}`
  ];
  if (cpfFinal !== null) lines.push(`cpf_final: ${cpfFinal}`);
  lines.push(`inicio: ${state.startedAt.toISOString()}`);

  state.answers.forEach((row, idx) => {
    const n = idx + 1;
    lines.push(`q${n}_id: ${row.questionId}`);
    lines.push(`q${n}_resposta: ${row.value}`);
    if (row.timeSec   !== null) lines.push(`q${n}_tempo_s: ${row.timeSec}`);
    if (row.confidence !== null) lines.push(`q${n}_confianca: ${row.confidence}`);
  });

  return lines.join("\n");
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(el.resultText.value);
    el.copyFeedback.textContent = "Resumo copiado para a área de transferência.";
  } catch {
    el.copyFeedback.textContent =
      "Não foi possível copiar automaticamente. Selecione e copie o texto manualmente.";
  }
}

// ============================================================
// Envio para Google Sheets
// ============================================================
async function submitToSheets() {
  const apiUrl = state.form.sheetsApiUrl;
  if (!apiUrl) {
    el.submitFeedback.textContent =
      "URL da planilha não configurada. Edite 'sheetsApiUrl' no JSON do formulário.";
    return;
  }

  el.submitSheetsBtn.disabled    = true;
  el.submitSheetsBtn.textContent = "Enviando…";
  el.submitFeedback.textContent  = "";

  const payload = {
    formId:    state.form.id,
    nome:      state.userData.nome,
    email:     state.userData.email,
    cpfFinal:  state.userData.cpfFinal,
    grupo:     state.group,
    timestamp: state.startedAt.toISOString(),
    answers:   state.answers.map(a => ({
      questionId: a.questionId,
      pageId:     a.pageId,
      type:       a.questionType,
      value:      a.value,
      timeSec:    a.timeSec,
      confidence: a.confidence
    }))
  };

  try {
    // Content-Type: text/plain evita preflight CORS (request simples),
    // e o Apps Script ainda recebe o JSON via e.postData.contents.
    await fetch(apiUrl, {
      method:  "POST",
      mode:    "no-cors",
      headers: { "Content-Type": "text/plain" },
      body:    JSON.stringify(payload)
    });
    el.submitFeedback.textContent =
      "Resposta enviada. Verifique a planilha para confirmar o recebimento.";
  } catch {
    el.submitFeedback.textContent =
      "Erro de rede ao enviar. Copie o resumo acima e entregue manualmente.";
  } finally {
    el.submitSheetsBtn.disabled    = false;
    el.submitSheetsBtn.textContent = "Enviar para planilha";
  }
}

// ============================================================
// Dashboard de resultados
// ============================================================

const dashCharts = [];
const dashboardState = {
  pages: [],
  currentIndex: 0,
  overviewRows: [],
  sortKey: "questionId",
  sortDir: "asc",
  formDefinition: null,
  submissions: [],
  packageExportEnabled: false,
  wordFilter: {
    questionId: "",
    values: []
  }
};

async function openDashboard(meta) {
  el.dashboardError.textContent  = "";
  el.dashboardMeta.textContent   = "";
  el.dashboardLoading.classList.remove("hidden");
  el.dashboardNav.classList.add("hidden");
  el.dashboardPageDetail.classList.add("hidden");
  el.dashboardOverview.classList.add("hidden");
  el.dashboardCharts.classList.add("hidden");
  el.dashboardExportFeedback.textContent = "";
  el.dashboardWordFilterMeta.textContent = "";
  el.dashboardTitle.textContent  = meta.title;
  showView("dashboard");

  try {
    const form   = await fetchFormDefinition(meta);
    const apiUrl = form.sheetsApiUrl;

    if (!apiUrl) {
      el.dashboardError.textContent = "URL da planilha não configurada neste formulário.";
      el.dashboardLoading.classList.add("hidden");
      return;
    }

    const dataUrl = `${apiUrl}?action=data&formId=${encodeURIComponent(form.id)}`;
    const res     = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const payload = await res.json();

    if (payload.status !== "ok") {
      throw new Error(payload.message || "Resposta inesperada do servidor.");
    }

    const scoringContext = buildScoringContext(form);
    dashboardState.pages = buildDashboardPagesFromFormAndResponses(
      form,
      payload.questions || [],
      scoringContext,
      payload.submissions || []
    );
    dashboardState.formDefinition = form;
    dashboardState.submissions = Array.isArray(payload.submissions) ? payload.submissions : [];
    dashboardState.packageExportEnabled = isExportEnabled(meta);
    dashboardState.overviewRows = buildOverviewRows(dashboardState.pages);
    dashboardState.currentIndex = 0;
    dashboardState.sortKey = "questionId";
    dashboardState.sortDir = "asc";
    dashboardState.wordFilter = { questionId: "", values: [] };

    el.dashboardMeta.textContent = `${payload.totalResponses} resposta(s) coletada(s)`;
    el.dashboardLoading.classList.add("hidden");

    if (dashboardState.pages.length === 0) {
      el.dashboardError.textContent = "Sem páginas disponíveis para visualização.";
      return;
    }

    renderDashboardPageOptions();
    renderDashboardCurrentPage();

    el.dashboardNav.classList.remove("hidden");
  } catch (err) {
    el.dashboardLoading.classList.add("hidden");
    el.dashboardError.textContent = `Não foi possível carregar os dados: ${err.message}`;
  }
}

function renderDashboardPageOptions() {
  el.dashboardPageSelect.innerHTML = "";

  const overview = document.createElement("option");
  overview.value = "0";
  overview.textContent = "Resumo geral — todas as questões";
  el.dashboardPageSelect.appendChild(overview);

  dashboardState.pages.forEach((page, idx) => {
    const opt = document.createElement("option");
    opt.value = String(idx + 1);
    opt.textContent = `${page.pageId} — ${page.title || "Sem título"}`;
    el.dashboardPageSelect.appendChild(opt);
  });
}

function renderDashboardCurrentPage() {
  const totalItems = dashboardState.pages.length + 1;
  if (totalItems <= 0) return;

  el.dashboardPageSelect.value = String(dashboardState.currentIndex);
  el.dashboardPageCounter.textContent =
    `${dashboardState.currentIndex + 1} de ${totalItems}`;
  el.dashboardPrevBtn.disabled = dashboardState.currentIndex === 0;
  el.dashboardNextBtn.disabled = dashboardState.currentIndex === totalItems - 1;

  if (dashboardState.currentIndex === 0) {
    destroyDashCharts();
    el.dashboardOverview.classList.remove("hidden");
    el.dashboardPageDetail.classList.add("hidden");
    el.dashboardCharts.classList.add("hidden");
    renderDashboardOverviewTable();
    return;
  }

  const page = dashboardState.pages[dashboardState.currentIndex - 1];
  if (!page) return;

  el.dashboardOverview.classList.add("hidden");
  el.dashboardPageDetail.classList.remove("hidden");
  el.dashboardCharts.classList.remove("hidden");

  el.dashboardPageTitle.textContent = `Página ${page.pageId} — ${page.title || "Sem título"}`;
  el.dashboardPageDescription.textContent = page.description || "Sem descrição.";

  if (page.code) {
    el.dashboardPageCodePanel.classList.remove("hidden");
    el.dashboardPageCode.textContent = page.code;
    el.dashboardPageCode.removeAttribute("data-highlighted");
    hljs.highlightElement(el.dashboardPageCode);
  } else {
    el.dashboardPageCodePanel.classList.add("hidden");
    el.dashboardPageCode.textContent = "";
  }

  destroyDashCharts();
  renderBarChartForPage(page, el.dashboardBarSlot);
  renderBoxPlotForPage(page, el.dashboardBoxSlot);
  renderSummaryForPage(page, el.dashboardSummarySlot);
  renderWordFilterControlsForPage(page);
  renderWordCloudForPage(page, el.dashboardWordSlot);
}

function changeDashboardPage(delta) {
  const totalItems = dashboardState.pages.length + 1;
  if (totalItems === 0) return;
  const next = clamp(dashboardState.currentIndex + delta, 0, totalItems - 1);
  if (next === dashboardState.currentIndex) return;
  dashboardState.currentIndex = next;
  renderDashboardCurrentPage();
}

function onDashboardSelectChange() {
  const idx = Number(el.dashboardPageSelect.value);
  if (!Number.isInteger(idx)) return;
  dashboardState.currentIndex = clamp(idx, 0, Math.max(dashboardState.pages.length, 0));
  renderDashboardCurrentPage();
}

function buildOverviewRows(pages) {
  return (pages || []).map(page => {
    const stats = computeSummaryStats(page.numericScores || []);
    const totalResponses = (page.opiniao || []).length;
    const mappedResponses = (page.numericScores || []).length;
    const unmappedResponses = Math.max(totalResponses - mappedResponses, 0);

    return {
      questionId: page.opiniaoQuestionId || `${page.pageId}_opiniao`,
      pageId: page.pageId,
      totalResponses,
      mappedResponses,
      unmappedResponses,
      mean: stats ? stats.mean : null,
      median: stats ? stats.median : null,
      q1: stats ? stats.q1 : null,
      q3: stats ? stats.q3 : null,
      min: stats ? stats.min : null,
      max: stats ? stats.max : null,
      stdDev: stats ? stats.stdDev : null
    };
  });
}

function compareOverviewValues(a, b, key) {
  const va = a[key];
  const vb = b[key];

  if (typeof va === "number" || typeof vb === "number" || va === null || vb === null) {
    const na = va === null || va === undefined ? Number.NEGATIVE_INFINITY : Number(va);
    const nb = vb === null || vb === undefined ? Number.NEGATIVE_INFINITY : Number(vb);
    if (na === nb) return 0;
    return na < nb ? -1 : 1;
  }

  return String(va || "").localeCompare(String(vb || ""), "pt-BR", { numeric: true });
}

function formatMetricOrDash(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  return formatNumberPtBr(value);
}

function updateSortButtonsUi() {
  if (!el.dashboardOverview) return;

  el.dashboardOverview.querySelectorAll(".sort-btn[data-sort-key]").forEach(btn => {
    const key = btn.dataset.sortKey;
    const baseLabel = btn.textContent.replace(/\s*[▲▼]$/, "");
    btn.textContent = key === dashboardState.sortKey
      ? `${baseLabel} ${dashboardState.sortDir === "asc" ? "▲" : "▼"}`
      : baseLabel;
  });
}

function renderDashboardOverviewTable() {
  const rows = getSortedOverviewRows();

  if (rows.length === 0) {
    el.dashboardOverviewTableBody.innerHTML = '<tr><td colspan="12" class="muted">Sem dados para sumarização.</td></tr>';
    updateSortButtonsUi();
    return;
  }

  el.dashboardOverviewTableBody.innerHTML = rows.map(row => `
    <tr>
      <td>${escapeHtml(row.questionId)}</td>
      <td>${escapeHtml(row.pageId)}</td>
      <td>${row.totalResponses}</td>
      <td>${row.mappedResponses}</td>
      <td>${row.unmappedResponses}</td>
      <td>${formatMetricOrDash(row.mean)}</td>
      <td>${formatMetricOrDash(row.median)}</td>
      <td>${formatMetricOrDash(row.q1)}</td>
      <td>${formatMetricOrDash(row.q3)}</td>
      <td>${formatMetricOrDash(row.min)}</td>
      <td>${formatMetricOrDash(row.max)}</td>
      <td>${formatMetricOrDash(row.stdDev)}</td>
    </tr>
  `).join("");

  updateSortButtonsUi();
}

function getSortedOverviewRows() {
  return [...dashboardState.overviewRows].sort((a, b) => {
    const cmp = compareOverviewValues(a, b, dashboardState.sortKey);
    return dashboardState.sortDir === "asc" ? cmp : -cmp;
  });
}

function exportDashboardOverviewCsv() {
  const rows = getSortedOverviewRows();

  if (rows.length === 0) {
    el.dashboardExportFeedback.textContent = "Não há dados para exportar.";
    return;
  }

  const headers = [
    "questao",
    "pagina",
    "respostas",
    "numericas",
    "sem_mapeamento",
    "media",
    "mediana",
    "q1",
    "q3",
    "minimo",
    "maximo",
    "desvio_padrao"
  ];

  const escapeCsv = (value) => {
    const text = String(value ?? "");
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers.join(",")];
  rows.forEach(row => {
    lines.push([
      row.questionId,
      row.pageId,
      row.totalResponses,
      row.mappedResponses,
      row.unmappedResponses,
      row.mean ?? "",
      row.median ?? "",
      row.q1 ?? "",
      row.q3 ?? "",
      row.min ?? "",
      row.max ?? "",
      row.stdDev ?? ""
    ].map(escapeCsv).join(","));
  });

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");

  link.href = url;
  link.download = `resumo-geral-${stamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  el.dashboardExportFeedback.textContent = "CSV exportado com sucesso.";
}

function slugifyFileName(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "arquivo";
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

async function exportResultsPackageFromHome(meta, buttonEl, feedbackEl) {
  if (!isExportEnabled(meta)) {
    feedbackEl.textContent = "Exportação desabilitada para este formulário.";
    return;
  }

  const originalText = buttonEl.textContent;
  buttonEl.disabled = true;
  buttonEl.textContent = "Gerando ZIP...";
  feedbackEl.textContent = "";

  try {
    const form = await fetchFormDefinition(meta);
    const apiUrl = form.sheetsApiUrl;

    if (!apiUrl) {
      feedbackEl.textContent = "URL da planilha não configurada neste formulário.";
      return;
    }

    const dataUrl = `${apiUrl}?action=data&formId=${encodeURIComponent(form.id)}`;
    const res = await fetch(dataUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    if (payload.status !== "ok") {
      throw new Error(payload.message || "Resposta inesperada do servidor.");
    }

    await exportResultsPackageZip({
      packageExportEnabled: isExportEnabled(meta),
      formDefinition: form,
      submissions: Array.isArray(payload.submissions) ? payload.submissions : [],
      feedbackEl
    });
  } catch (err) {
    feedbackEl.textContent = `Não foi possível exportar o pacote: ${err.message}`;
  } finally {
    buttonEl.disabled = false;
    buttonEl.textContent = originalText;
  }
}

function getUniquePagesFromForm(form) {
  const pages = [];
  const seen = new Set();

  Object.values(form.groups || {}).forEach(groupPages => {
    (groupPages || []).forEach(page => {
      if (!page || !page.id || seen.has(page.id)) return;
      seen.add(page.id);
      pages.push(page);
    });
  });

  return pages.sort((a, b) => String(a.id).localeCompare(String(b.id), "pt-BR", { numeric: true }));
}

function getQuestionDefinitionsFromForm(form, pages) {
  const questions = [];

  pages.forEach(page => {
    (page.questions || []).forEach(question => {
      if (!question || !question.id) return;
      questions.push({
        questionId: question.id,
        pageId: page.id,
        pageTitle: page.title || "",
        type: question.type || "",
        label: question.label || "",
        options: Array.isArray(question.options) ? question.options.join(" | ") : ""
      });
    });
  });

  return questions.sort((a, b) => a.questionId.localeCompare(b.questionId, "pt-BR", { numeric: true }));
}

async function exportResultsPackageZip(options = {}) {
  const feedbackEl = options.feedbackEl || el.dashboardPackageFeedback;
  const setFeedback = (message) => {
    if (feedbackEl) feedbackEl.textContent = message;
  };

  const packageExportEnabled = options.packageExportEnabled ?? dashboardState.packageExportEnabled;
  if (!packageExportEnabled) {
    setFeedback("Exportação de pacote está desabilitada neste formulário.");
    return;
  }

  if (typeof JSZip === "undefined") {
    setFeedback("Biblioteca de ZIP indisponível. Recarregue a página e tente novamente.");
    return;
  }

  const form = options.formDefinition || dashboardState.formDefinition;
  if (!form) {
    setFeedback("Dados do formulário não disponíveis para exportação.");
    return;
  }

  const pages = getUniquePagesFromForm(form);
  const questions = getQuestionDefinitionsFromForm(form, pages);
  const questionIds = questions.map(q => q.questionId);
  const submissions = Array.isArray(options.submissions) ? options.submissions : (dashboardState.submissions || []);

  const zip = new JSZip();

  // Snippets
  pages.forEach(page => {
    const baseName = `${String(page.id)}-${slugifyFileName(page.title || "snippet")}`;
    if (page.code && String(page.code).trim() !== "") {
      zip.file(`snippets/${baseName}.java`, String(page.code));
    } else {
      zip.file(`snippets/${baseName}.txt`, "Sem snippet de código para esta página.");
    }
  });

  // Metadata dos snippets
  const snippetMetaHeader = ["page_id", "title", "description", "questions", "has_code"];
  const snippetMetaRows = pages.map(page => {
    const questionList = (page.questions || []).map(q => q.id).filter(Boolean).join(" | ");
    return [
      page.id,
      page.title || "",
      page.description || "",
      questionList,
      page.code && String(page.code).trim() !== "" ? "1" : "0"
    ];
  });
  zip.file(
    "metadata/snippets.csv",
    [snippetMetaHeader, ...snippetMetaRows].map(row => row.map(csvEscape).join(",")).join("\n")
  );

  // Metadata de questões
  const questionHeader = ["question_id", "page_id", "page_title", "type", "label", "options"];
  const questionRows = questions.map(q => [q.questionId, q.pageId, q.pageTitle, q.type, q.label, q.options]);
  zip.file(
    "metadata/questions.csv",
    [questionHeader, ...questionRows].map(row => row.map(csvEscape).join(",")).join("\n")
  );

  // Matriz de respostas anonimizadas (participante por linha)
  const responsesHeader = ["participant_id", ...questionIds];
  const responseRows = submissions.map((submission, idx) => {
    const answers = submission && submission.answers && typeof submission.answers === "object"
      ? submission.answers
      : {};
    const participantId = `P${String(idx + 1).padStart(4, "0")}`;
    return [participantId, ...questionIds.map(questionId => answers[questionId] || "")];
  });

  if (responseRows.length === 0) {
    zip.file(
      "responses/respostas.csv",
      responsesHeader.map(csvEscape).join(",") + "\n"
    );
    zip.file(
      "responses/README.txt",
      "Nenhuma submissão por participante foi retornada pela API. Atualize o Apps Script para a versão mais recente de forms/script-planilha.gs e faça novo deploy."
    );
  } else {
    zip.file(
      "responses/respostas.csv",
      [responsesHeader, ...responseRows].map(row => row.map(csvEscape).join(",")).join("\n")
    );
  }

  // Manifesto
  const manifest = {
    generatedAt: new Date().toISOString(),
    formId: form.id,
    title: form.title,
    totalPages: pages.length,
    totalQuestions: questionIds.length,
    totalParticipants: responseRows.length,
    files: [
      "snippets/*",
      "metadata/snippets.csv",
      "metadata/questions.csv",
      "responses/respostas.csv"
    ]
  };
  zip.file("manifest.json", JSON.stringify(manifest, null, 2));

  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  a.href = url;
  a.download = `${slugifyFileName(form.id || "form")}-pacote-resultados-${stamp}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  setFeedback("Exportado com sucesso.");
}

function buildWordFilterOptions(page, pageMeta) {
  const valuesByQuestion = new Map();

  (page.commentRecords || []).forEach(record => {
    Object.entries(record.filters || {}).forEach(([questionId, value]) => {
      if (!valuesByQuestion.has(questionId)) {
        valuesByQuestion.set(questionId, new Set());
      }
      valuesByQuestion.get(questionId).add(String(value));
    });
  });

  const questionIds = [...valuesByQuestion.keys()].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
  const preferred = pageMeta && pageMeta.opiniaoQuestionId ? pageMeta.opiniaoQuestionId : "";

  return {
    questionIds,
    preferredQuestionId: questionIds.includes(preferred) ? preferred : (questionIds[0] || ""),
    valuesByQuestion
  };
}

function renderWordFilterControlsForPage(page) {
  const options = page.filterOptions || { questionIds: [], preferredQuestionId: "", valuesByQuestion: new Map() };
  el.dashboardWordFilterQuestion.innerHTML = "";

  if (!options.questionIds.length) {
    el.dashboardWordFilterQuestion.innerHTML = '<option value="">Sem questões disponíveis</option>';
    el.dashboardWordFilterValues.innerHTML = "";
    el.dashboardWordFilterQuestion.disabled = true;
    el.dashboardWordFilterValues.disabled = true;
    el.dashboardWordFilterClear.disabled = true;
    dashboardState.wordFilter = { questionId: "", values: [] };
    el.dashboardWordFilterMeta.textContent = "Filtro indisponível para esta página.";
    return;
  }

  el.dashboardWordFilterQuestion.disabled = false;
  el.dashboardWordFilterValues.disabled = false;
  el.dashboardWordFilterClear.disabled = false;

  options.questionIds.forEach(questionId => {
    const opt = document.createElement("option");
    opt.value = questionId;
    opt.textContent = questionId;
    el.dashboardWordFilterQuestion.appendChild(opt);
  });

  const keepCurrent = dashboardState.wordFilter.questionId && options.questionIds.includes(dashboardState.wordFilter.questionId);
  dashboardState.wordFilter.questionId = keepCurrent ? dashboardState.wordFilter.questionId : options.preferredQuestionId;
  el.dashboardWordFilterQuestion.value = dashboardState.wordFilter.questionId;

  renderWordFilterValuesForQuestion(page, dashboardState.wordFilter.questionId);
}

function renderWordFilterValuesForQuestion(page, questionId) {
  const valuesByQuestion = (page.filterOptions && page.filterOptions.valuesByQuestion) || new Map();
  const values = [...(valuesByQuestion.get(questionId) || [])].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));

  el.dashboardWordFilterValues.innerHTML = "";
  values.forEach(value => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    if (dashboardState.wordFilter.values.includes(value)) {
      opt.selected = true;
    }
    el.dashboardWordFilterValues.appendChild(opt);
  });

  dashboardState.wordFilter.values = dashboardState.wordFilter.values.filter(value => values.includes(value));
}

function getCurrentDashboardPage() {
  if (dashboardState.currentIndex <= 0) return null;
  return dashboardState.pages[dashboardState.currentIndex - 1] || null;
}

function getFilteredCommentRecords(page) {
  const records = page.commentRecords || [];
  const { questionId, values } = dashboardState.wordFilter;

  if (!questionId || !Array.isArray(values) || values.length === 0) {
    return records;
  }

  const allowed = new Set(values.map(v => String(v)));
  return records.filter(record => allowed.has(String((record.filters || {})[questionId] || "")));
}

function onWordFilterQuestionChange() {
  const page = getCurrentDashboardPage();
  if (!page) return;

  dashboardState.wordFilter.questionId = el.dashboardWordFilterQuestion.value;
  dashboardState.wordFilter.values = [];
  renderWordFilterValuesForQuestion(page, dashboardState.wordFilter.questionId);
  renderWordCloudForPage(page, el.dashboardWordSlot);
}

function onWordFilterValuesChange() {
  const page = getCurrentDashboardPage();
  if (!page) return;

  dashboardState.wordFilter.values = [...el.dashboardWordFilterValues.selectedOptions].map(opt => opt.value);
  renderWordCloudForPage(page, el.dashboardWordSlot);
}

function clearWordFilter() {
  const page = getCurrentDashboardPage();
  if (!page) return;

  dashboardState.wordFilter.values = [];
  [...el.dashboardWordFilterValues.options].forEach(option => {
    option.selected = false;
  });
  renderWordCloudForPage(page, el.dashboardWordSlot);
}

function onDashboardSortClick(event) {
  const button = event.target.closest(".sort-btn[data-sort-key]");
  if (!button) return;

  const key = button.dataset.sortKey;
  if (!key) return;

  if (dashboardState.sortKey === key) {
    dashboardState.sortDir = dashboardState.sortDir === "asc" ? "desc" : "asc";
  } else {
    dashboardState.sortKey = key;
    dashboardState.sortDir = "asc";
  }

  renderDashboardOverviewTable();
}

function buildDashboardPagesFromFormAndResponses(form, questions, scoringContext, submissions) {
  const respByPage = new Map();
  const pageMetaById = collectPageMetadataById(form);

  questions.forEach(q => {
    const qId = String(q.questionId || "");
    const match = qId.match(/^([^_]+)_(.+)$/);
    if (!match) return;

    const pageId = match[1];
    const kind = match[2];

    if (!respByPage.has(pageId)) {
      respByPage.set(pageId, { opiniao: [], comentario: [], opiniaoQuestionId: null });
    }

    const entry = respByPage.get(pageId);
    if (kind === "opiniao") {
      entry.opiniao = Array.isArray(q.responses) ? q.responses : [];
      entry.opiniaoQuestionId = qId;
    }
    if (kind === "comentario") entry.comentario = Array.isArray(q.responses) ? q.responses : [];
  });

  const pages = [];
  const seen = new Set();

  Object.values(form.groups || {}).forEach(groupPages => {
    (groupPages || []).forEach(page => {
      if (!page || !page.id || seen.has(page.id)) return;
      seen.add(page.id);
      const responses = respByPage.get(page.id) || { opiniao: [], comentario: [], opiniaoQuestionId: null };
      const meta = pageMetaById.get(page.id) || {};
      const opiniaoQuestionId = responses.opiniaoQuestionId || meta.opiniaoQuestionId || null;
      const numericScores = (responses.opiniao || [])
        .map(value => resolveNumericResponse(value, opiniaoQuestionId, scoringContext))
        .filter(score => !Number.isNaN(score));
      pages.push({
        pageId: page.id,
        title: page.title || "",
        description: page.description || "",
        code: page.code || "",
        opiniao: responses.opiniao,
        comentario: responses.comentario,
        opiniaoQuestionId,
        numericScores,
        unmappedOpiniaoCount: Math.max((responses.opiniao || []).length - numericScores.length, 0),
        commentRecords: [],
        filterOptions: { questionIds: [], preferredQuestionId: "", valuesByQuestion: new Map() }
      });
    });
  });

  // Inclui páginas com resposta que não estejam no JSON atual (dados legados).
  [...respByPage.keys()]
    .filter(pageId => !seen.has(pageId))
    .sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }))
    .forEach(pageId => {
      const responses = respByPage.get(pageId);
      const numericScores = (responses.opiniao || [])
        .map(value => resolveNumericResponse(value, responses.opiniaoQuestionId, scoringContext))
        .filter(score => !Number.isNaN(score));
      pages.push({
        pageId,
        title: "Página não encontrada no JSON atual",
        description: "Os dados existem na planilha, mas a definição da página não foi encontrada no formulário atual.",
        code: "",
        opiniao: responses.opiniao,
        comentario: responses.comentario,
        opiniaoQuestionId: responses.opiniaoQuestionId || null,
        numericScores,
        unmappedOpiniaoCount: Math.max((responses.opiniao || []).length - numericScores.length, 0),
        commentRecords: [],
        filterOptions: { questionIds: [], preferredQuestionId: "", valuesByQuestion: new Map() }
      });
    });

  const hasSubmissionData = Array.isArray(submissions) && submissions.length > 0;

  if (hasSubmissionData) {
    submissions.forEach(submission => {
      const answers = submission && submission.answers && typeof submission.answers === "object"
        ? submission.answers
        : {};

      pages.forEach(page => {
        const meta = pageMetaById.get(page.pageId);
        if (!meta || !meta.comentarioQuestionId) return;

        const comment = answers[meta.comentarioQuestionId];
        if (comment === undefined || comment === null || String(comment).trim() === "") return;

        const filters = {};
        meta.questionIds
          .filter(questionId => questionId !== meta.comentarioQuestionId)
          .forEach(questionId => {
            const value = answers[questionId];
            if (value !== undefined && value !== null && String(value).trim() !== "") {
              filters[questionId] = String(value).trim();
            }
          });

        page.commentRecords.push({
          comment: String(comment).trim(),
          filters
        });
      });
    });
  } else {
    pages.forEach(page => {
      const total = Math.min((page.comentario || []).length, (page.opiniao || []).length);
      for (let i = 0; i < total; i++) {
        const filters = {};
        if (page.opiniaoQuestionId) {
          filters[page.opiniaoQuestionId] = String(page.opiniao[i]);
        }
        page.commentRecords.push({
          comment: String(page.comentario[i]),
          filters
        });
      }
    });
  }

  pages.forEach(page => {
    page.filterOptions = buildWordFilterOptions(page, pageMetaById.get(page.pageId));
  });

  return pages;
}

function collectPageMetadataById(form) {
  const pagesById = new Map();

  Object.values(form.groups || {}).forEach(groupPages => {
    (groupPages || []).forEach(page => {
      if (!page || !page.id || pagesById.has(page.id)) return;
      const opiniaoQuestion = (page.questions || []).find(q => String(q.id || "").endsWith("_opiniao"));
      const comentarioQuestion = (page.questions || []).find(q => String(q.id || "").endsWith("_comentario"));
      pagesById.set(page.id, {
        opiniaoQuestionId: opiniaoQuestion ? opiniaoQuestion.id : null,
        comentarioQuestionId: comentarioQuestion ? comentarioQuestion.id : null,
        questionIds: (page.questions || []).map(q => q.id).filter(Boolean)
      });
    });
  });

  return pagesById;
}

function normalizeResponseToken(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function tryParseNumericLiteral(value) {
  const asString = String(value || "").trim();
  if (asString === "") return NaN;

  const direct = Number(asString.replace(",", "."));
  if (!Number.isNaN(direct) && Number.isFinite(direct)) return direct;

  const prefixed = asString.match(/^-?\d+(?:[.,]\d+)?/);
  if (!prefixed) return NaN;
  const parsed = Number(prefixed[0].replace(",", "."));
  return Number.isFinite(parsed) ? parsed : NaN;
}

function normalizeMappingObject(rawMap) {
  const out = new Map();
  if (!rawMap || typeof rawMap !== "object") return out;

  Object.entries(rawMap).forEach(([answer, numericValue]) => {
    const n = Number(numericValue);
    if (!Number.isFinite(n)) return;
    out.set(normalizeResponseToken(answer), n);
  });

  return out;
}

function buildScoringContext(form) {
  const questionMaps = new Map();
  const globalMap = normalizeMappingObject(form.numericResponseMap);

  Object.values(form.groups || {}).forEach(groupPages => {
    (groupPages || []).forEach(page => {
      (page.questions || []).forEach(question => {
        if (!question || !question.id) return;
        const questionMap = new Map();

        (question.options || []).forEach((option, idx) => {
          questionMap.set(normalizeResponseToken(option), idx + 1);
        });

        normalizeMappingObject(question.numericResponseMap).forEach((value, key) => {
          questionMap.set(key, value);
        });

        if (questionMap.size > 0) {
          questionMaps.set(question.id, questionMap);
        }
      });
    });
  });

  if (form.numericResponseMapByQuestion && typeof form.numericResponseMapByQuestion === "object") {
    Object.entries(form.numericResponseMapByQuestion).forEach(([questionId, mapping]) => {
      if (!questionId) return;
      const base = questionMaps.get(questionId) || new Map();
      normalizeMappingObject(mapping).forEach((value, key) => {
        base.set(key, value);
      });
      if (base.size > 0) {
        questionMaps.set(questionId, base);
      }
    });
  }

  return { questionMaps, globalMap };
}

function resolveNumericResponse(rawResponse, questionId, scoringContext) {
  const literal = tryParseNumericLiteral(rawResponse);
  if (!Number.isNaN(literal)) return literal;

  const normalized = normalizeResponseToken(rawResponse);
  if (!normalized) return NaN;

  const questionMap = questionId ? scoringContext.questionMaps.get(questionId) : null;
  if (questionMap && questionMap.has(normalized)) {
    return questionMap.get(normalized);
  }

  if (scoringContext.globalMap.has(normalized)) {
    return scoringContext.globalMap.get(normalized);
  }

  return NaN;
}

function computeSummaryStats(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((acc, n) => acc + n, 0);
  const mean = sum / count;

  const quantile = (q) => {
    if (count === 1) return sorted[0];
    const pos = (count - 1) * q;
    const lower = Math.floor(pos);
    const upper = Math.ceil(pos);
    if (lower === upper) return sorted[lower];
    const weight = pos - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };

  const variance = count > 1
    ? sorted.reduce((acc, n) => acc + ((n - mean) ** 2), 0) / (count - 1)
    : 0;

  return {
    count,
    min: sorted[0],
    max: sorted[count - 1],
    mean,
    median: quantile(0.5),
    q1: quantile(0.25),
    q3: quantile(0.75),
    stdDev: Math.sqrt(variance)
  };
}

function formatNumberPtBr(value) {
  return Number(value).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function renderBarChartForPage(page, slot) {
  if (!slot) return;

  const counts = new Map();
  (page.numericScores || []).forEach(score => {
    counts.set(score, (counts.get(score) || 0) + 1);
  });

  const labels = [...counts.keys()].sort((a, b) => a - b);
  const total = labels.reduce((acc, label) => acc + counts.get(label), 0);
  if (total === 0) {
    slot.innerHTML = '<p class="muted">Sem respostas numéricas nesta página.</p>';
    return;
  }

  const canvas = document.createElement("canvas");
  slot.innerHTML = "";
  slot.appendChild(canvas);
  canvas.style.width = "100%";
  canvas.style.height = "260px";

  const chart = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels.map(v => String(v)),
      datasets: [{
        label: "Respostas",
        data:  labels.map(v => counts.get(v)),
        backgroundColor: labels.map((_, idx) => {
          const palette = ["#ef4444", "#f97316", "#eab308", "#22c55e", "#0f766e", "#1d4ed8"];
          return palette[idx % palette.length];
        }),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales:  { y: { beginAtZero: true, ticks: { precision: 0 } } }
    }
  });

  dashCharts.push(chart);
}

function renderBoxPlotForPage(page, slot) {
  if (!slot) return;

  const scores = page.numericScores || [];

  if (scores.length === 0) {
    slot.innerHTML = '<p class="muted">Sem respostas numéricas suficientes para box-plot.</p>';
    return;
  }

  const canvas = document.createElement("canvas");
  slot.innerHTML = "";
  slot.appendChild(canvas);
  canvas.style.width = "100%";
  canvas.style.height = "260px";

  const chart = new Chart(canvas, {
    type: "boxplot",
    data: {
      labels: [page.pageId],
      datasets: [{
        label: "Nota",
        data:  [scores],
        backgroundColor: "rgba(15,118,110,0.25)",
        borderColor:     "#0f766e",
        borderWidth:     1.5,
        medianColor:     "#b45309"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales:  { y: { ticks: { precision: 2 } } }
    }
  });

  dashCharts.push(chart);
}

function renderSummaryForPage(page, slot) {
  if (!slot) return;

  const stats = computeSummaryStats(page.numericScores || []);
  const totalOpiniao = (page.opiniao || []).length;
  const mappedCount = (page.numericScores || []).length;
  const unmappedCount = Math.max(totalOpiniao - mappedCount, 0);

  if (!stats) {
    slot.innerHTML = `
      <p class="muted">
        Não há respostas numéricas para sumarizar nesta página.
        ${unmappedCount > 0 ? `(${unmappedCount} resposta(s) sem mapeamento numérico.)` : ""}
      </p>
    `;
    return;
  }

  slot.innerHTML = `
    <div class="summary-grid">
      <div><strong>Respostas numéricas</strong><span>${mappedCount} de ${totalOpiniao}</span></div>
      <div><strong>Média</strong><span>${formatNumberPtBr(stats.mean)}</span></div>
      <div><strong>Mediana</strong><span>${formatNumberPtBr(stats.median)}</span></div>
      <div><strong>Q1</strong><span>${formatNumberPtBr(stats.q1)}</span></div>
      <div><strong>Q3</strong><span>${formatNumberPtBr(stats.q3)}</span></div>
      <div><strong>Mínimo</strong><span>${formatNumberPtBr(stats.min)}</span></div>
      <div><strong>Máximo</strong><span>${formatNumberPtBr(stats.max)}</span></div>
      <div><strong>Desvio padrão</strong><span>${formatNumberPtBr(stats.stdDev)}</span></div>
      <div><strong>Total mapeável</strong><span>${stats.count}</span></div>
    </div>
    ${unmappedCount > 0
      ? `<p class="muted summary-note">${unmappedCount} resposta(s) não puderam ser convertidas para número.</p>`
      : ""}
  `;
}

const PT_STOPWORDS = new Set([
  "a","ao","aos","aquela","aquelas","aquele","aqueles","aquilo","as","até",
  "com","como","da","das","de","dela","delas","dele","deles","depois",
  "do","dos","e","ela","elas","ele","eles","em","entre",
  "essa","essas","esse","esses","esta","estas","este","estes","eu",
  "foi","isso","isto","já","lhe","lhes","mais","mas","me",
  "mesmo","meu","meus","minha","minhas","muito","na","nas","não","nem",
  "no","nos","nós","nossa","nossas","nosso","nossos","num","numa",
  "o","os","ou","para","pela","pelas","pelo","pelos","por",
  "qual","quando","que","quem","se","sem","ser","seu","seus",
  "só","sua","suas","também","te","tem","teu","teus",
  "toda","todas","todo","todos","tu","tua","tuas",
  "um","uma","umas","uns","você","vocês","à","às","é","são",
  "ter","bem","pois","aqui","lá","há","vai","vão","pode","pois"
]);

function buildWordFreq(texts) {
  const freq = {};
  texts.forEach(text => {
    String(text).toLowerCase()
      .replace(/[^a-záàâãéêíóôõúüç\s]/g, " ")
      .split(/\s+/)
      .forEach(word => {
        if (word.length < 3 || PT_STOPWORDS.has(word)) return;
        freq[word] = (freq[word] || 0) + 1;
      });
  });
  return Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 120);
}

function renderWordCloudForPage(page, slot) {
  if (!slot) return;

  const filteredRecords = getFilteredCommentRecords(page);
  const comments = filteredRecords.map(record => record.comment);
  const wordList = buildWordFreq(comments);
  const totalComments = (page.commentRecords || []).length;

  if (!dashboardState.wordFilter.questionId || dashboardState.wordFilter.values.length === 0) {
    el.dashboardWordFilterMeta.textContent = `Nuvem com ${comments.length} comentário(s) desta página.`;
  } else {
    el.dashboardWordFilterMeta.textContent =
      `Filtro ativo em ${dashboardState.wordFilter.questionId}: ${dashboardState.wordFilter.values.join(", ")} (${comments.length} de ${totalComments} comentário(s)).`;
  }

  if (wordList.length === 0) {
    slot.innerHTML = '<p class="muted">Sem comentários para o filtro selecionado.</p>';
    return;
  }

  const canvas = document.createElement("canvas");
  slot.innerHTML = "";
  slot.appendChild(canvas);

  const width = Math.max(600, slot.clientWidth || 600);
  const height = 300;
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = "100%";
  canvas.style.height = `${height}px`;

  const maxFreq = wordList[0][1];
  const scaledList = wordList.map(([w, c]) => [w, Math.round(14 + (c / maxFreq) * 44)]);

  WordCloud(canvas, {
    list:            scaledList,
    gridSize:        8,
    weightFactor:    1,
    fontFamily:      "'IBM Plex Sans', 'Segoe UI', sans-serif",
    color:           (word) => {
      const palette = ["#0f766e","#b45309","#1d4ed8","#7c3aed","#b91c1c","#047857"];
      return palette[Math.abs(word.charCodeAt(0)) % palette.length];
    },
    backgroundColor: "transparent",
    shrinkToFit:     true,
    rotateRatio:     0.25,
    minSize:         10
  });
}

function destroyDashCharts() {
  while (dashCharts.length > 0) {
    const chart = dashCharts.pop();
    chart.destroy();
  }
}

// ============================================================
// Reiniciar
// ============================================================
function restartQuiz() {
  clearSavedProgress();
  resetState();
  renderHome();
}

function handleRegisterInputChange() {
  state.registrationDraft = {
    nome: el.inputNome.value,
    email: el.inputEmail.value,
    cpfInput: el.inputCpf.value
  };
  saveProgress();
}

function goBackHomeFromRegister() {
  clearSavedProgress();
  resetState();
  renderHome();
}

// ============================================================
// Bootstrap
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initEls();

  el.registerBackBtn.addEventListener("click",  goBackHomeFromRegister);
  el.inputNome.addEventListener("input",        handleRegisterInputChange);
  el.inputEmail.addEventListener("input",       handleRegisterInputChange);
  el.inputCpf.addEventListener("input",         () => {
    updateGroupPreview();
    handleRegisterInputChange();
  });
  el.registerBtn.addEventListener("click",      validateAndStartQuiz);
  el.copyResultBtn.addEventListener("click",    copyResult);
  el.submitSheetsBtn.addEventListener("click",  submitToSheets);
  el.restartBtn.addEventListener("click",       restartQuiz);
  el.dashboardBackBtn.addEventListener("click", renderHome);
  el.dashboardPrevBtn.addEventListener("click", () => changeDashboardPage(-1));
  el.dashboardNextBtn.addEventListener("click", () => changeDashboardPage(1));
  el.dashboardPageSelect.addEventListener("change", onDashboardSelectChange);
  el.dashboardOverview.addEventListener("click", onDashboardSortClick);
  el.dashboardExportCsvBtn.addEventListener("click", exportDashboardOverviewCsv);
  el.dashboardWordFilterQuestion.addEventListener("change", onWordFilterQuestionChange);
  el.dashboardWordFilterValues.addEventListener("change", onWordFilterValuesChange);
  el.dashboardWordFilterClear.addEventListener("click", clearWordFilter);
  window.addEventListener("beforeunload",       saveProgress);

  renderHome();
});

