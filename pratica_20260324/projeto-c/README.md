# 📦 Projeto C: Atividade de Leitura vs. Escrita de Código

## 🎓 Sobre Essa Atividade

Esta é uma **atividade prática focada em medir o custo cognitivo** de ler e modificar código com problemas de qualidade (code smells).

**Objetivo:** Demonstrar que código mal estruturado consome muito mais tempo de leitura do que código bem organizado.

---

## 📑 Arquivos

### 1. **`atividade-leitura-escrita.md`**
📖 **Enunciado da atividade para os alunos**

Contém:
- Contexto do problema (Gestão de Estoque)
- Instruções para medir tempo de leitura (Fase 1)
- Tarefas de implementação (Fase 2):
  - Corrigir bug de notificações duplicadas
  - Adicionar suporte a desconto
- Planilha de timing para registro
- Questões de análise pós-atividade

**Como usar:** Distribua aos alunos e deixe-os completar.

---

### 2. **`InventoryManager.java`**
💥 **Código "SUJO" para os alunos corrigirem**

Este arquivo contém intencionalmente:

#### Code Smells Apresentados:
- ❌ **Nomes péssimos** (`c`, `tp`, `it`, `v1`, `v2`)
- ❌ **God Object** (Dados espalhados em 6 listas)
- ❌ **Magic Numbers** (0.9, 0.95, 1, 2, 3, 4 sem contexto)
- ❌ **Mistura de Lógica com I/O** (print direto nos métodos)
- ❌ **BUG intencional:** Notificações duplicadas sem controle de data
- ❌ **Impossível de testar** (tudo faz print, nada retorna valor)

**Tarefas para os alunos:**
1. Corrigir o bug de notificação duplicada
2. Implementar suporte a desconto na listagem

---

### 3. **`InventoryManagerRefactored.java`**
✨ **Código LIMPO (Solução de Referência)**

Demonstra as melhorias:
- ✅ Nomes claros e significativos
- ✅ Classe `Product` encapsulando dados relacionados
- ✅ Classe `NotificationService` com responsabilidade única
- ✅ Métodos retornam valores (testáveis)
- ✅ Sem magic numbers
- ✅ Lógica separada do I/O
- ✅ Bug corrigido com `shouldNotify(LocalDate)`
- ✅ Suporte a desconto integrado elegantemente

**Como usar:** 
- Mostre APÓS os alunos terminarem
- Use como referência para discussão

---

## 📊 Guia para o Professor

### 📋 Arquivo: `GUIA_ANALISE_ATIVIDADE.md`

Contém:
- Tempos de execução esperados (15 min leitura, 20 min implementação)
- Análise detalhada de cada code smell
- Impacto de cada problema na "velocidade de leitura"
- Checklist de melhorias na versão refatorada
- Perguntas de discussão pós-atividade
- Resumo visual da diferença de tempo

---

## ⏱️ Fluxo da Aula

### Antes da Atividade (5 min)
1. Explique o contexto: "Vamos medir custos reais de código ruim"
2. Distribua `atividade-leitura-escrita.md`
3. Peça para grupos se formarem (2-3 pessoas)

### Durante a Atividade (35 min)
- **Fase 1 (10 min):** Leitura do `InventoryManager.java` (sujo)
  - Alunos devem anotar o tempo exato
  - Tentam localizar o bug e onde implementar desconto
  
- **Fase 2 (20 min):** Implementação das duas tarefas
  - Corrigir notificação duplicada
  - Adicionar desconto
  - Medem tempo total de implementação

- **Registros finais (5 min):** Grupos completam a análise

### Depois da Atividade (15 min)
1. Coleta os tempos de cada grupo
2. Projeta `InventoryManagerRefactored.java`
3. Compara lado-a-lado com o código sujo
4. Usa `GUIA_ANALISE_ATIVIDADE.md` para discussão
5. Perguntas: "Por que demorou? O que tornou difícil?"

---

## 📈 Resultados Esperados

### Métricas Típicas
| Métrica | Esperado |
|---------|----------|
| Tempo de leitura (código sujo) | 10-15 min |
| Tempo de implementação | 15-25 min |
| Taxa Leitura/Implementação | 40-60% |
| Alunos que encontraram o bug? | ~30% |
| Alunos que se sentiram seguros? | ~20% |

### Conclusão
> "Código ruim pode custar 2-3x mais tempo para ler que para escrever. Em um projeto grande, isso multiplica o tempo de toda a equipe."

---

## 🔧 Detalhes Técnicos

### O Bug de Notificação Duplicada
```java
// ❌ PROBLEMA: Chamadas múltiplas = notificações múltiplas
checkLowStock(); // Chama 1: Notifica P001
checkLowStock(); // Chama 2: Notifica P001 NOVAMENTE!
checkLowStock(); // Chama 3: Notifica P001 NOVAMENTE!
```

**Solução esperada pelos alunos:**
- Adicionar verificação com `lastNotifTime`
- Ou usar `notifSent` (que existe mas não é usado)

**Solução no refatorado:**
```java
public boolean shouldNotify(String productId) {
    LocalDate lastDate = lastNotificationDate.getOrDefault(productId, null);
    return lastDate == null || !lastDate.equals(LocalDate.now());
}
```

### O Desafio de Desconto
**No código sujo:** Onde colocar desconto?
- `addProduct()`: Falta parâmetro
- `applyDiscount()`: Existe mas está vazio
- `listProducts()`: Precisa mostrar o preço com desconto

**Alunos vão ficar perdidos** entre essas opções.

**No refatorado:** Desconto é campo in `Product` e método `getFinalPrice()` deixa claro.

---

## 💡 Extensões Possíveis

Se tiver mais tempo, peça aos alunos:

1. **Refatore o código sujo** usando os princípios da versão limpa
2. **Escreva testes unitários** para a versão limpa
3. **Compare métricas:** Linhas de código, complexidade ciclomática
4. **Crie um serviço REST** a partir do `InventoryManagerRefactored`

---

## 📚 Aprendizados Principais

Ao fim da atividade, alunos entendem:

- ✅ Código legível custa menos para manter
- ✅ Code smells são mais que "estética"
- ✅ Refatoração é investimento, não desperdício
- ✅ Testes dependem de código bem estruturado
- ✅ Design impacta a velocidade do time inteiro

---

## 🎯 Próximos Passos Pedagogógicos

**Após esta atividade, introduza:**
1. Padrões de design (Strategy para descontos, Observer para notificações)
2. SOLID principles (Single Responsibility em `NotificationService`)
3. Clean Code practices (nomenclatura, encapsulação)
4. Refactoring patterns (Extract Class, Extract Method)

