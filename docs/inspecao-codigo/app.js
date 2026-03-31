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
    file: "forms/inspecao-codigo-s1.json"
  },
  {
    id: "inspecao-codigo-s2",
    title: "Inspeção de Código — Semana 2",
    description: "Compare alternativas de código e indique qual parece mais adequada para produção.",
    file: "forms/inspecao-codigo-s2.json"
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
const state = {
  form: null,           // JSON carregado do arquivo do formulário
  group: null,          // "A", "B" ou "default"
  pages: [],            // pages do grupo selecionado
  pageIndex: 0,
  questionIndex: 0,
  userData: { nome: "", email: "", cpfFinal: null },
  startedAt: null,
  timerInterval: null,
  timerStartMs: null,
  answers: []
  // Cada resposta: { pageId, pageTitle, questionId, label, questionType, value, timeSec, confidence }
};

// ============================================================
// Refs de DOM (preenchidas em initEls)
// ============================================================
const el = {};

function initEls() {
  [
    "home-card", "register-card", "quiz-card", "result-card",
    "form-list", "home-error",
    "register-title", "register-desc",
    "input-nome", "input-email", "cpf-field", "input-cpf", "group-preview",
    "register-btn", "register-back-btn", "register-error",
    "question-title", "group-badge", "progress",
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

// ============================================================
// Tela 1 — Seleção do formulário
// ============================================================
function renderHome() {
  el.homeError.textContent = "";
  el.formList.innerHTML = "";

  if (FORM_CATALOG.length === 0) {
    el.formList.innerHTML = '<p class="muted">Nenhum formulário disponível.</p>';
    showView("home");
    return;
  }

  FORM_CATALOG.forEach(meta => {
    const div = document.createElement("div");
    div.className = "form-card";
    div.innerHTML = `
      <div class="form-card-info">
        <strong>${escapeHtml(meta.title)}</strong>
        <p class="muted">${escapeHtml(meta.description)}</p>
      </div>
      <button type="button">Responder</button>
    `;
    div.querySelector("button").addEventListener("click", () => selectForm(meta));
    el.formList.appendChild(div);
  });

  showView("home");
}

async function selectForm(meta) {
  el.homeError.textContent = "";
  try {
    const res = await fetch(meta.file);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    state.form = await res.json();
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
  el.inputNome.value = "";
  el.inputEmail.value = "";
  el.inputCpf.value = "";
  el.groupPreview.textContent = "Grupo será definido automaticamente: par = A, ímpar = B.";
  el.registerError.textContent = "";

  if (form.hasAbTest) {
    el.cpfField.classList.remove("hidden");
  } else {
    el.cpfField.classList.add("hidden");
  }

  showView("register");
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
  state.group      = group;
  state.pages      = form.groups[group];
  state.pageIndex  = 0;
  state.questionIndex = 0;
  state.answers    = [];
  state.startedAt  = new Date();

  el.registerError.textContent = "";
  showView("quiz");
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

  // Código (opcional)
  if (page.code) {
    el.codeBlock.textContent = page.code;
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
  el.quizError.textContent = "";
  advanceQuiz();
}

function confirmMultipleChoice(q, value) {
  recordAnswer(q, value, null, null);
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
  stopTimer();
  Object.assign(state, {
    form: null, group: null, pages: [],
    pageIndex: 0, questionIndex: 0,
    userData: { nome: "", email: "", cpfFinal: null },
    startedAt: null, timerStartMs: null, answers: []
  });
  renderHome();
}

// ============================================================
// Bootstrap
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  initEls();

  el.registerBackBtn.addEventListener("click",  renderHome);
  el.inputCpf.addEventListener("input",         updateGroupPreview);
  el.registerBtn.addEventListener("click",      validateAndStartQuiz);
  el.copyResultBtn.addEventListener("click",    copyResult);
  el.submitSheetsBtn.addEventListener("click",  submitToSheets);
  el.restartBtn.addEventListener("click",       restartQuiz);

  renderHome();
});

