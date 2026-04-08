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
    enabled: false,
    file: "forms/inspecao-codigo-s1.json"
  },
  {
    id: "inspecao-codigo-s2",
    title: "Inspeção de Código — Semana 2",
    description: "Compare alternativas de código e indique qual parece mais adequada para produção.",
    enabled: false,
    file: "forms/inspecao-codigo-s2.json"
  },
  {
    id: "analise-1",
    title: "Análise de Código - 09/04/2026",
    description: "Avalie o código e dê uma nota de legibilidade entre 1 e 5 para o código.",
    enabled: true,
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
    "copy-feedback", "submit-feedback"
  ].forEach(id => {
    el[id.replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = document.getElementById(id);
  });
}

// ============================================================
// Utilitários
// ============================================================
function showView(name) {
  ["home-card", "register-card", "quiz-card", "result-card"].forEach(id => {
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
  return meta.enabled !== false;
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
    const enabled = isFormEnabled(meta);
    const div = document.createElement("div");
    div.className = `form-card${enabled ? "" : " is-disabled"}`;
    div.innerHTML = `
      <div class="form-card-info">
        <strong>${escapeHtml(meta.title)}</strong>
        <p class="muted">${escapeHtml(meta.description)}</p>
        <div class="form-card-status${enabled ? "" : " is-disabled"}">${enabled ? "Disponível" : (meta.disabledLabel || "Desabilitado")}</div>
      </div>
      <button type="button" ${enabled ? "" : "disabled aria-disabled=\"true\""}>${enabled ? "Responder" : "Indisponível"}</button>
    `;
    if (enabled) {
      div.querySelector("button").addEventListener("click", () => selectForm(meta));
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
  window.addEventListener("beforeunload",       saveProgress);

  renderHome();
});

