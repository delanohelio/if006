/**
 * IF006 — Script para receber respostas dos formulários de inspeção de código.
 *
 * COMO USAR:
 * 1. Abra o Google Sheets onde quer salvar as respostas.
 * 2. Acesse Extensões > Apps Script.
 * 3. Cole este código, salve (Ctrl+S) e nomeie o projeto.
 * 4. Clique em "Implantar" > "Novo deploy":
 *      - Tipo: App da Web
 *      - Executar como: Eu (seu e-mail)
 *      - Quem tem acesso: Qualquer pessoa
 * 5. Autorize as permissões solicitadas.
 * 6. Copie o URL gerado e cole no campo "sheetsApiUrl" do JSON do formulário.
 *
 * TESTANDO:
 * Acesse o URL no navegador — você verá {"status":"ok","message":"API ativa."}.
 * Após submeter um formulário, verifique a planilha; uma nova linha será adicionada.
 *
 * ADICIONANDO NOVA PLANILHA POR FORMULÁRIO:
 * Altere SHEET_NAME abaixo para usar uma aba específica por formulário,
 * ou deixe em branco para usar a aba ativa.
 */

// (Opcional) Nome da aba da planilha. Deixe "" para usar a aba ativa.
var SHEET_NAME = "";

// ---------------------------------------------------------------------------

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok", message: "API ativa." }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    appendToSheet_(payload);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Achata o payload JSON em um objeto chave-valor e o adiciona à planilha.
 * Cria cabeçalhos automaticamente na primeira importação e adiciona
 * novas colunas conforme necessário em submissões futuras.
 */
function appendToSheet_(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = SHEET_NAME
    ? (ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME))
    : ss.getActiveSheet();

  // Monta o objeto achatado com todos os campos
  var row = {};
  row["recebido_em"]  = new Date().toISOString();
  row["formulario"]   = data.formId   || "";
  row["nome"]         = data.nome     || "";
  row["email"]        = data.email    || "";
  row["grupo"]        = data.grupo    || "";
  row["cpf_final"]    = (data.cpfFinal !== null && data.cpfFinal !== undefined) ? data.cpfFinal : "";
  row["inicio"]       = data.timestamp || "";

  if (Array.isArray(data.answers)) {
    data.answers.forEach(function(ans, idx) {
      var n = idx + 1;
      row["q" + n + "_id"]       = ans.questionId || "";
      row["q" + n + "_pagina"]   = ans.pageId     || "";
      row["q" + n + "_resposta"] = ans.value      !== undefined ? ans.value : "";

      if (ans.timeSec !== null && ans.timeSec !== undefined) {
        row["q" + n + "_tempo_s"] = ans.timeSec;
      }
      if (ans.confidence !== null && ans.confidence !== undefined) {
        row["q" + n + "_confianca"] = ans.confidence;
      }
    });
  }

  // Lê ou cria cabeçalhos
  var lastCol = sheet.getLastColumn();
  var headers;

  if (lastCol === 0 || sheet.getRange(1, 1).getValue() === "") {
    headers = Object.keys(row);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

    // Adiciona colunas novas que ainda não existem
    var allKeys = Object.keys(row);
    allKeys.forEach(function(key) {
      if (headers.indexOf(key) === -1) {
        headers.push(key);
        sheet.getRange(1, headers.length).setValue(key);
      }
    });
  }

  // Monta a linha de valores na ordem dos cabeçalhos e acrescenta
  var values = headers.map(function(h) {
    return row[h] !== undefined ? row[h] : "";
  });

  sheet.appendRow(values);
}
