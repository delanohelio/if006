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
3. Nas Fases 1 e 2, sempre copie e cole o código-base junto com o prompt.
4. Na Fase 3, não cole o código-base: use apenas o prompt sugerido do exercício.
5. Na Fase 4, use o código gerado na Fase 3 como entrada da revisão/refatoração.
6. Faça pelo menos 1 iteração de melhoria (pedindo revisão da revisão).
7. Registre prompt usado e saída obtida em um documento do grupo.
8. Cronometrize quanto tempo cada análise levou.

---

## Passo 2: As 4 Fases da Prática

### Fase 1: Análise Genérica do Código Base

Como executar:

1. Copie e cole o código-base completo no chat.
2. Cole o prompt de análise na mesma mensagem (ou logo em seguida), junto com o código.
3. Não envie apenas o prompt: o código-base deve estar sempre presente nesta fase.

Prompt sugerido:

- "Revise este código e sugira melhorias."
- "Identifique problemas neste trecho de código."

O que observar:

- A LLM identifica átomos de confusão ou apenas sugere melhorias óbvias?
- As explicações são técnicas ou superficiais?

### Fase 2: Análise com Contexto Semântico

Como executar:

1. Abra um novo chat para esta fase.
2. Copie e cole novamente o código-base completo.
3. Envie o prompt semântico junto com o código-base (não envie só o texto do prompt).

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
2. Não cole o código-base nesta fase; envie apenas o prompt sugerido.
3. Peça para a LLM gerar o código com esse prompt.
4. Registre a saída completa.
5. Compare com o código-base original: são equivalentes?

O que observar:

- O código gerado tem a mesma lógica?
- O código gerado tem átomos de confusão semelhantes?
- A LLM reproduz padrões confusos quando solicitado?

### Fase 4: Revisão e Melhoria do Código Gerado

Prompt sugerido:

- "Revise este código e sugira melhorias para aumentar a qualidade e a legibilidade."
- "Refatore este código para deixá-lo mais claro e mais fácil de manter."

Instruções:

1. Forneça à LLM o código gerado na Fase 3 (copie e cole esse código no chat).
2. Peça uma revisão focada em qualidade geral (sem mencionar "átomos de confusão").
3. Não envie o código-base original nesta fase; use apenas o código gerado na Fase 3.
4. Deixe a LLM propor refatorações naturalmente.
5. Registre a saída e o código refatorado.

O que observar:

- Quais melhorias a LLM propõe naturalmente?
- O código refatorado preserva a lógica original?
- A refatoração melhora a clareza? Em que aspectos?
- A LLM elimina confusão mesmo sem ser instruída explicitamente?

---


## Chats web para usar na atividade

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

