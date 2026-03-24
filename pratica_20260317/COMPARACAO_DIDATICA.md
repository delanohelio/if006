# Comparação Didática: Projeto A vs Projeto B

## Overview

Ambos os projetos resolvem o **mesmo problema de negócio**:
- Calcular total de itens de um pedido
- Aplicar desconto baseado no tipo de cliente
- Adicionar frete por região
- Finalizar o pedido

**Mas com falhas arquiteturais muito diferentes!**

---

## 📍 Projeto A: Destroyed Analisabilidade & Modificabilidade

### Estrutura
- **1 classe**: `OrderProcessing`
- **1 método gigantesco**: `process()`
- **Sem separação**: tudo misturado

### Principais Problemas

#### 1. Péssimos Nomes (Impossível entender)
```
c           → ??? (customer type)
v1, v2      → ??? (valores 1 e 2?)
it          → items? (inferência necessária)
tp          → type? (6 letras criptografadas em 2)
rg          → region? (novo acrônimo a decifrar)
flag        → para quê?
final_total → pelo menos este é mais claro!
```

#### 2. Números Mágicos Soltos
```java
v2 = v1 * 0.9;   // Por que 0.9? É 10% de desconto? Por quem?
```
Sem documentação, é pura adivinhação.

#### 3. Arrow Code (If/Else Profundo)
```java
if (c.equals("BRONZE")) {
    tp = 1;
} else {           // nível 2
    if (c.equals("SILVER")) {
        tp = 2;
    } else {       // nível 3
        if (c.equals("GOLD")) {
            tp = 3;
        } else { // nível 4
            if (c.equals("PLATINUM")) {
                tp = 4;
            }
        }
    }
}
```

**Adicionar um novo tipo "DIAMOND"?** Pesadelo de refatoração.

#### 4. Sem Testes Possíveis
- Tudo em um método → impossível testar partes
- Números mágicos → testes ficariam tão cryptografados quanto o código
- Sem separação de responsabilidades

### 🎯 Ideal Para Ensinar
- Como **NÃO nomear variáveis**
- **Arrow Code** e por que é ruim
- **Coesão**: tudo junto é ruim
- **Um método gigantesco** destrói manutenibilidade

---

## 📍 Projeto B: Destroyed Testabilidade & Reusabilidade

### Estrutura
- **4 classes**: `OrderProcessor`, `Database`, `DiscountReader`, `ShippingService`
- **Métodos pequenos e nomeados bem**: `processOrder()`, `applyCustomerDiscount()`, etc.
- **Parece estar bom** à primeira vista!

### Principais Problemas

#### 1. Acoplamento Oculto (Instanciação de Dependências)
```java
// Indústria: OrderProcessor.java
public OrderProcessor(String customerType, String region) {
    this.database = new Database();  // ❌ Acoplado
}

private Double applyCustomerDiscount(Double amount) {
    DiscountReader reader = new DiscountReader();  // ❌ Acoplado
}

private Double addShippingCost(Double amount) {
    ShippingService shipping = new ShippingService();  // ❌ Acoplado
}
```

**Problema**: Você não controla as dependências. Não pode:
- Usar um `DiscountReader` fake para testes
- Usar um `Database` em memória
- Testar `applyCustomerDiscount` isolado

#### 2. Mistura de Lógica com I/O
```java
private Double applyCustomerDiscount(Double amount) {
    Double discountedAmount = amount * (1 - discount);
    System.out.println("[LOG INTERNO] ...");  // ❌ I/O aqui?!
    return discountedAmount;
}

private void printReceipt(...) {
    System.out.println("\n=== RECIBO DO PEDIDO ===");  // ❌ Efeito colateral
    System.out.println("Cliente: " + customerType);
    // ... mais System.out.println
}
```

**Consequências**:
- Testes: Como verificar um resultado se o método imprime coisas?
- API REST: Não pode usar este código (JSON não pode ser um print)
- Email: Não pode enviar sem quebrar o código
- Reuso: Lógica é inseparável de console.print

#### 3. Efeito Colateral: Sistema.out vs Retorno
```java
// Método que IMPRIME em vez de RETORNAR
private void printReceipt(Double subtotal, Double discounted, Double total) {
    System.out.println(...);
}

// ❌ Como testa isso? Como captura o output?
// ❌ Como usa isso em uma API?
```

**Correto seria**:
```java
private String generateReceipt(...) {  // Retorna STRING
    return "=== RECIBO ===\n" + ...;
}
// Aí quem quer pode System.out.println(receipt) OU enviar por email
```

#### 4. Dependência com Banco de Dados
```java
public OrderProcessor(...) {
    this.database = new Database();  // Sempre conecta!
}
```

Em teste: O BD será criado sempre. Se o BD fosse real:
- Testes ficariam lentos
- Testes precisaria de BD rodando
- Testes poluiria o BD com dados de teste

