const DATASETS = {
  A: [
    {
      id: "A01",
      title: "Pagina 01",
      code: `public class P01 {
    public static void main(String[] args) {
        int x = 2;
        int y = 3;
        int z = x + y;

        if (z > 4) {
            int d = z * 2;
            z = d - 1;
        }

        System.out.println(z);
    }
}`,
      variableQuestion: "A variavel e existe em algum ponto deste codigo?"
    },
    {
      id: "A02",
      title: "Pagina 02",
      code: `public class P02 {
    public static void main(String[] args) {
        int currentTotal = 10;

        for (int iteration = 0; iteration < 2; iteration++) {
            int partialSum = currentTotal + iteration;

            if (iteration == 1) {
                int doubledPartial = partialSum * 2;
                currentTotal = doubledPartial - 5;
            }
        }

        System.out.println(currentTotal);
    }
}`,
      variableQuestion: "A variavel partialSums existe em algum ponto deste codigo?"
    },
    {
      id: "A03",
      title: "Pagina 03",
      code: `public class P03 {
    public static void main(String[] args) {
        int p = 1;
        int q = 2;

        boolean r = (p++ > 1) && (++q > 2);

        System.out.println(p + "-" + q + "-" + r);
    }
}`,
      variableQuestion: "A variavel r existe em algum ponto deste codigo?"
    },
    {
      id: "A04",
      title: "Pagina 04",
      code: `public class P04 {
    public static void main(String[] args) {
        int currentNumber = 0;
        int oddNumberSum = 0;

        while (currentNumber < 5) {
            currentNumber++;

            boolean isEven = currentNumber % 2 == 0;
            if (isEven) {
                continue;
            }

            oddNumberSum += currentNumber;

            if (oddNumberSum > 4) {
                break;
            }
        }

        System.out.println(currentNumber + ":" + oddNumberSum);
    }
}`,
      variableQuestion: "A variavel oddNumberSum existe em algum ponto deste codigo?"
    },
    {
      id: "A05",
      title: "Pagina 05",
      code: `public class P05 {
    public static void main(String[] args) {
        int[] v = {1, 2, 3};
        int t = v[0];

        v[0] = v[2];
        v[2] = t + v[1];

        System.out.println(v[0] + "," + v[1] + "," + v[2]);
    }
}`,
      variableQuestion: "A variavel values existe em algum ponto deste codigo?"
    }
  ],
  B: [
    {
      id: "B01",
      title: "Pagina 01",
      code: `public class P01 {
    public static void main(String[] args) {
        int leftValue = 2;
        int rightValue = 3;
        int sum = leftValue + rightValue;

        if (sum > 4) {
            int doubledSum = sum * 2;
            sum = doubledSum - 1;
        }

        System.out.println(sum);
    }
}`,
      variableQuestion: "A variavel doubledSum existe em algum ponto deste codigo?"
    },
    {
      id: "B02",
      title: "Pagina 02",
      code: `public class P02 {
    public static void main(String[] args) {
        int x = 10;

        for (int i = 0; i < 2; i++) {
            int y = x + i;
            if (i == 1) {
                int x2 = y * 2;
                x = x2 - 5;
            }
        }

        System.out.println(x);
    }
}`,
      variableQuestion: "A variavel x2 existe em algum ponto deste codigo?"
    },
    {
      id: "B03",
      title: "Pagina 03",
      code: `public class P03 {
    public static void main(String[] args) {
        int processedItems = 1;
        int threshold = 2;

        boolean canContinue = (processedItems++ > 1) && (++threshold > 2);

        System.out.println(processedItems + "-" + threshold + "-" + canContinue);
    }
}`,
      variableQuestion: "A variavel continueFlag existe em algum ponto deste codigo?"
    },
    {
      id: "B04",
      title: "Pagina 04",
      code: `public class P04 {
    public static void main(String[] args) {
        int n = 0;
        int s = 0;

        while (n < 5) {
            n++;
            if (n % 2 == 0) {
                continue;
            }

            s += n;

            if (s > 4) {
                break;
            }
        }

        System.out.println(n + ":" + s);
    }
}`,
      variableQuestion: "A variavel sum existe em algum ponto deste codigo?"
    },
    {
      id: "B05",
      title: "Pagina 05",
      code: `public class P05 {
    public static void main(String[] args) {
        int[] values = {1, 2, 3};
        int firstValueBackup = values[0];

        values[0] = values[2];
        values[2] = firstValueBackup + values[1];

        System.out.println(values[0] + "," + values[1] + "," + values[2]);
    }
}`,
      variableQuestion: "A variavel firstValueBackup existe em algum ponto deste codigo?"
    }
  ]
};

