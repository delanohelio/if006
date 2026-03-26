# 📊 Guia de Análise: Comparando Código Sujo vs. Limpo

## Objetivo da Atividade

Demonstrar empiricamente que **código com code smells custa muito mais tempo para ler e modificar** do que código bem estruturado.

---

## 📈 Resultados Esperados

### Tempos de Execução Típicos

| Fase | Tempo Esperado | Observação |
|------|---|---|
| **Fase 1: Leitura (código sujo)** | 10-15 min | Alunos lutam para entender |
| **Fase 2: Implementação** | 15-25 min | Muita confusão, troca de contexto |
| **Razão L/I** | 40-60% | Leitura é metade ou mais da implementação |

---

## 🔍 Code Smells Identificados no InventoryManager.java

### 1. **Nomes Péssimos (Poor Naming)**
```java
String c = "BRONZE";              // ❌ 'c' não significa nada
Integer tp = 0;                   // ❌ 'tp' = tipo? type?
List<Double> it = ...;           // ❌ 'it' = itens?
```

**Impacto:** Leitor precisa adivinhar o que cada variável faz. Duplo esforço mental.

**Solução:**
```java
String customerType = "BRONZE";
Integer typeCode = 0;
List<Double> itemPrices = ...;
```

---

### 2. **God Object (Falta de Separação de Responsabilidades)**
```java
static List<String> products = ...;
static List<Double> prices = ...;
static List<Integer> quantities = ...;
static List<Integer> minStock = ...;
static List<String> notifSent = ...;
static List<Boolean> active = ...;
```

**Problema:** Dados de um produto espalhados em 6 listas diferentes. Impossível entender que "products[i], prices[i], quantities[i]..." formam uma unidade.

**Impacto de Leitura:** Leitor precisa rastrear índices através de múltiplas estruturas.

**Solução:** Criar classe `Product` que encapsula todos esses dados.

---

### 3. **Magic Numbers (Constantes sem contexto)**
```java
if (tp == 1) { v2 = v1 * 0.9; }      // ❌ O que é 0.9?
if (tp == 2) { v2 = v1 * 0.95; }     // ❌ O que é 0.95?
```

**Pergunta que o leitor faz:** "Qual é a relação entre 1, 2, 3, 4 e os tipos de cliente?"

**Impacto:** Impossível entender regras de negócio.

**Solução:**
```java
public static final double BRONZE_DISCOUNT = 0.05;   // 5%
public static final double SILVER_DISCOUNT = 0.10;   // 10%
public static final int BRONZE_CODE = 1;
public static final int SILVER_CODE = 2;
```

---

### 4. **Mistura de Responsabilidades (Lógica + I/O)**
```java
public static void listProducts() {
    for (int i = 0; i < products.size(); i++) {
        System.out.println(...);  // ❌ Print direto
    }
}
```

**Problemas:**
- Não pode testar lógica sem capturar `System.out`
- Não pode reusar em app mobile, API REST, ou relatório PDF
- Impossível isolara matemática de cálculo

**Impacto:** Refatoração futura é arriscada. Tira segurança do programador.

**Solução:** Separar geração de dados do I/O
```java
public List<String> generateProductReports() {
    List<String> reports = new ArrayList<>();
    for (Product p : products) {
        reports.add(p.getDisplayString());
    }
    return reports;
}

// Depois o main faz o print:
List<String> reports = manager.generateProductReports();
reports.forEach(System.out::println);
```

---

### 5. **Lógica de Negócio Espalhada (No Single Source of Truth)**
```java
if (quantities.get(i) < minStock.get(i) && active.get(i)) {
    // BUG: Notificação duplicada
}
```

**Problema:** "Qual é a regra exata para notificar estoque baixo?" 
- Está em `checkLowStock()`? 
- Passaemprátina por passar outras condições?
- Chamadores verificam algo diferente?

**Impacto:** Aluno lê `checkLowStock()` mas também precisa verificar quem chama, em que contexto, com qual frequência.

**Solução:** Encapsular em método claro:
```java
public boolean isLowStock() {
    return quantity < minStock && active;
}
```

---

### 6. **BUG: Notificação Duplicada (Falta de Design)**
```java
public static void checkLowStock() {
    for (int i = 0; i < products.size(); i++) {
        if (quantities.get(i) < minStock.get(i) && active.get(i)) {
            // Sempre envia, sem verificar data de última notificação
            System.out.println("🔔 ALERTA: ...");
            notifSent.set(i, "Y");
        }
    }
}
```

