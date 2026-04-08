/**
 * IF006 — Script de análise A/B para Inspeção de Código
 *
 * COMO USAR:
 * 1. Abra o Google Sheets que recebe as respostas do formulário
 *    (o mesmo que usa script-planilha.gs).
 * 2. Acesse Extensões > Apps Script e cole este código. Salve.
 * 3. Recarregue a planilha — o menu "IF006 Análise A/B" aparecerá.
 *    a) Clique em "1) Criar / atualizar gabarito":
 *       → Uma aba "gabarito" será criada com duas tabelas lado a lado:
 *         • Colunas A-B: questao_id | resposta_correta
 *           Preencha B com a resposta esperada de cada questão de saída.
 *           Deixe em branco para questões sem gabarito (opinião).
 *         • Colunas D-F: grupo | pagina | categoria
 *           Preencha F com a categoria por grupo+página
 *           (ex.: A+P01="Com Atomo", B+P01="Sem Atomo").
 *    b) Clique em "2) Gerar análise e gráficos":
 *       → Uma aba "analise_ab" será criada/atualizada com:
 *         • Seção 1 — Acertos na questão de saída (% por página, A vs B)
 *         • Seção 2 — Distribuição das opções da questão "profissional" (A e B)
 *         • Seção 3 — Distribuição das opções da questão "clareza" (A e B)
 *         • Seção 4 — Resumo por categoria (acertos + opções agregados)
 *         • Gráficos para cada seção.
 *
 * FORMATO ESPERADO DA PLANILHA DE RESPOSTAS:
 *   Gerado por script-planilha.gs. Colunas obrigatórias:
 *     grupo            → "A" ou "B"
 *     q{n}_id          → ID da questão (ex.: A01_saida, B02_profissional)
 *     q{n}_resposta    → Resposta do aluno
 *     q{n}_tempo_s     → Tempo em segundos (opcional)
 *     q{n}_confianca   → Confiança (opcional)
 */

// ─────────────────────────────────────────────────────────────
// Configuração
// ─────────────────────────────────────────────────────────────

const CFG_AB = {
  // Nome da aba de respostas. Deixe "" para usar a primeira aba.
  RESPONSES_SHEET_NAME: "",
  GABARITO_SHEET_NAME:  "gabarito",
  ANALYSIS_SHEET_NAME:  "analise_ab",
};

// Opções esperadas para cada tipo de questão de múltipla escolha.
// Ajuste se o formulário usar outras opções.
const MC_OPTIONS_AB = {
  profissional: ["Sim", "Nao", "Nao sei"],
  clareza:      ["Sim", "Nao", "Parcialmente"],
};

// ─────────────────────────────────────────────────────────────
// Menu
// ─────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("IF006 Analise A/B")
    .addItem("1) Criar / atualizar gabarito", "createOrUpdateGabarito")
    .addItem("2) Gerar analise e graficos",   "buildAnalysisAB")
    .addSeparator()
    .addItem("Rodar tudo", "runAllAB")
    .addToUi();
}

function runAllAB() {
  createOrUpdateGabarito();
  buildAnalysisAB();
}

// ─────────────────────────────────────────────────────────────
// 1. Criar / atualizar gabarito
// ─────────────────────────────────────────────────────────────

/**
 * Varre a planilha de respostas em busca de IDs de questões abertas
 * (terminados em "_saida") e cria/atualiza a aba "gabarito" para que
 * o professor preencha as respostas corretas.
 */
