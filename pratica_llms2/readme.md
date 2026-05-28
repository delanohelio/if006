# Prática 2: Geração e Refatoração de Código com Átomos de Confusão

Este material foi dividido em três arquivos:

1. [roteiro-aluno.md](roteiro-aluno.md) - versão operacional para execução da atividade.
2. [roteiro-professor.md](roteiro-professor.md) - versão de condução, avaliação e fechamento.
3. [codigos-atomos-confusao.md](codigos-atomos-confusao.md) - 10 códigos com funcionalidades reais, nomes significativos + prompts sugeridos para geração.

---

## O que são Átomos de Confusão?

"Atoms of Confusion" são padrões de código que:

- São **sintaticamente corretos** (compilam e executam).
- Causam **confusão cognitiva** em revisão de código humana.
- Incluem: precedência implícita, conversões implícitas, variable shadowing, efeitos colaterais, operadores densos, etc.

Referência: https://arxiv.org/abs/2103.05424

---

## Objetivo da Prática

Avaliar a capacidade de diferentes LLMs em:

1. **Reconhecer** código com confusão cognitiva (sem ser instruído explicitamente).
2. **Reproduzir** funcionalidade usando um prompt natural (replicam ou evitam átomos?).
3. **Refatorar** código genericamente para melhorar qualidade (reconhecem confusão naturalmente?).
4. **Comparar** qualidade entre diferentes modelos.

---

## Estrutura das 4 Fases

| Fase | Tarefa | Objetivo | Métrica |
| --- | --- | --- | --- |
| 1 | Analisar código-base genericamente | Entender confusão inicial | Quais padrões são óbvios? |
| 2 | Analisar com contexto semântico | Aprofundar análise | Contexto muda a profundidade? |
| 3 | Gerar código com prompt natural | Testar replicação de confusão | LLM replica ou evita padrões? |
| 4 | Refatorar SEM mencionar "átomos" | Testar reconhecimento automático | Melhora naturalmente confusão? |

---

## Como Usar

1. Compartilhe [roteiro-aluno.md](roteiro-aluno.md) com a turma.
2. Distribua um código (AC01-AC10) para cada grupo.
3. Use [roteiro-professor.md](roteiro-professor.md) como guia de mediação.
4. Colete resultados com o script Google Form.

---

## Diferença em Relação à Prática 1

| Aspecto | Prática 1 (Refatora) | Prática 2 (Gera e Refatora) |
| --- | --- | --- |
| **Foco** | Comparar qualidade de refatoração | Capacidade de gerar claro + reconhecimento natural de confusão |
| **Código-base** | Código "normal" | Código **deliberadamente confuso** com **funcionalidade realista** |
| **Fase 3** | Revisão com contexto explícito | **Gerar com prompt NATURAL** (sem mencionar confusão) |
| **Fase 4** | Refatoração sênior estruturada | **Refatoração genérica** (ver o que LLM faz naturalmente) |
| **Métrica** | Qualidade da análise | Fidelidade funcional + reconhecimento automático de confusão |