**Por que o aluno vai demorar para encontrar?**
- Variável `notifSent` não é usada para nada (é apenas atualizada, nunca lida)
- Não há `lastNotifTime`, então aluno pensa: "Como eu contendo duplicação?"
- O leitor assume que se existe `notifSent`, deve estar sendo verificada

**Tempo perdido:** Aluno procura onde `notifSent` é lido, não acha, fica confuso.

---

### 7. **Impossibilidade de Teste Unitário**
```java
// Como testar se descontos estão sendo aplicados corretamente?
// O método retorna void e faz print direto!
public static void applyDiscount(...) {
    System.out.println("Desconto aplicado");  // ❌ Não dá para verificar
}
```

**Impacto:** Refatorações futuras são perigosas. Ninguém tem confiança.

---

## 📋 Checklist: O que Melhora na Versão Refatorada

- ✅ **Nomes claros:** `Product`, `NotificationService`, `discountPercentage`
- ✅ **Classe Product:** Agrupa dados relacionados
- ✅ **Classe NotificationService:** Responsabilidade única
- ✅ **Métodos puros:** Retornam valores, não fazem print
- ✅ **Lógica isolada:** `isLowStock()`, `getFinalPrice()` são testáveis
- ✅ **Sem magic numbers:** Constantes nomeadas
- ✅ **Documentação clara:** Javadoc em classes
- ✅ **BUG corrigido:** `shouldNotify()` verifica data

---

## 💬 Perguntas de Discussão Pós-Atividade

### Para os alunos que corrigiram o código sujo:

1. **Qual foi a parte mais frustrante?**
   - *Esperado:* Perder tempo procurando onde estão os dados

2. **Você se sentia confiante ao modificar o código?**
   - *Esperado:* Não. "Sentia que podia quebrar coisa sem saber"

3. **Quanto tempo levou para entender que `notifSent` nunca era checado?**
   - *Esperado:* Muito. Alunos procuram `notifSent.get()`e ficam perdidos

4. **Onde você coló o código de desconto? Por quê?**
   - *Esperado:* Respostas variadas e inconsistentes - mostra a falta de estrutura

---

### Conclusão para toda a turma:

> **"Código ruim não custa o mesmo tempo para ler que para escrever. Pode levar 2x, 3x ou até mais tempo lendo do que escrevendo, porque o leitor precisa decodificar tudo. Em um projeto real com 100 mil linhas assim, esse tempo se multiplica por toda a equipe, todos os dias."**

---

## 🎯 Métricas que Você Pode Comparar

Se você tiver tempo, mostre ao vivo:

1. **Teste unitário:** Escreva um JUnit para `Product.getFinalPrice()` em 30 segundos com código limpo. Tente fazer o mesmo com o código sujo (impossível sem refatoração).

2. **Localize um bug:** Peça "Encontre onde se aplica o desconto". No código sujo é caótico. No refatorado é óbvio em `getFinalPrice()`.

3. **Adicione um recurso:** "Agora produtos têm categoria". 
   - Sujo: Vão adicionar mais uma `List<String> categories = new ArrayList<>()`
   - Limpo: Vão abrir a classe `Product` e adicionar um campo

---

## 📚 Code Smells Teóricos (Para Menção)

Se tiver tempo, mencione os nomes formais:

- **Poor Naming** → Bad Naming Convention
- **God Object** → Divergent Change, Feature Envy
- **Magic Numbers** → Magic Values
- **Mixed Concerns** → Feature Envy, Inappropriate Intimacy
- **Bug Oculto** → Incomplete Library Class, Speculative Generality
- **Hard to Test** → Feature Envy, Inappropriate Intimacy

---

## ✨ Resumo para Mostrar

```
TEMPO GASTO REFATORANDO CÓDIGO RUIM

Fase 1 (Leitura):       ████████░░  ~15 min (Decodificando)
Fase 2 (Correção):      ██████████  ~20 min (Caçando bugs)
                        ──────────────────────
TOTAL:                  ~35 minutos  (Frustração alta)


TEMPO GASTO REFATORANDO CÓDIGO LIMPO

Fase 1 (Leitura):       ███░░░░░░░  ~5 min (Entende rápido)
Fase 2 (Correção):      ██████░░░░  ~10 min (Mudanças diretas)
                        ──────────────────────
TOTAL:                  ~15 minutos  (Confiança alta)

DIFERENÇA: 35 ÷ 15 = 2.3x MAIS RÁPIDO COM CÓDIGO LIMPO!
```