function createOrUpdateGabarito() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responseSheet = getResponsesSheet_ab_(ss);
  const data = responseSheet.getDataRange().getValues();

  if (data.length < 2) {
    SpreadsheetApp.getActive().toast(
      "Nenhuma resposta encontrada na planilha.", "IF006", 5
    );
    return;
  }

  const headers = data[0];
  const rows    = data.slice(1);

  // Coleta IDs únicos de questões de saída em todos os registros
  const saidaIds = new Set();
  rows.forEach((row) => {
    headers.forEach((h, i) => {
      if (/^q\d+_id$/.test(String(h))) {
        const qId = String(row[i] || "").trim();
        if (qId.endsWith("_saida")) {
          saidaIds.add(qId);
        }
      }
    });
  });

  if (saidaIds.size === 0) {
    SpreadsheetApp.getActive().toast(
      "Nenhuma questão de saída encontrada nos dados.", "IF006", 5
    );
    return;
  }

  let gabSheet = ss.getSheetByName(CFG_AB.GABARITO_SHEET_NAME);
  const isNew  = !gabSheet;

  if (isNew) {
    gabSheet = ss.insertSheet(CFG_AB.GABARITO_SHEET_NAME);
    // Tabela esquerda: respostas corretas
    gabSheet.getRange(1, 1, 1, 2).setValues([["questao_id", "resposta_correta"]]);
    gabSheet.getRange(1, 1, 1, 2).setFontWeight("bold").setBackground("#d0e4f7");
    // Tabela direita: categorias por grupo e página
    gabSheet.getRange(1, 4, 1, 3).setValues([["grupo", "pagina", "categoria"]]);
    gabSheet.getRange(1, 4, 1, 3).setFontWeight("bold").setBackground("#d5e8d4");
    gabSheet.setFrozenRows(1);
    gabSheet.setColumnWidth(1, 160);
    gabSheet.setColumnWidth(2, 200);
    gabSheet.setColumnWidth(4, 70);
    gabSheet.setColumnWidth(5, 80);
    gabSheet.setColumnWidth(6, 180);
    gabSheet.getRange(1, 7)
      .setValue(
        "← Tabela A-B: resposta correta de cada questão aberta. " +
        "Tabela D-F: categoria por grupo+página (ex.: A/P01 e B/P01)."
      )
      .setFontStyle("italic")
      .setFontColor("#666666");
  }

  // IDs já cadastrados no gabarito
  const existingRows = gabSheet.getDataRange().getValues();
  const existingIds  = new Set(existingRows.slice(1).map((r) => String(r[0]).trim()));

  // Novos IDs a inserir (ordenados: A01, A02, ..., B01, B02, ...)
  const newIds = [...saidaIds].filter((id) => !existingIds.has(id)).sort();

  // Combinações grupo+página inferidas dos IDs de saída (ex.: A01_saida → A/P01)
  const pageGroups = new Set();
  [...saidaIds].forEach((id) => {
    const m = id.match(/^([AB])(\d{2})_saida$/);
    if (m) {
      const group = m[1];
      const pageNum = Number(m[2]);
      pageGroups.add(pageGroupKey_ab_(group, pageNum));
    }
  });

  // Combinações grupo+página já cadastradas na tabela de categorias (colunas D-E)
  const lastDataRow = gabSheet.getLastRow();
  const existingPageGroups = new Set();
  if (lastDataRow > 1) {
    const catRows = gabSheet.getRange(2, 4, lastDataRow - 1, 2).getValues();
    catRows.forEach((r) => {
      const group = String(r[0] || "").trim().toUpperCase();
      const page = String(r[1] || "").trim().toUpperCase();
      if (group && page) {
        const m = page.match(/^P(\d+)$/);
        if (m) {
          existingPageGroups.add(pageGroupKey_ab_(group, Number(m[1])));
        }
      }
    });
  } else {
    // Garante que os cabeçalhos da tabela de categorias existam
    if (gabSheet.getRange(1, 4).getValue() === "") {
      gabSheet.getRange(1, 4, 1, 3).setValues([["grupo", "pagina", "categoria"]]);
      gabSheet.getRange(1, 4, 1, 3).setFontWeight("bold").setBackground("#d5e8d4");
    }
  }

  const newPageGroups = [...pageGroups]
    .sort()
    .filter((key) => !existingPageGroups.has(key));

  let updated = false;

  if (newIds.length > 0) {
    const insertRow = gabSheet.getLastRow() + 1;
    gabSheet
      .getRange(insertRow, 1, newIds.length, 2)
      .setValues(newIds.map((id) => [id, ""]));
    gabSheet
      .getRange(insertRow, 2, newIds.length, 1)
      .setBackground("#fff9c4");
    updated = true;
  }

  if (newPageGroups.length > 0) {
    // A tabela de categorias (col D-F) cresce independente da tabela de respostas
    const catInsertRow = findCategoryTableNextRow_ab_(gabSheet);
    gabSheet
      .getRange(catInsertRow, 4, newPageGroups.length, 3)
      .setValues(newPageGroups.map((key) => {
        const parts = key.split("|");
        return [parts[0], pageLabel_ab_(Number(parts[1])), ""];
      }));
    gabSheet
      .getRange(catInsertRow, 6, newPageGroups.length, 1)
      .setBackground("#e2ffdb");
    updated = true;
  }

  if (!updated) {
    SpreadsheetApp.getActive().toast(
      "Gabarito já está atualizado. Preencha \"resposta_correta\" e \"categoria\" (por grupo+página) se ainda não o fez.",
      "IF006", 5
    );
    return;
  }

  SpreadsheetApp.getActive().toast(
    `Gabarito atualizado: ${newIds.length} questão(ões), ${newPageGroups.length} item(ns) grupo+página. ` +
    "Preencha \"resposta_correta\" (col B) e \"categoria\" (col F).",
    "IF006", 8
  );
}