### ❌ Um Teste Unitário "Tentado"

```javascript
@Test
public void testApplyDiscount() {
    OrderProcessor processor = new OrderProcessor("GOLD", "SP");
    // Problema 1: BD foi conectado aqui
    
    Double result = processor.applyCustomerDiscount(100.0);
    // Problema 2: Este método é private (@Test não consegue chamar)
    // Problema 3: Mesmo se fosse public, onde estão os asserts?
    //             Ele não retorna nada útil, só imprime
    
    assertEquals(85.0, result);  // Não funciona!
}
```

### 🎯 Ideal Para Ensinar
- Como **código aparentemente bom** pode ser não-testável
- **Acoplamento oculto**: não instanciar dependências dentro
- **Injeção de dependência**: por que é essencial
- **Separação de responsabilidades**: não misturar cálculo com I/O
- **Impotência de Testes Unitários** quando há acoplamento
- **Reusabilidade**: por que código com I/O não é reutilizável

---

## 🆚 Comparação Lado a Lado

| Critério | Projeto A | Projeto B |
|----------|-----------|-----------|
| **Legibilidade** (nomes) | ❌ Horrível | ✅ Excelente |
| **Tamanho de métodos** | ❌ Gigantesco | ✅ Pequeno |
| **Estrutura** | ❌ Caos | ✅ Organizado |
| **Testabilidade** | ❌ Impossível | ❌ Impossível |
| **Reusabilidade** | ❌ Impossível | ❌ Impossível |
| **Acoplamento** | ❌ Óbvio | ❌ Oculto (PIOR) |
| **Como parece** | ❌ Óbviamente ruim | ✅ Parece bom (ARMADILHA!) |
| **Fácil de encontrar erros** | ✅ Óbvios | ❌ Escondidos |

---

## 🎓 Lições Estruturadas

### Projeto A Ensina:
1. **Nomenclatura**: nomes significativos são fundamentais
2. **Coesão**: separar responsabilidades em métodos
3. **Complexidade**: reduzir aninhamento (arrow code)
4. **Análise**: por que um método gigantesco é impossível de modificar
5. **Documentação**: números mágicos sem contexto são veneno

### Projeto B Ensina:
1. **Aparência vs. Realidade**: bom código visual ≠ bom código
2. **Testabilidade**: como acoplamento oculto destrói testes
3. **Injeção de Dependência**: essencial para manutenção
4. **Responsabilidades**: não misturar cálculo (lógica) com I/O
5. **Efeitos Colaterais**: métodos devem retornar, não fazer side-effects
6. **Reusabilidade**: I/O acoplado = nenhuma reusabilidade possível
7. **API Design**: como código print-driven não funciona em APIs

---

## 🏆 A Versão Corrigida

Ambos poderiam ser refatorados assim:

```java
// ✅ VERSÃO CORRIGIDA (Para ambos)

public class OrderCalculator {
    private DiscountProvider discountProvider;
    private ShippingProvider shippingProvider;
    
    // Injeção de dependência!
    public OrderCalculator(DiscountProvider provider, ShippingProvider shipper) {
        this.discountProvider = provider;
        this.shippingProvider = shipper;
    }
    
    // Métodos PUROS (sem I/O, sem side-effects)
    public Double calculateSubtotal(List<Double> items) {
        return items.stream().mapToDouble(Double::doubleValue).sum();
    }
    
    public Double applyDiscount(Double amount, String customerType) {
        Double discount = discountProvider.getDiscount(customerType);
        return amount * (1 - discount);
    }
    
    public Double addShipping(Double amount, String region) {
        Double cost = shippingProvider.calculateShipping(region);
        return amount + cost;
    }
    
    // Retorna objeto Order, sem I/O
    public Order processOrder(List<Double> items, String customerType, String region) {
        Double subtotal = calculateSubtotal(items);
        Double discounted = applyDiscount(subtotal, customerType);
        Double total = addShipping(discounted, region);
        
        return new Order(customerType, region, subtotal, discounted, total);
    }
}

// ✅ TESTE UNITÁRIO AGORA FUNCIONA!
@Test
public void testApplyDiscount() {
    DiscountProvider mockProvider = mock(DiscountProvider.class);
    when(mockProvider.getDiscount("GOLD")).thenReturn(0.15);
    
    OrderCalculator calculator = new OrderCalculator(mockProvider, null);
    Double result = calculator.applyDiscount(100.0, "GOLD");
    
    assertEquals(85.0, result);  // ✅ PASSA!
}
```

---

## 📚 Conclusão

- **Projeto A**: Gritaria as falhas → fácil ver o que está errado
- **Projeto B**: Esconde as falhas → falhas silenciosas são piores
- **Ambos**: Ótimos para ensinar o que **NÃO** fazer

Use-os em sala para mostrar que código bom é **mais que** nomes legítimos e métodos pequenos!
