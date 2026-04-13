# Publicacao - Inspecao de Codigo

Esta pasta contem a versao web da atividade para uso no GitHub Pages.

## O que a pagina faz

- define o grupo automaticamente pelo ultimo digito do CPF
- exibe as questoes em fluxo sequencial (sem botao de voltar)
- mede tempo apenas da resposta de saida
- coleta confianca (1 a 5) junto com a resposta de saida
- oculta o codigo na Pergunta 2 (variavel)
- na Pergunta 2, a verificacao de variavel considera o codigo inteiro
- ao final, mostra todos os valores para copiar e preencher no formulario
- permite marcar formularios como habilitados ou desabilitados no catalogo, com indicacao visual na tela inicial
- salva progresso parcial no navegador para retomar a atividade depois
- no dashboard, converte respostas de opcao para valor numerico (com mapeamento configuravel) para gerar histograma, box-plot e resumo estatistico
- no dashboard, possui pagina de resumo geral com tabela por questao, ordenacao por coluna e exportacao CSV
- na nuvem de palavras, permite filtrar comentarios por respostas de outras questoes da mesma pagina (um ou mais valores)
- em cada pagina de resultados, pode exportar um pacote ZIP com snippets, metadados e respostas anonimizadas (quando habilitado no JSON)

## Mapeamento resposta -> numero

Quando uma resposta nao for numerica (ex.: "Ruim", "Bom", "Sim"), voce pode definir o mapeamento no JSON do formulario.

Exemplo no nivel do formulario:

```json
"numericResponseMap": {
	"ruim": 2,
	"bom": 4,
	"sim": 1,
	"nao": 0
}
```

Exemplo por questao especifica:

```json
"numericResponseMapByQuestion": {
	"S01_opiniao": {
		"1-pessimo": 1,
		"2-ruim": 2,
		"3-regular": 3,
		"4-bom": 4,
		"5-excelente": 5
	}
}
```

Regras do dashboard:

- primeiro tenta ler a resposta como numero (ex.: "3" ou "3.5")
- depois tenta mapeamento por questao
- depois tenta mapeamento global do formulario
- por fim, usa o indice das opcoes da questao (1, 2, 3, ...)

Respostas sem mapeamento valido ficam de fora dos graficos numericos e aparecem no total "nao mapeadas" do resumo estatistico.

## Filtro da nuvem de palavras

Na tela de uma pagina do dashboard:

- selecione a "Questao de filtro" (por exemplo, a questao de opiniao)
- selecione um ou mais valores
- a nuvem exibira apenas os comentarios das submissões que possuem aqueles valores

Observacao importante: para cruzamento completo entre questoes e comentarios, atualize o Apps Script usando o arquivo `forms/script-planilha.gs` e publique um novo deploy. Isso faz o endpoint `action=data` retornar as respostas anonimizadas por submissao.

## Toggle de exportacao de pacote

No JSON do formulario, use:

```json
"resultsPackageEnabled": true
```

Se estiver `false` (ou ausente), o botao de "Baixar pacote de resultados (ZIP)" nao aparece na tela de cada pagina.

Conteudo do ZIP:

- `snippets/` com os codigos de cada snippet (ou arquivo texto quando nao houver codigo)
- `metadata/snippets.csv` com descricao e metadados das paginas
- `metadata/questions.csv` com definicao das questoes
- `responses/respostas.csv` com uma linha por participante anonimo e uma coluna por questao
- `manifest.json` com resumo da exportacao

## Execucao local

Abra o arquivo `index.html` no navegador.

## Publicacao no GitHub Pages

Opcao 1 (recomendada):

1. Em Settings > Pages, selecione `Deploy from a branch`.
2. Escolha branch `main` e pasta `docs`.
3. Salve.

A URL publica ficara em formato:

`https://SEU-USUARIO.github.io/NOME-DO-REPO/inspecao-codigo/`

Observacao: O caminho final usa a pasta `docs/inspecao-codigo`.

URL desta disciplina:

`https://delanohelio.github.io/if006/inspecao-codigo/`