/** Retorna a próxima linha vazia na tabela de categorias (coluna D). */
function findCategoryTableNextRow_ab_(gabSheet) {
  const lastRow = gabSheet.getLastRow();
  if (lastRow < 2) return 2;
  const colD = gabSheet.getRange(2, 4, lastRow - 1, 1).getValues();
  for (let i = colD.length - 1; i >= 0; i--) {
    if (String(colD[i][0] || "").trim() !== "") {
      return i + 3; // linha 1 é header, +1 para próxima
    }
  }
  return 2;
}

// ─────────────────────────────────────────────────────────────
// 2. Gerar análise e gráficos
// ─────────────────────────────────────────────────────────────

function buildAnalysisAB() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const responseSheet = getResponsesSheet_ab_(ss);
  const rawData = responseSheet.getDataRange().getValues();

  if (rawData.length < 2) {
    throw new Error("Nenhuma resposta encontrada na planilha.");
  }

  const headers  = rawData[0];
  const rows     = rawData.slice(1);
  const gabarito = readGabarito_ab_(ss);

  // Parseia respostas em registros estruturados por página
  const records = parseResponses_ab_(headers, rows);
  const pages   = getSortedPages_ab_(records);

  if (pages.length === 0) {
    throw new Error(
      "Não foi possível extrair páginas dos dados. " +
      "Verifique se a planilha foi gerada pelo script-planilha.gs."
    );
  }

  const categories = gabarito.categories; // { "A|1": "Com Atomo", "B|1": "Sem Atomo", ... }

  // Agrega dados
  const saidaAgg   = aggregateSaida_ab_(records, gabarito.answers, pages);
  const profAgg    = aggregateMultiChoice_ab_(records, "profissional", pages);
  const clarezaAgg = aggregateMultiChoice_ab_(records, "clareza", pages);
  const catAgg     = aggregateByCategory_ab_(records, gabarito.answers, categories);

  // Prepara aba de análise
  const sheet = getOrCreateSheet_ab_(ss, CFG_AB.ANALYSIS_SHEET_NAME);
  sheet.clear();
  removeAllCharts_ab_(sheet);

  // ── Cabeçalho geral
  sheet.getRange(1, 1)
    .setValue("IF006 — Análise A/B: Inspeção de Código")
    .setFontSize(13)
    .setFontWeight("bold");
  sheet.getRange(2, 1).setValue("Atualizado em:");
  sheet.getRange(2, 2).setValue(new Date()).setNumberFormat("dd/mm/yyyy HH:mm");

  // ── Seção 1: Acertos de saída
  let row = 4;
  const s1 = writeSaidaTable_ab_(sheet, row, saidaAgg, pages, categories);
  row = s1.nextRow + 2;

  // ── Seção 2: Distribuição — profissional
  const s2 = writeMultiChoiceTable_ab_(
    sheet, row, "profissional", MC_OPTIONS_AB.profissional, profAgg, pages, categories
  );
  row = s2.nextRow + 2;

  // ── Seção 3: Distribuição — clareza
  const s3 = writeMultiChoiceTable_ab_(
    sheet, row, "clareza", MC_OPTIONS_AB.clareza, clarezaAgg, pages, categories
  );
  row = s3.nextRow + 2;

  // ── Seção 4: Resumo por categoria
  const s4 = writeCategoryTable_ab_(sheet, row, catAgg);

  // ── Auto-resize das primeiras colunas
  sheet.autoResizeColumns(1, 16);

  // ── Gráficos (coluna P em diante)
  const CHART_COL = 17;
  buildCharts_ab_(sheet, CHART_COL, {
    saidaHeaderRow:   s1.headerRow,
    saidaDataStart:   s1.dataStart,
    saidaDataEnd:     s1.dataEnd,
    profHeaderRow:    s2.headerRow,
    profDataStart:    s2.dataStart,
    profDataEnd:      s2.dataEnd,
    clarezaHeaderRow: s3.headerRow,
    clarezaDataStart: s3.dataStart,
    clarezaDataEnd:   s3.dataEnd,
    catHeaderRow:     s4.headerRow,
    catDataStart:     s4.dataStart,
    catDataEnd:       s4.dataEnd,
  });

  SpreadsheetApp.getActive().toast(
    "Análise e gráficos gerados com sucesso.", "IF006", 5
  );
}

// ─────────────────────────────────────────────────────────────
// Escrita das tabelas
// ─────────────────────────────────────────────────────────────