const state = {
  group: null,
  lastDigit: null,
  currentIndex: 0,
  startedAt: null,
  outputTimerId: null,
  outputStartMs: null,
  answers: []
};

const el = {
  startCard: document.getElementById("start-card"),
  quizCard: document.getElementById("quiz-card"),
  resultCard: document.getElementById("result-card"),
  cpfLastDigit: document.getElementById("cpf-last-digit"),
  groupPreview: document.getElementById("group-preview"),
  startBtn: document.getElementById("start-btn"),
  startError: document.getElementById("start-error"),
  questionTitle: document.getElementById("question-title"),
  groupBadge: document.getElementById("group-badge"),
  progress: document.getElementById("progress"),
  codePanel: document.getElementById("code-panel"),
  codeBlock: document.getElementById("code-block"),
  phaseOutput: document.getElementById("phase-output"),
  phaseVariable: document.getElementById("phase-variable"),
  liveTimer: document.getElementById("live-timer"),
  outputAnswer: document.getElementById("output-answer"),
  outputConfidence: document.getElementById("output-confidence"),
  confirmOutputBtn: document.getElementById("confirm-output-btn"),
  variableQuestion: document.getElementById("variable-question"),
  varYesBtn: document.getElementById("var-yes-btn"),
  varNoBtn: document.getElementById("var-no-btn"),
  quizError: document.getElementById("quiz-error"),
  resultHeadline: document.getElementById("result-headline"),
  resultTableBody: document.getElementById("result-table-body"),
  resultText: document.getElementById("result-text"),
  copyResultBtn: document.getElementById("copy-result-btn"),
  restartBtn: document.getElementById("restart-btn"),
  copyFeedback: document.getElementById("copy-feedback")
};

function detectGroup(lastDigit) {
  return lastDigit % 2 === 0 ? "A" : "B";
}

function getCurrentQuestion() {
  return DATASETS[state.group][state.currentIndex];
}

function updateGroupPreview() {
  const raw = el.cpfLastDigit.value.trim();
  if (raw === "") {
    el.groupPreview.textContent = "Grupo sera definido automaticamente: par = A, impar = B.";
    return;
  }

  const digit = Number(raw);
  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    el.groupPreview.textContent = "Digite um numero valido de 0 a 9.";
    return;
  }

  const group = detectGroup(digit);
  el.groupPreview.textContent = `Com final ${digit}, voce ira para o Grupo ${group}.`;
}

function startOutputTimer() {
  state.outputStartMs = Date.now();
  stopOutputTimer();
  state.outputTimerId = setInterval(() => {
    const seconds = (Date.now() - state.outputStartMs) / 1000;
    el.liveTimer.textContent = `${seconds.toFixed(1)}s`;
  }, 100);
}

function stopOutputTimer() {
  if (state.outputTimerId) {
    clearInterval(state.outputTimerId);
    state.outputTimerId = null;
  }
}

function renderQuestion() {
  const question = getCurrentQuestion();
  const total = DATASETS[state.group].length;

  el.questionTitle.textContent = question.title;
  el.progress.textContent = `Questao ${state.currentIndex + 1} de ${total}`;
  el.groupBadge.textContent = `Grupo ${state.group}`;
  el.codeBlock.textContent = question.code;
  el.outputAnswer.value = "";
  el.outputConfidence.value = "";
  el.variableQuestion.textContent = question.variableQuestion;
  el.quizError.textContent = "";

  el.codePanel.classList.remove("hidden");
  el.phaseOutput.classList.remove("hidden");
  el.phaseVariable.classList.add("hidden");
  el.liveTimer.textContent = "0.0s";

  startOutputTimer();
}

function validateStart() {
  const raw = el.cpfLastDigit.value.trim();
  const digit = Number(raw);

  if (!Number.isInteger(digit) || digit < 0 || digit > 9) {
    el.startError.textContent = "Informe o ultimo digito do CPF com um numero de 0 a 9.";
    return null;
  }

  el.startError.textContent = "";
  return digit;
}

function startQuiz() {
  const lastDigit = validateStart();
  if (lastDigit === null) {
    return;
  }

  state.lastDigit = lastDigit;
  state.group = detectGroup(lastDigit);
  state.currentIndex = 0;
  state.answers = [];
  state.startedAt = new Date();

  el.startCard.classList.add("hidden");
  el.quizCard.classList.remove("hidden");

  renderQuestion();
}

