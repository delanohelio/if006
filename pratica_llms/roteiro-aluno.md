# Roteiro do Aluno

## Laboratório Prático: O Teste de Estresse Semântico em LLMs

**Disciplina:** IF1006 - Tópicos Avançados em SI 3  
**Tópico:** Revisão de Código, Legibilidade vs. Leiturabilidade e o Paradoxo da Automação

---

## Objetivo da Atividade
Você vai avaliar como diferentes prompts mudam a qualidade da refatoração feita por LLMs, com foco em:

1. Clareza semântica (entender o negócio).
2. Carga cognitiva de leitura/manutenção.
3. Diferença entre codigo "bonito" e codigo realmente compreensível.

---

## Formulário para Registrar Prompts e Respostas
Ao executar cada fase, registre o prompt usado, a resposta obtida e o tempo gasto para entender a solução. Use um documento compartilhado com seu grupo. Depois preencha esse formulário:
[Formulário de Registro de Atividade](https://forms.gle/VFkK8vR6djjUBopt9)

## Passo 1: Escolha do Código Base

Escolha um dos 10 códigos-base em [codigos-base.md](codigos-base.md).

Regras para esta etapa:

1. Cada grupo escolhe apenas 1 código-base (CB01 a CB10).
2. O mesmo código-base deve ser usado em todas as fases de prompt.
3. Registre no relatório qual código-base foi escolhido.

---

## Regras de Execução (Obrigatórias)

1. Use o mesmo código-base em todas as fases.
2. Execute cada fase em chat novo/separado.
3. Faça pelo menos 1 iteração de melhoria após a primeira resposta.
4. Registre prompt usado e saída obtida em um documento do grupo.
5. Anote quanto tempo o grupo levou para entender cada solução.

---

## Passo 2: As 4 Fases de Prompt

### Fase 1: Zero Contexto

Prompt sugerido:

- "Refatore este código."
- "Escreva uma versão melhor deste código."

Variações:

- "Melhore este código sem alterar o comportamento."
- "Faça uma refatoração simples e curta deste método."
- "Organize este código para ficar mais limpo."

O que observar:

- Costuma melhorar estrutura, mas manter nomes ruins e números mágicos.

### Fase 2: Modernização

Prompt sugerido:

- "Reescreva este código usando os recursos mais modernos do Java e otimize-o."

Variações:

- "Converta para Streams e reduza o número de linhas ao máximo."
- "Escreva no estilo mais funcional possível."
- "Faça uma versão elegante com lambda e expressões compactas."

Exemplo de armadilha comum:

```java
public double process(List<Product> pList, int cType, boolean flag) {
    return pList == null ? 0.0 : pList.stream()
        .filter(p -> p.getStatus() == 1)
        .mapToDouble(p -> cType == 2 ? p.getVal() * 0.85 : (cType == 1 && flag ? p.getVal() * 0.90 : p.getVal()))
        .sum();
}
```

O que observar:

- Codigo mais curto, mas mais denso e mais difícil de manter.

### Fase 3: Superficial (Estética)

Prompt sugerido:

- "Deixe este código altamente legível."

Variações:

- "Adicione comentários explicando cada parte do código."
- "Padronize nomes e formatação para ficar mais claro."
- "Torne o método mais didático para iniciantes."

O que observar:

- Pode gerar excesso de comentários óbvios sem melhorar semântica.

### Fase 4: Engenharia Cognitiva (IF1006)

Prompt sugerido:

- "Atue como um Revisor de Código Sênior. Este código calcula o total de um carrinho de compras. Identifique os problemas de Carga Cognitiva Estranha, sugira nomes semânticos para as variáveis (baseado no domínio de E-commerce), remova os números mágicos extraindo-os para constantes e desfaça qualquer Complexidade Ciclomática desnecessária. Explique o porquê de cada mudança focando na leiturabilidade humana."

Variações:

- "Refatore para maximizar Understandability. Mantenha Java simples (sem Streams), extraia regras de desconto para métodos nomeados por domínio e explique trade-offs."
- "Quero código para manutenção de longo prazo por equipe júnior. Priorize clareza semântica, nomes de negócio e testes de unidade sugeridos."
- "Reescreva este método com cláusulas de guarda, constantes semânticas e justificativa de cada decisão de design."

O que observar:

- Melhor relação entre clareza, semântica e facilidade de manutenção.

---

## Passo 2.1: Banco de Prompts Extras

### A. Restrição Técnica

- "Refatore sem usar Streams, sem ternário e sem criar novas dependências."
- "Mantenha assinatura pública do método e o comportamento externo idêntico."

### B. Domínio

- "Considere que status=1 significa ITEM_ATIVO, cType=2 significa CLIENTE_VIP e flag indica cupom promocional. Reescreva com esses conceitos explícitos."
- "Explique como a regra de desconto poderia mudar se houver frete grátis para VIP."

### C. Qualidade da Explicação

- "Liste as 5 principais mudanças e para cada uma informe: problema original, risco de manutenção e ganho esperado."
- "Explique sua refatoração para um novo membro da equipe que vai manter esse código por 1 ano."

### D. Autoauditoria

- "Faça uma crítica da sua própria solução: aponte 3 fragilidades e proponha correções."
- "Sua refatoração ainda tem números mágicos ou nomes genéricos? Revise e corrija."

### E. Testes

- "Crie uma lista de casos de teste de unidade para validar todas as regras de desconto e o filtro de status."
- "Escreva testes JUnit 5 cobrindo cenários normais, borda e inválidos para esse método."

---

## Passo 2.2: Follow-ups Recomendados

Use após a primeira resposta da IA:

1. "Mostre o antes/depois apenas dos nomes que você renomeou e justifique cada um."
2. "Se eu mudar a regra de desconto de VIP de 15% para 12%, em quais pontos do código isso impacta?"
3. "Identifique trechos que parecem elegantes, mas reduzem leiturabilidade para humanos."
4. "Reescreva sua solução para um time que prefere simplicidade a concisão."
5. "Dê uma nota de 0-10 para Understandability da sua resposta e justifique."

---

## Passo 3: Tabela de Auditoria

Marque com [X] as falhas que permaneceram em cada fase.

| Falhas de Manutenibilidade | Fase 1 (Zero Contexto) | Fase 2 (Moderno/Streams) | Fase 3 (Legível/Comentado) | Fase 4 (Eng. Cognitiva) |
| --- | --- | --- | --- | --- |
| Nomes Crípticos mantidos (cType, t, pList) | [ ] | [ ] | [ ] | [ ] |
| Números Mágicos mantidos (1, 0.85, 2) | [ ] | [ ] | [ ] | [ ] |
| Ruído Visual (Excesso de comentários óbvios) | [ ] | [ ] | [ ] | [ ] |
| Alta Densidade Lógica (Ternários/Streams confusos) | [ ] | [ ] | [ ] | [ ] |
| Baixa Leiturabilidade (difícil alterar regras) | [ ] | [ ] | [ ] | [ ] |

---

## Passo 3.1: Rubrica de Comparação entre LLMs

Use 0, 1 ou 2 por critério.

| Critério | 0 pontos | 1 ponto | 2 pontos |
| --- | --- | --- | --- |
| Semântica de Domínio | Ignora termos de negócio | Parcial | Explicita domínio com clareza |
| Nomes e Constantes | Mantém nomes fracos e mágicos | Melhora parcialmente | Nomes e constantes consistentes |
| Clareza de Fluxo | Fluxo confuso/denso | Médio | Fluxo direto e fácil de alterar |
| Qualidade da Explicação | Só descreve o que | Mistura o que e porquê | Justifica decisões e trade-offs |
| Testabilidade | Sem testes/casos | Casos incompletos | Casos de teste relevantes e completos |

Pontuação total sugerida por modelo: 0 a 10.

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
- Doubao (ByteDance): https://www.doubao.com
- Yuanbao (Tencent): https://yuanbao.tencent.com
- ChatGLM (Zhipu AI): https://chatglm.cn
- ERNIE Bot / Wenxin Yiyan (Baidu): https://yiyan.baidu.com

### Opcional para testar em casa: local, open source e agregadores

- Ollama (execução local): https://ollama.com
- LM Studio (execução local): https://lmstudio.ai
- Hugging Face (catálogo de modelos): https://huggingface.co/models
- OpenRouter (acesso a múltiplos modelos): https://openrouter.ai
- GitHub Copilot (ferramenta para IDE): https://docs.github.com/copilot
- Amazon Q Developer (ferramenta para IDE/cloud): https://aws.amazon.com/q/developer/
- Codeium/Windsurf (ferramenta para IDE): https://codeium.com
- Tabnine (ferramenta para IDE): https://www.tabnine.com

Observações:

1. Verifique política institucional para criação de conta e uso de dados.
2. Evite colar código com dados sensíveis ou proprietários.
3. Para comparações justas, use o mesmo prompt e contexto em todos os modelos.