/**
 * Escreve a tabela de acertos (questão de saída aberta).
 * Retorna { headerRow, dataStart, dataEnd, nextRow }.
 *
 * Colunas: pagina | categoria_A | categoria_B | total_A | acertos_A | pct_A | total_B | acertos_B | pct_B
 */
function writeSaidaTable_ab_(sheet, startRow, saidaAgg, pages, categories) {
  sheet.getRange(startRow, 1)
    .setValue("1. Acertos — questão de saída (resposta aberta)")
    .setFontWeight("bold")
    .setFontColor("#1a5276");

  const headerRow = startRow + 1;
  const headers = [
    "pagina", "categoria_A", "categoria_B",
    "total_A", "acertos_A", "pct_acerto_A",
    "total_B", "acertos_B", "pct_acerto_B",
  ];
  writeHeaderRow_ab_(sheet, headerRow, headers);

  const dataStart = headerRow + 1;
  const dataRows  = pages.map((p) => {
    const a   = saidaAgg[p].A;
    const b   = saidaAgg[p].B;
    const catA = getCategoryFor_ab_(categories, "A", p);
    const catB = getCategoryFor_ab_(categories, "B", p);
    return [
      pageLabel_ab_(p),
      catA,
      catB,
      a.total,
      a.correct,
      a.total > 0 && a.hasExpected ? a.correct / a.total : "",
      b.total,
      b.correct,
      b.total > 0 && b.hasExpected ? b.correct / b.total : "",
    ];
  });
  const dataEnd = dataStart + dataRows.length - 1;

  if (dataRows.length > 0) {
    sheet.getRange(dataStart, 1, dataRows.length, headers.length).setValues(dataRows);
    // pct_acerto_A = col 6, pct_acerto_B = col 9
    sheet.getRange(dataStart, 6, dataRows.length, 1).setNumberFormat("0.0%");
    sheet.getRange(dataStart, 9, dataRows.length, 1).setNumberFormat("0.0%");
  }

  return { headerRow, dataStart, dataEnd, nextRow: dataEnd + 1 };
}

/**
 * Escreve a tabela de distribuição de uma questão de múltipla escolha.
 * Retorna { headerRow, dataStart, dataEnd, nextRow }.
 *
 * Colunas: pagina | categoria_A | categoria_B |
 *   opt1_A  opt2_A  ...  opt1_B  opt2_B  ... |
 *   pct_opt1_A  pct_opt2_A  ...  pct_opt1_B  pct_opt2_B  ...
 */
function writeMultiChoiceTable_ab_(sheet, startRow, qType, options, agg, pages, categories) {
  const sectionNum = qType === "profissional" ? "2" : "3";
  const label      = qType === "profissional" ? "profissional" : "clareza";

  sheet.getRange(startRow, 1)
    .setValue(`${sectionNum}. Distribuição de opções — ${label}`)
    .setFontWeight("bold")
    .setFontColor("#1a5276");

  const headerRow = startRow + 1;
  const headers   = ["pagina", "categoria_A", "categoria_B"];
  options.forEach((opt) => headers.push(normOpt_ab_(opt) + "_A"));
  options.forEach((opt) => headers.push(normOpt_ab_(opt) + "_B"));
  options.forEach((opt) => headers.push("pct_" + normOpt_ab_(opt) + "_A"));
  options.forEach((opt) => headers.push("pct_" + normOpt_ab_(opt) + "_B"));
  writeHeaderRow_ab_(sheet, headerRow, headers);

  const dataStart = headerRow + 1;
  const dataRows  = pages.map((p) => {
    const a      = agg[p].A;
    const b      = agg[p].B;
    const catA   = getCategoryFor_ab_(categories, "A", p);
    const catB   = getCategoryFor_ab_(categories, "B", p);
    const totalA = options.reduce((s, opt) => s + (a[opt] || 0), 0);
    const totalB = options.reduce((s, opt) => s + (b[opt] || 0), 0);

    const row = [pageLabel_ab_(p), catA, catB];
    options.forEach((opt) => row.push(a[opt] || 0));
    options.forEach((opt) => row.push(b[opt] || 0));
    options.forEach((opt) => row.push(totalA > 0 ? (a[opt] || 0) / totalA : ""));
    options.forEach((opt) => row.push(totalB > 0 ? (b[opt] || 0) / totalB : ""));
    return row;
  });
  const dataEnd = dataStart + dataRows.length - 1;

  if (dataRows.length > 0) {
    sheet.getRange(dataStart, 1, dataRows.length, headers.length).setValues(dataRows);
    // Colunas de percentual: após pagina(1) + categoria_A(1) + categoria_B(1) + contagens_A(n) + contagens_B(n)
    const pctStartCol = 4 + 2 * options.length;
    const pctColCount = 2 * options.length;
    sheet
      .getRange(dataStart, pctStartCol, dataRows.length, pctColCount)
      .setNumberFormat("0.0%");
  }

  return { headerRow, dataStart, dataEnd, nextRow: dataEnd + 1 };
}

