# ⏱️ Atividade: O Custo de Ler Código Difícil

**Objetivo:** Demonstrar empiricamente como código com code smells aumenta o tempo de leitura e escrita de código.

---

## 📜 Contexto

A empresa está migrando um módulo de **Gestão de Estoque** do sistema legado. Você recebe um código que funciona, mas precisa:

1. **Corrigir um BUG**: O sistema está enviando notificações duplicadas quando o estoque fica baixo
2. **Implementar uma nova funcionalidade**: Adicionar suporte a itens com desconto (preço reduzido)

---

## ⏱️ INSTRUÇÕES CRÍTICAS - MEÇA O TEMPO

### Submissão dos dados de tempo:
Formulário: [https://forms.gle/HakgNYcNquFhnurB8] (preencher após a atividade)

### Fase 1: LEITURA
- ⏱️ **AGORA**: Anote a hora exata (hh:mm:ss)
- Abra o arquivo `InventoryManager.java` (código desorganizado)
- Leia o código inteiro SEM tentar modificar nada
- Tente:
  - Entender o que cada linha faz
  - Localizar onde está o bug de notificação duplicada
  - Identificar onde implementar a funcionalidade de desconto
- ⏱️ **QUANDO TERMINAR**: Anote a hora novamente. Calcule: **Tempo Total de Leitura = ?**

**Registro de Tempo - Fase 1:**
```
Hora início: ____:____:____
Hora término: ____:____:____
⏱️ Tempo de Leitura = _____ minutos e _____ segundos
```

---

### Fase 2: IMPLEMENTAÇÃO

Você já leu o código. Agora implemente as mudanças:

#### A) Corrigir o BUG
**Problema:** O método `checkLowStock()` está enviando múltiplas notificações para o mesmo produto.

**Requisito:** Garantir que CADA produto receba apenas UMA notificação por dia, mesmo que o método seja chamado várias vezes.

#### B) Implementar Desconto
**Requisito:** Adicionar suporte a produtos com preço reduzido (desconto):
- Cada item pode ter um `discountPercentage` (0-100%)
- O valor final é calculado como: `price * (1 - discountPercentage/100)`
- Listar os produtos deve mostrar também o preço com desconto aplicado

---

### 📊 Métricas de Timing - Fase 2

⏱️ **IMPLEMENTE AGORA:**

- **Hora início da Fase 2:** ____:____:____

**Sub-tarefa A (Corrigir bug):**
- Tempo para localizar o problema: _____ min _____ seg
- Tempo para corrigir: _____ min _____ seg

**Sub-tarefa B (Novo recurso):**
- Tempo para localizar onde adicionar código: _____ min _____ seg
- Tempo para implementar: _____ min _____ seg

- **Hora término da Fase 2:** ____:____:____
- ⏱️ **Tempo Total de Implementação = _____ minutos**

---

## 📈 Análise Pós-Atividade

Responda em seu grupo:

1. **Quanto tempo levou para ler o código?** _____ minutos
   - Você conseguiu localizar o bug apenas pela leitura?
   - Qual foi a maior dificuldade ao ler?

2. **Quanto tempo levou para implementar as mudanças?** _____ minutos
   - Qual tarefa foi mais rápida? Por quê?
   - Você confiava de que não estava quebrando outras coisas?

3. **Razão Leitura/Implementação:**
   - Calcule: Tempo Leitura ÷ Tempo Implementação = _____ %
   - **O que isso significa?**

4. **Code Smells Identificados:**
   - Liste 5 problemas que tornarom o código difícil de ler:
     - [ ] 
     - [ ] 
     - [ ] 
     - [ ] 
     - [ ] 

---

## 💡 Arquivo para Corrigir

👉 Abra: **`InventoryManager.java`** (código sujo com code smells)

A solução limpa será fornecida após a atividade para comparação.