function confirmOutputAnswer() {
  const answer = el.outputAnswer.value.trim();
  const confidenceRaw = el.outputConfidence.value;
  if (!answer) {
    el.quizError.textContent = "Digite sua resposta para a saida antes de continuar.";
    return;
  }

  if (!confidenceRaw) {
    el.quizError.textContent = "Informe seu nivel de confianca (1 a 5) antes de continuar.";
    return;
  }

  const elapsedMs = Date.now() - state.outputStartMs;
  const question = getCurrentQuestion();

  state.answers.push({
    pageId: question.id,
    outputAnswer: answer,
    outputTimeSec: Number((elapsedMs / 1000).toFixed(2)),
    outputConfidence: Number(confidenceRaw),
    variableAnswer: null
  });

  stopOutputTimer();
  el.quizError.textContent = "";
  el.codePanel.classList.add("hidden");
  el.phaseOutput.classList.add("hidden");
  el.phaseVariable.classList.remove("hidden");
}

function confirmVariableAnswer(answer) {
  const current = state.answers[state.answers.length - 1];
  if (!current || current.variableAnswer !== null) {
    el.quizError.textContent = "Fluxo invalido. Reinicie a atividade.";
    return;
  }

  current.variableAnswer = answer;
  state.currentIndex += 1;

  if (state.currentIndex >= DATASETS[state.group].length) {
    showResults();
    return;
  }

  renderQuestion();
}

function buildResultText() {
  const totalOutputTime = state.answers.reduce((sum, row) => sum + row.outputTimeSec, 0);
  const avgOutputTime = totalOutputTime / state.answers.length;

  const lines = [
    `grupo: ${state.group}`,
    `cpf_final: ${state.lastDigit}`,
    `inicio: ${state.startedAt.toISOString()}`,
    `tempo_total_saida_segundos: ${totalOutputTime.toFixed(2)}`,
    `tempo_medio_saida_segundos: ${avgOutputTime.toFixed(2)}`
  ];

  state.answers.forEach((row, idx) => {
    lines.push(
      `q${idx + 1}_id: ${row.pageId}`,
      `q${idx + 1}_resposta_saida: ${row.outputAnswer}`,
      `q${idx + 1}_tempo_saida_segundos: ${row.outputTimeSec}`,
      `q${idx + 1}_confianca_saida: ${row.outputConfidence}`,
      `q${idx + 1}_variavel_existe: ${row.variableAnswer}`
    );
  });

  return lines.join("\n");
}

function showResults() {
  el.quizCard.classList.add("hidden");
  el.resultCard.classList.remove("hidden");

  const totalOutputTime = state.answers.reduce((sum, row) => sum + row.outputTimeSec, 0);
  el.resultHeadline.textContent = `Grupo ${state.group}. Tempo total nas respostas de saida: ${totalOutputTime.toFixed(2)}s.`;

  el.resultTableBody.innerHTML = "";
  state.answers.forEach((row, idx) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${idx + 1} (${row.pageId})</td>
      <td>${escapeHtml(row.outputAnswer)}</td>
      <td>${row.outputTimeSec.toFixed(2)}</td>
      <td>${row.outputConfidence}</td>
      <td>${row.variableAnswer}</td>
    `;
    el.resultTableBody.appendChild(tr);
  });

  el.resultText.value = buildResultText();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function copyResult() {
  try {
    await navigator.clipboard.writeText(el.resultText.value);
    el.copyFeedback.textContent = "Resumo copiado para a area de transferencia.";
  } catch (err) {
    el.copyFeedback.textContent = "Nao foi possivel copiar automaticamente. Copie manualmente o texto.";
  }
}

function restartQuiz() {
  stopOutputTimer();
  state.group = null;
  state.lastDigit = null;
  state.currentIndex = 0;
  state.startedAt = null;
  state.answers = [];

  el.cpfLastDigit.value = "";
  el.groupPreview.textContent = "Grupo sera definido automaticamente: par = A, impar = B.";
  el.resultText.value = "";
  el.copyFeedback.textContent = "";

  el.resultCard.classList.add("hidden");
  el.quizCard.classList.add("hidden");
  el.startCard.classList.remove("hidden");
}

el.cpfLastDigit.addEventListener("input", updateGroupPreview);
el.startBtn.addEventListener("click", startQuiz);
el.confirmOutputBtn.addEventListener("click", confirmOutputAnswer);
el.varYesBtn.addEventListener("click", () => confirmVariableAnswer("SIM"));
el.varNoBtn.addEventListener("click", () => confirmVariableAnswer("NAO"));
el.copyResultBtn.addEventListener("click", copyResult);
el.restartBtn.addEventListener("click", restartQuiz);