/**
 * Escreve a tabela de resumo por categoria.
 * Retorna { headerRow, dataStart, dataEnd, nextRow }.
 *
 * Colunas: categoria | paginas | pct_acerto_saida_A | pct_acerto_saida_B |
 *   pct_prof_Sim_A | pct_prof_Sim_B | pct_clareza_Sim_A | pct_clareza_Sim_B
 */
function writeCategoryTable_ab_(sheet, startRow, catAgg) {
  sheet.getRange(startRow, 1)
    .setValue("4. Resumo por categoria")
    .setFontWeight("bold")
    .setFontColor("#6e2c00");

  const categories = Object.keys(catAgg).sort();

  if (categories.length === 0) {
    sheet.getRange(startRow + 1, 1)
      .setValue("(Nenhuma categoria definida. Preencha a coluna F do gabarito.)")
      .setFontStyle("italic")
      .setFontColor("#999");
    return { headerRow: startRow + 1, dataStart: startRow + 2, dataEnd: startRow + 1, nextRow: startRow + 3 };
  }

  const profOpts = MC_OPTIONS_AB.profissional;
  const clzOpts  = MC_OPTIONS_AB.clareza;

  const headers = ["categoria", "paginas", "paginas_A", "paginas_B"];
  headers.push("pct_acerto_saida_A", "pct_acerto_saida_B");
  profOpts.forEach((opt) => { headers.push("pct_prof_" + normOpt_ab_(opt) + "_A"); headers.push("pct_prof_" + normOpt_ab_(opt) + "_B"); });
  clzOpts.forEach((opt)  => { headers.push("pct_clz_"  + normOpt_ab_(opt) + "_A"); headers.push("pct_clz_"  + normOpt_ab_(opt) + "_B"); });

  const headerRow = startRow + 1;
  writeHeaderRow_ab_(sheet, headerRow, headers, "#fde8d8");

  const dataStart = headerRow + 1;
  const dataRows = categories.map((cat) => {
    const d = catAgg[cat];
    const row = [
      cat,
      d.pageGroups.size,
      d.pagesA.size,
      d.pagesB.size,
      d.saida.A.total > 0 && d.saida.A.hasExpected ? d.saida.A.correct / d.saida.A.total : "",
      d.saida.B.total > 0 && d.saida.B.hasExpected ? d.saida.B.correct / d.saida.B.total : "",
    ];
    profOpts.forEach((opt) => {
      const tA = profOpts.reduce((s, o) => s + (d.prof.A[o] || 0), 0);
      const tB = profOpts.reduce((s, o) => s + (d.prof.B[o] || 0), 0);
      row.push(tA > 0 ? (d.prof.A[opt] || 0) / tA : "");
      row.push(tB > 0 ? (d.prof.B[opt] || 0) / tB : "");
    });
    clzOpts.forEach((opt) => {
      const tA = clzOpts.reduce((s, o) => s + (d.clz.A[o] || 0), 0);
      const tB = clzOpts.reduce((s, o) => s + (d.clz.B[o] || 0), 0);
      row.push(tA > 0 ? (d.clz.A[opt] || 0) / tA : "");
      row.push(tB > 0 ? (d.clz.B[opt] || 0) / tB : "");
    });
    return row;
  });

  const dataEnd = dataStart + dataRows.length - 1;

  if (dataRows.length > 0) {
    sheet.getRange(dataStart, 1, dataRows.length, headers.length).setValues(dataRows);
    // pct cols: 5 em diante
    const pctCount = headers.length - 4;
    sheet
      .getRange(dataStart, 5, dataRows.length, pctCount)
      .setNumberFormat("0.0%");
  }

  return { headerRow, dataStart, dataEnd, nextRow: dataEnd + 1 };
}

// ─────────────────────────────────────────────────────────────
// Gráficos
// ─────────────────────────────────────────────────────────────

/**
 * Cria os gráficos na aba de análise.
 *
 * Todos os gráficos são gerados por categoria (não por página):
 * 1) Acerto de saída por categoria (A vs B)
 * 2) Profissional por categoria — Grupo A (100% empilhado)
 * 3) Profissional por categoria — Grupo B (100% empilhado)
 * 4) Clareza por categoria — Grupo A (100% empilhado)
 * 5) Clareza por categoria — Grupo B (100% empilhado)
 */
