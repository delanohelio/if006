# Roteiro do Aluno - Prática 2

## Laboratório Prático: Identificação de Átomos de Confusão por LLMs

**Disciplina:** IF1006 - Tópicos Avançados em SI 3  
**Tópico:** Code Review, Átomos de Confusão e Capacidade de Análise Semântica de LLMs

---

## Objetivo da Atividade

Avaliar a capacidade de diferentes LLMs em:

1. Reconhecer código com confusão cognitiva (átomos de confusão).
2. Reproduzir a funcionalidade usando um prompt específico.
3. Identificar e eliminar átomos de confusão do código gerado.
4. Comparar qualidade e profundidade entre diferentes modelos.

Baseado em: "Atoms of Confusion in Code" (https://arxiv.org/abs/2103.05424)

---

## Passo 1: Escolha do Código Base

Escolha dois dos 10 códigos com átomos de confusão em [codigos-atomos-confusao.md](codigos-atomos-confusao.md).

Regras para esta etapa:

1. Cada grupo escolhe apenas 2 códigos-bases (AC01 a AC10).
2. Use o mesmo código em todas as fases de review.
3. Para cada código, siga as 4 fases de análise e geração.
4. Registre no relatório, para cada código-base, qual foi escolhido.
5. Seu grupo vai enviar duas vezes o formulário de registro, uma para cada código-base escolhido.

Formulário de Registro de Atividade: [Formulário de Registro de Atividade](https://forms.gle/VXrfkngoguS8ASUw9)

---

## Regras de Execução (Obrigatórias)

1. Use o mesmo código-base em todas as fases.
2. Execute cada fase em chat novo/separado.
3. Faça pelo menos 1 iteração de melhoria (pedindo revisão da revisão).
4. Registre prompt usado e saída obtida em um documento do grupo.
5. Cronometrize quanto tempo cada análise levou.

---

## Passo 2: As 4 Fases da Prática

### Fase 1: Análise Genérica do Código Base

Prompt sugerido:

- "Revise este código e sugira melhorias."
- "Identifique problemas neste trecho de código."

O que observar:

- A LLM identifica átomos de confusão ou apenas sugere melhorias óbvias?
- As explicações são técnicas ou superficiais?

### Fase 2: Análise com Contexto Semântico

Prompt sugerido:

- "Este código foi escrito por um iniciante e gera confusão durante code review. Identifique cada ponto de confusão."
- "Revise este código focando em clareza semântica para um time que precisa manter este código."

O que observar:

- A LLM reconhece os átomos de confusão quando há contexto?
- A qualidade da explicação melhora?

### Fase 3: Geração de Código com Prompt Sugerido

Use o **prompt sugerido** listado em cada código em [codigos-atomos-confusao.md](codigos-atomos-confusao.md).

Exemplo: Para AC01, o prompt é: "Escreva um método que conte quantos números em um array são positivos. Use um loop for que itere sobre o array e acumule o resultado em uma variável usando um operador ternário."

Instruções:

1. Copie exatamente o prompt sugerido no arquivo de códigos.
2. Peça para a LLM gerar o código com esse prompt.
3. Registre a saída completa.
4. Compare com o código-base original: são equivalentes?

O que observar:

- O código gerado tem a mesma lógica?
- O código gerado tem átomos de confusão semelhantes?
- A LLM reproduz padrões confusos quando solicitado?

### Fase 4: Revisão e Melhoria do Código Gerado

Prompt sugerido:

- "Revise este código e sugira melhorias para aumentar a qualidade e a legibilidade."
- "Refatore este código para deixá-lo mais claro e mais fácil de manter."

Instruções:

1. Forneça à LLM o código gerado na Fase 3.
2. Peça uma revisão focada em qualidade geral (sem mencionar "átomos de confusão").
3. Deixe a LLM propor refatorações naturalmente.
4. Registre a saída e o código refatorado.

O que observar:

- Quais melhorias a LLM propõe naturalmente?
- O código refatorado preserva a lógica original?
- A refatoração melhora a clareza? Em que aspectos?
- A LLM elimina confusão mesmo sem ser instruída explicitamente?

---

## Passo 3: Tabela de Auditoria - Átomos de Confusão Identificados

Marque com **SIM** ou **NÃO** se o átomo estava presente em cada fase.

| Tipo de Átomo | Fase 1 | Fase 2 | Fase 3 | Fase 4 | Observações |
| --- | --- | --- | --- | --- | --- |
| Conversão implícita de tipo | [ ] | [ ] | [ ] | [ ] | |
| Precedência de operador não-óbvia | [ ] | [ ] | [ ] | [ ] | |
| Pre/pós-incremento em expressão | [ ] | [ ] | [ ] | [ ] | |
| Ternário aninhado | [ ] | [ ] | [ ] | [ ] | |
| Variable shadowing | [ ] | [ ] | [ ] | [ ] | |
| Efeito colateral em condição | [ ] | [ ] | [ ] | [ ] | |
| Atribuição em condição (vs comparação) | [ ] | [ ] | [ ] | [ ] | |
| Precedência de concatenação vs operação | [ ] | [ ] | [ ] | [ ] | |
| Off-by-one ou iteração confusa | [ ] | [ ] | [ ] | [ ] | |
| Dupla negação ou booleano denso | [ ] | [ ] | [ ] | [ ] | |

---

## Passo 3.1: Avaliação Descritiva da Qualidade do Código

Responda para cada fase (máx. 3-4 linhas por fase):

**Fase 1 - Código-base Original:**
- O que torna este código confuso? Qual é o impacto para manutenção?

**Fase 3 - Código Gerado:**
- O código gerado é funcionalmente equivalente ao original?
- Quais padrões confusos o LLM replicou?
- Quais padrões o LLM evitou ou modificou?

**Fase 4 - Código Refatorado (SEM menção a "átomos"):**
- Que tipos de melhoria a LLM propôs? (renomeação, extração de métodos, simplificação de lógica, etc.)
- O código refatorado é mais claro? Em quais aspectos?
- A LLM conseguiu reconhecer e eliminar confusão mesmo sem ser instruída explicitamente?

**Conclusão sobre Qualidade:**
- Qual LLM produziu as melhores refatorações?
- Quais melhorias fizeram maior diferença na clareza?

---

## Passo 3.2: LLMs Disponíveis

### Chats web para usar na atividade

- ChatGPT (OpenAI): https://chatgpt.com
- Gemini (Google): https://gemini.google.com
- Claude (Anthropic): https://claude.ai
- Microsoft Copilot: https://copilot.microsoft.com
- Perplexity: https://www.perplexity.ai
- Z.ai Chat: https://chat.z.ai
- Grok (xAI): https://grok.com
- DeepSeek Chat: https://chat.deepseek.com
- Qwen Chat (Alibaba): https://chat.qwen.ai
- Kimi (Moonshot AI): https://kimi.moonshot.cn

### Opcional para casa

- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Hugging Face: https://huggingface.co/models
- OpenRouter: https://openrouter.ai

---

## Entrega Final

1. Código-base original escolhido (AC01 a AC10).
2. Tabela de auditoria preenchida com SIM/NÃO para cada átomo em cada fase.
3. Avaliação descritiva de qualidade para Fases 1, 3 e 4.
4. Código gerado na Fase 3 e código refatorado na Fase 4.
5. Comparação entre LLMs testados: qual foi melhor em geração e refatoração?
6. Conclusão: Qual é a capacidade real de LLMs em eliminar confusão cognitiva de código?
