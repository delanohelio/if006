# Projeto: Métrica de Legibilidade de Código Java
## Roteiro da Apresentação — Fase 1: Proposta

---

## Visão Geral

A apresentação da Fase 1 deve comunicar **o que o grupo pretende fazer e por quê**, antes de qualquer implementação. O objetivo é validar a proposta com o professor e com a turma, recebendo feedback antes de começar a construir.

**Tempo sugerido:** 30 minutos de apresentação + 5–10 minutos de perguntas  
**Formato:** Slides

---

## Estrutura da Apresentação

### 1. Contextualização

Apresente brevemente o problema que o projeto resolve:

- O que é legibilidade de código e por que ela importa?
- Por que é difícil medir legibilidade de forma objetiva?
- Qual é a motivação do grupo para a abordagem escolhida?

> **Dica:** Evite generalidades. Ancore a motivação em algo concreto — um estudo, um exemplo de código ruim vs. bom, uma prática que a turma já viu na disciplina.

---

### 2. Definição da Métrica

Esta é a parte central da proposta. O grupo deve responder:

#### 2.1 O que a métrica mede?
- Defina com precisão o que vocês entendem por "legibilidade" no contexto do projeto.
- A métrica mede legibilidade **geral** ou algum aspecto específico (ex: clareza de nomes, estrutura de métodos, complexidade cognitiva)?

#### 2.2 Quais features serão extraídas do código?
Liste cada feature que será coletada do código-fonte Java. Para **cada feature**, apresente:

| Feature | O que mede | Justificativa |
|---|---|---|
| Ex: Comprimento médio de método | Número de linhas por método | Métodos longos dificultam a leitura e o raciocínio local |
| Ex: Proporção de comentários | Linhas de comentário / total de linhas | Ausência de comentários em código complexo reduz compreensibilidade |
| ... | ... | ... |

> **Atenção:** A justificativa precisa ser fundamentada. Cite literatura, estudos empíricos ou argumente com base em princípios de legibilidade vistos na disciplina. Não basta dizer "faz sentido".

#### 2.3 Como as features se combinam na nota final?
- A nota será calculada por uma fórmula explícita (soma ponderada, por exemplo)?
- Ou vocês planejam usar algum modelo aprendido a partir de dados?
- Qual é a escala da nota (0–10, 0–100, categorias como Baixa/Média/Alta)?

---

### 3. Modelo de Avaliação

Explique **como vocês vão saber se a métrica funciona**:

#### 3.1 Fonte de dados / conjunto de referência
- Vocês vão rotular manualmente amostras de código? Quantas?
- Vão usar um conjunto de dados público (ex: repositórios open-source, datasets de legibilidade como Scalabrino et al.)?
- Vão usar os códigos das práticas da disciplina como exemplos?

#### 3.2 Critério de validade
- Como vão verificar que a nota gerada pela ferramenta faz sentido?
- Ex: comparar com avaliação humana, verificar correlação com métricas conhecidas (complexidade ciclomática, etc.), teste com exemplos extremos (código sabidamente bom vs. sabidamente ruim).

#### 3.3 Limitações assumidas
- Que tipos de código a métrica **não** se propõe a cobrir?
- Que casos-limite vocês já identificam como problemáticos?

---

### 4. Arquitetura da Ferramenta

Descreva como a ferramenta será construída:

#### 4.1 Visão geral do sistema
Apresente um diagrama ou descrição dos componentes principais:
- **Entrada:** Como o código Java é fornecido à ferramenta? (arquivo, diretório, repositório Git?)
- **Análise:** Como as features são extraídas? (parsing manual, biblioteca como JavaParser, ferramentas existentes como PMD/Checkstyle?)
- **Cálculo:** Onde a lógica da métrica fica?
- **Saída:** Como a nota é apresentada? (terminal, relatório, interface web?)

#### 4.2 Tecnologias escolhidas
Liste as linguagens, bibliotecas e ferramentas que o grupo pretende usar, justificando as escolhas mais relevantes.

#### 4.3 Divisão de responsabilidades
Como o trabalho será dividido entre os membros do grupo?

---

### 5. Cronograma e Próximos Passos

Apresente um planejamento básico para chegar à Fase 2:

| Semana | Atividade |
|---|---|
| Semana X | Configurar ambiente, definir parser |
| Semana X+1 | Implementar extração das features |
| Semana X+2 | Implementar cálculo da nota e testes iniciais |
| Semana X+3 | Avaliação da ferramenta e preparação da Fase 2 |

---

## Critérios de Avaliação da Apresentação

| Critério | Peso | O que será observado |
|---|---|---|
| Clareza na definição da métrica | Alto | As features estão bem definidas e são mensuráveis objetivamente? |
| Justificativa das features | Alto | O grupo argumenta com base em evidências ou princípios sólidos? |
| Viabilidade técnica | Médio | A arquitetura proposta é realista para o prazo disponível? |
| Plano de validação | Médio | O grupo sabe como vai verificar se a métrica é boa? |
| Clareza da apresentação | Baixo | Os slides comunicam bem? O grupo domina o conteúdo? |

---

## Dúvidas Frequentes

**Posso usar ferramentas que já calculam métricas prontas (ex: PMD, SonarQube)?**  
Sim, como parte da infraestrutura de extração. Mas a **métrica de legibilidade em si** — como você combina e interpreta essas informações para dar uma nota — deve ser uma contribuição original do grupo.

**Preciso ter código implementado para a Fase 1?**  
Não. A Fase 1 é uma proposta. Protótipos iniciais são bem-vindos como demonstração de viabilidade, mas não são exigidos.

**Quantas features o grupo precisa ter?**  
Não há um número mínimo rígido. Prefira ter 3–5 features bem justificadas a ter 10 features superficiais.