function buildCharts_ab_(sheet, chartCol, pos) {
  const {
    catHeaderRow,   catDataStart,   catDataEnd,
  } = pos;

  const nProf = MC_OPTIONS_AB.profissional.length;
  const nClz  = MC_OPTIONS_AB.clareza.length;

  // Número de linhas = 1 (header) + N categorias
  const catRows     = catDataEnd     - catDataStart     + 2;

  // Tabela de categoria:
  // categoria(1), paginas(2), paginas_A(3), paginas_B(4), pct_saida_A(5), pct_saida_B(6),
  // prof: [opt1_A(7), opt1_B(8), opt2_A(9), opt2_B(10), ...]
  // clareza inicia em: 7 + 2*nProf

  if (catRows > 1 && catDataEnd >= catDataStart) {
    // 1) Acertos por categoria: A vs B
    const cCatSaida = sheet.newChart()
      .asColumnChart()
      .addRange(sheet.getRange(catHeaderRow, 1, catRows, 1)) // categoria
      .addRange(sheet.getRange(catHeaderRow, 5, catRows, 1)) // pct_acerto_saida_A
      .addRange(sheet.getRange(catHeaderRow, 6, catRows, 1)) // pct_acerto_saida_B
      .setPosition(1, chartCol, 0, 0)
      .setOption("title", "Acertos de saída por categoria: A vs B")
      .setOption("vAxis.format", "0%")
      .setOption("vAxis.minValue", 0)
      .setOption("vAxis.maxValue", 1)
      .build();
    sheet.insertChart(cCatSaida);

    // 2) Profissional por categoria — Grupo A (100% empilhado)
    const profStart = 7;
    const cCatProfABuilder = sheet.newChart()
      .asBarChart()
      .addRange(sheet.getRange(catHeaderRow, 1, catRows, 1)) // categoria
      .setPosition(17, chartCol, 0, 0)
      .setOption("title", "Experiência profissional por categoria — Grupo A")
      .setOption("isStacked", "percent");
    for (let i = 0; i < nProf; i++) {
      cCatProfABuilder.addRange(sheet.getRange(catHeaderRow, profStart + 2 * i, catRows, 1));
    }
    sheet.insertChart(cCatProfABuilder.build());

    // 3) Profissional por categoria — Grupo B (100% empilhado)
    const cCatProfBBuilder = sheet.newChart()
      .asBarChart()
      .addRange(sheet.getRange(catHeaderRow, 1, catRows, 1)) // categoria
      .setPosition(33, chartCol, 0, 0)
      .setOption("title", "Experiência profissional por categoria — Grupo B")
      .setOption("isStacked", "percent");
    for (let i = 0; i < nProf; i++) {
      cCatProfBBuilder.addRange(sheet.getRange(catHeaderRow, profStart + 2 * i + 1, catRows, 1));
    }
    sheet.insertChart(cCatProfBBuilder.build());

    // 4) Clareza por categoria — Grupo A (100% empilhado)
    const clzStart = 7 + 2 * nProf;
    const cCatClzABuilder = sheet.newChart()
      .asBarChart()
      .addRange(sheet.getRange(catHeaderRow, 1, catRows, 1))
      .setPosition(49, chartCol, 0, 0)
      .setOption("title", "Clareza do código por categoria — Grupo A")
      .setOption("isStacked", "percent");
    for (let i = 0; i < nClz; i++) {
      cCatClzABuilder.addRange(sheet.getRange(catHeaderRow, clzStart + 2 * i, catRows, 1));
    }
    sheet.insertChart(cCatClzABuilder.build());

    // 5) Clareza por categoria — Grupo B (100% empilhado)
    const cCatClzBBuilder = sheet.newChart()
      .asBarChart()
      .addRange(sheet.getRange(catHeaderRow, 1, catRows, 1))
      .setPosition(65, chartCol, 0, 0)
      .setOption("title", "Clareza do código por categoria — Grupo B")
      .setOption("isStacked", "percent");
    for (let i = 0; i < nClz; i++) {
      cCatClzBBuilder.addRange(sheet.getRange(catHeaderRow, clzStart + 2 * i + 1, catRows, 1));
    }
    sheet.insertChart(cCatClzBBuilder.build());
  }
}

// ─────────────────────────────────────────────────────────────
// Parsing & agregação
// ─────────────────────────────────────────────────────────────

/**
 * Converte as linhas brutas da planilha de respostas em registros estruturados.
 *
 * Cada registro representa uma página (P01, P02, …) de um aluno:
 * {
 *   grupo, pageNum,
 *   saidaId, saidaResposta, saidaTempo, saidaConfianca,
 *   profissionalResposta, clarezaResposta
 * }
 */
function parseResponses_ab_(headers, rows) {
  // Índice de coluna por nome de cabeçalho
  const headerIdx = {};
  headers.forEach((h, i) => { headerIdx[String(h)] = i; });

  const records = [];

  rows.forEach((row) => {
    const grupo = String(row[headerIdx["grupo"]] || "").toUpperCase().trim();
    if (!grupo) return;

    // Agrupa questões sequenciais por número de página
    const pageMap = {};

    headers.forEach((h, colIdx) => {
      const seqMatch = String(h).match(/^q(\d+)_id$/);
      if (!seqMatch) return;
      const seq = seqMatch[1];

      const qId = String(row[colIdx] || "").trim();
      if (!qId) return;

      // ID esperado: "[A|B]NN_tipo"  (ex.: A01_saida, B02_profissional)
      const idMatch = qId.match(/^[AB](\d{2})_(.+)$/);
      if (!idMatch) return;

      const pageNum = Number(idMatch[1]);       // ex.: 1, 2, 3, 4
      const qType   = idMatch[2].toLowerCase(); // ex.: saida, profissional, clareza

      if (!pageMap[pageNum]) {
        pageMap[pageNum] = { pageNum, grupo };
      }

      const respostaKey = `q${seq}_resposta`;
      const resposta = String(row[headerIdx[respostaKey]] || "").trim();

      switch (qType) {
        case "saida":
          pageMap[pageNum].saidaId        = qId;
          pageMap[pageNum].saidaResposta  = resposta;
          pageMap[pageNum].saidaTempo     = toNumberOrBlank_ab_(row[headerIdx[`q${seq}_tempo_s`]]);
          pageMap[pageNum].saidaConfianca = toNumberOrBlank_ab_(row[headerIdx[`q${seq}_confianca`]]);
          break;
        case "profissional":
          pageMap[pageNum].profissionalResposta = resposta;
          break;
        case "clareza":
          pageMap[pageNum].clarezaResposta = resposta;
          break;
      }
    });

    Object.values(pageMap).forEach((rec) => records.push(rec));
  });

  return records;
}

function getSortedPages_ab_(records) {
  const pages = new Set(records.map((r) => r.pageNum));
  return [...pages].sort((a, b) => a - b);
}

/**
 * Agrega dados por categoria.
 * Retorna: { catLabel: { pageGroups: Set, pagesA: Set, pagesB: Set,
 *   saida: { A: { total, correct, hasExpected }, B: {…} },
 *   prof:  { A: { Sim: n, … }, B: {…} },
 *   clz:   { A: { Sim: n, … }, B: {…} } } }
 */
function aggregateByCategory_ab_(records, answers, categories) {
  const result = {};

  records.forEach((rec) => {
    const cat = getCategoryFor_ab_(categories, rec.grupo, rec.pageNum);
    if (!cat) return;

    if (!result[cat]) {
      result[cat] = {
        pageGroups: new Set(),
        pagesA: new Set(),
        pagesB: new Set(),
        saida: {
          A: { total: 0, correct: 0, hasExpected: false },
          B: { total: 0, correct: 0, hasExpected: false },
        },
        prof: { A: {}, B: {} },
        clz:  { A: {}, B: {} },
      };
    }

    const d = result[cat];
    d.pageGroups.add(pageGroupKey_ab_(rec.grupo, rec.pageNum));
    if (rec.grupo === "A") d.pagesA.add(rec.pageNum);
    if (rec.grupo === "B") d.pagesB.add(rec.pageNum);

    // Saída
    if (rec.saidaId) {
      const bucket = d.saida[rec.grupo];
      if (bucket) {
        bucket.total += 1;
        const expected = (answers[rec.saidaId] || "").trim();
        if (expected) {
          bucket.hasExpected = true;
          if (normalizeToken_ab_(rec.saidaResposta) === normalizeToken_ab_(expected)) {
            bucket.correct += 1;
          }
        }
      }
    }

    // Profissional
    if (rec.profissionalResposta && d.prof[rec.grupo] !== undefined) {
      const val = rec.profissionalResposta.trim();
      d.prof[rec.grupo][val] = (d.prof[rec.grupo][val] || 0) + 1;
    }

    // Clareza
    if (rec.clarezaResposta && d.clz[rec.grupo] !== undefined) {
      const val = rec.clarezaResposta.trim();
      d.clz[rec.grupo][val] = (d.clz[rec.grupo][val] || 0) + 1;
    }
  });

  return result;
}

/**
 * Agrega acertos da questão de saída por página e grupo.
 * Retorna: { pageNum: { A: { total, correct, hasExpected }, B: {…} } }
 */
function aggregateSaida_ab_(records, answers, pages) {
  const result = {};
  pages.forEach((p) => {
    result[p] = {
      A: { total: 0, correct: 0, hasExpected: false },
      B: { total: 0, correct: 0, hasExpected: false },
    };
  });

  records.forEach((rec) => {
    if (!rec.saidaId) return;
    const bucket = (result[rec.pageNum] || {})[rec.grupo];
    if (!bucket) return;

    bucket.total += 1;

    const expected = (answers[rec.saidaId] || "").trim();
    if (expected) {
      bucket.hasExpected = true;
      if (normalizeToken_ab_(rec.saidaResposta) === normalizeToken_ab_(expected)) {
        bucket.correct += 1;
      }
    }
  });

  return result;
}

/**
 * Agrega distribuição de uma questão de múltipla escolha por página e grupo.
 * Retorna: { pageNum: { A: { "Sim": count, … }, B: {…} } }
 */
function aggregateMultiChoice_ab_(records, qType, pages) {
  const field = qType === "profissional" ? "profissionalResposta" : "clarezaResposta";
  const result = {};
  pages.forEach((p) => { result[p] = { A: {}, B: {} }; });

  records.forEach((rec) => {
    const bucket = (result[rec.pageNum] || {})[rec.grupo];
    if (!bucket) return;
    const val = (rec[field] || "").trim();
    if (!val) return;
    bucket[val] = (bucket[val] || 0) + 1;
  });

  return result;
}

// ─────────────────────────────────────────────────────────────
// Auxiliares
// ─────────────────────────────────────────────────────────────

function readGabarito_ab_(ss) {
  const gabSheet = ss.getSheetByName(CFG_AB.GABARITO_SHEET_NAME);
  if (!gabSheet) return { answers: {}, categories: {} };

  const data = gabSheet.getDataRange().getValues();

  // Tabela de respostas corretas (colunas A-B)
  const answers = {};
  data.slice(1).forEach((row) => {
    const id  = String(row[0] || "").trim();
    const ans = String(row[1] || "").trim();
    if (id && ans) answers[id] = ans;
  });

  // Tabela de categorias por grupo+página (colunas D-F, índices 3-5)
  // grupo: A/B, pagina: "P01", "P02", etc.
  const categories = {};
  data.slice(1).forEach((row) => {
    const group   = String(row[3] || "").trim().toUpperCase();
    const pageStr = String(row[4] || "").trim().toUpperCase();
    const cat     = String(row[5] || "").trim();
    if (!group || !pageStr || !cat) return;
    const m = pageStr.match(/^P(\d+)$/i);
    if (m) categories[pageGroupKey_ab_(group, Number(m[1]))] = cat;
  });

  return { answers, categories };
}

function getResponsesSheet_ab_(ss) {
  if (CFG_AB.RESPONSES_SHEET_NAME) {
    return ss.getSheetByName(CFG_AB.RESPONSES_SHEET_NAME) || ss.getSheets()[0];
  }
  return ss.getSheets()[0];
}

function getOrCreateSheet_ab_(ss, name) {
  return ss.getSheetByName(name) || ss.insertSheet(name);
}

function removeAllCharts_ab_(sheet) {
  sheet.getCharts().forEach((c) => sheet.removeChart(c));
}

function writeHeaderRow_ab_(sheet, row, headers, bgColor) {
  const range = sheet.getRange(row, 1, 1, headers.length);
  range.setValues([headers]);
  range.setFontWeight("bold");
  range.setBackground(bgColor || "#d0e4f7");
  range.setBorder(true, true, true, true, null, null);
}

function normalizeToken_ab_(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

/** Converte espaços em underscore para usar como nome de coluna. */
function normOpt_ab_(opt) {
  return String(opt).replace(/\s+/g, "_");
}

function pageLabel_ab_(pageNum) {
  return "P" + String(pageNum).padStart(2, "0");
}

function pageGroupKey_ab_(group, pageNum) {
  return String(group || "").toUpperCase().trim() + "|" + String(Number(pageNum));
}

function getCategoryFor_ab_(categories, group, pageNum) {
  if (!categories) return "";
  return categories[pageGroupKey_ab_(group, pageNum)] || "";
}

function toNumberOrBlank_ab_(value) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  return isNaN(n) ? "" : n;
}
