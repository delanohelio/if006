# ✅ Versão Corrigida - Código de Referência

Este arquivo mostra como os dois projetos deveriam ser escritos, focando em:
- **Manutenibilidade**: Fácil de ler
- **Testabilidade**: Fácil de testar
- **Reusabilidade**: Fácil de reutilizar

---

## 📋 Estrutura Proposta (Versão Corrigida)

```
projeto-correto/
├── OrderCalculator.java          # Lógica pura (sem I/O)
├── OrderProcessor.java            # Orquestra o fluxo
├── models/
│   └── Order.java                 # Objeto que representa um pedido
├── providers/
│   ├── DiscountProvider.java      # Interface
│   ├── ShippingProvider.java      # Interface
│   ├── SimpleDiscountProvider.java # Implementação
│   └── SimpleShippingProvider.java # Implementação
├── receipt/
│   └── ReceiptGenerator.java      # Gera recibos (I/O separado)
└── main/
    └── Main.java                  # Ponto de entrada
```

---

## 1️⃣ OrderCalculator.java (Lógica Pura)

```java
import java.util.List;

/**
 * Responsável SOMENTE pela lógica de cálculo.
 * Sem I/O, sem System.out, sem dependencies ocultas.
 * Totalmente testável.
 */
public class OrderCalculator {
    private DiscountProvider discountProvider;
    private ShippingProvider shippingProvider;
    
    // ✅ Injeção de Dependência: as dependências vêm de fora
    public OrderCalculator(DiscountProvider discountProvider, 
                          ShippingProvider shippingProvider) {
        this.discountProvider = discountProvider;
        this.shippingProvider = shippingProvider;
    }
    
    /**
     * Calcula o subtotal (soma de todos os itens).
     * Método puro: entrada → saída, sem efeitos colaterais.
     */
    public Double calculateSubtotal(List<Double> items) {
        if (items == null || items.isEmpty()) {
            return 0.0;
        }
        return items.stream()
                   .mapToDouble(Double::doubleValue)
                   .sum();
    }
    
    /**
     * Aplica desconto baseado no tipo de cliente.
     * Método puro: sem I/O, sem surpresas.
     */
    public Double applyDiscount(Double subtotal, String customerType) {
        if (subtotal <= 0) {
            return 0.0;
        }
        
        Double discountRate = discountProvider.getDiscountRate(customerType);
        return subtotal * (1.0 - discountRate);
    }
    
    /**
     * Adiciona custo de frete.
     * Método puro.
     */
    public Double addShipping(Double amount, String region) {
        if (amount <= 0) {
            return 0.0;
        }
        
        Double shippingCost = shippingProvider.getShippingCost(region, amount);
        return amount + shippingCost;
    }
    
    /**
     * Processa um pedido completo.
     * Retorna um objeto Order com todos os detalhes.
     * Sem I/O, sem side-effects.
     */
    public Order processOrder(List<Double> items, 
                             String customerType, 
                             String region) {
        Double subtotal = calculateSubtotal(items);
        Double discounted = applyDiscount(subtotal, customerType);
        Double total = addShipping(discounted, region);
        
        return new Order(customerType, region, subtotal, discounted, total);
    }
}
```

---

## 2️⃣ Order.java (Modelo de Dados)

```java
/**
 * Representa um pedido processado.
 * Objeto imutável para evitar surpresas.
 */
public class Order {
    private final String customerType;
    private final String region;
    private final Double subtotal;
    private final Double discountedPrice;
    private final Double total;
    
    public Order(String customerType, String region, 
                 Double subtotal, Double discountedPrice, Double total) {
        this.customerType = customerType;
        this.region = region;
        this.subtotal = subtotal;
        this.discountedPrice = discountedPrice;
        this.total = total;
    }
    
    // Getters (sem setters - imutável)
    public String getCustomerType() { return customerType; }
    public String getRegion() { return region; }
    public Double getSubtotal() { return subtotal; }
    public Double getDiscountedPrice() { return discountedPrice; }
    public Double getTotal() { return total; }
}
```

---

## 3️⃣ Interfaces de Provider

**DiscountProvider.java:**
```java
/**
 * Interface que permite múltiplas implementações.
 * Em teste: mockar. Em produção: usar implementação real.
 */
public interface DiscountProvider {
    Double getDiscountRate(String customerType);
}
```

**ShippingProvider.java:**
```java
public interface ShippingProvider {
    Double getShippingCost(String region, Double orderValue);
}
```

---

## 4️⃣ Implementações de Provider

**SimpleDiscountProvider.java:**
```java
public class SimpleDiscountProvider implements DiscountProvider {
    
    // ✅ Constantes com nomes significativos (sem números mágicos)
    private static final Double BRONZE_DISCOUNT = 0.05;    // 5%
    private static final Double SILVER_DISCOUNT = 0.10;    // 10%
    private static final Double GOLD_DISCOUNT = 0.15;      // 15%
    private static final Double PLATINUM_DISCOUNT = 0.20;  // 20%
    private static final Double DEFAULT_DISCOUNT = 0.0;    // Sem desconto
    
    @Override
    public Double getDiscountRate(String customerType) {
        if (customerType == null || customerType.isEmpty()) {
            return DEFAULT_DISCOUNT;
        }
        
        // ✅ Switch ao invés de if/else (menos arrow code)
        return switch (customerType.toUpperCase()) {
            case "BRONZE" -> BRONZE_DISCOUNT;
            case "SILVER" -> SILVER_DISCOUNT;
            case "GOLD" -> GOLD_DISCOUNT;
            case "PLATINUM" -> PLATINUM_DISCOUNT;
            default -> DEFAULT_DISCOUNT;
        };
    }
}
```

**SimpleShippingProvider.java:**
```java
public class SimpleShippingProvider implements ShippingProvider {
    
    // ✅ Constantes com nomes (sem números mágicos)
    private static final Double SP_COST = 15.0;
    private static final Double MG_COST = 20.0;
    private static final Double BA_COST = 35.0;
    private static final Double SC_COST = 25.0;
    private static final Double OTHER_COST = 50.0;
    private static final Double LARGE_ORDER_MULTIPLIER = 1.2;  // 20% adicional
    private static final Double LARGE_ORDER_THRESHOLD = 500.0;
    
    @Override
    public Double getShippingCost(String region, Double orderValue) {
        if (region == null || region.isEmpty()) {
            return OTHER_COST;
        }
        
        Double baseCost = switch (region.toUpperCase()) {
            case "SP" -> SP_COST;
            case "MG" -> MG_COST;
            case "BA" -> BA_COST;
            case "SC" -> SC_COST;
            default -> OTHER_COST;
        };
        
        // Aplica multiplicador para pedidos grandes
        if (orderValue > LARGE_ORDER_THRESHOLD) {
            baseCost = baseCost * LARGE_ORDER_MULTIPLIER;
        }
        
        return baseCost;
    }
}
```

---

## 5️⃣ ReceiptGenerator.java (I/O Separado)

```java
/**
 * Responsável SOMENTE por gerar recibos.
 * Separado da lógica de cálculo.
 * Pode ser usado para console, email, PDF, etc.
 */
public class ReceiptGenerator {
    
    /**
     * Gera um recibo em formato String.
     * Retorna texto, não imprime diretamente.
     */
    public String generateReceipt(Order order) {
        StringBuilder sb = new StringBuilder();
        sb.append("\n");
        sb.append("=".repeat(30)).append("\n");
        sb.append("         RECIBO DO PEDIDO         \n");
        sb.append("=".repeat(30)).append("\n");
        sb.append("Cliente: ").append(order.getCustomerType()).append("\n");
        sb.append("Região: ").append(order.getRegion()).append("\n");
        sb.append("-".repeat(30)).append("\n");
        sb.append(String.format("Subtotal:    R$ %.2f%n", order.getSubtotal()));
        sb.append(String.format("Com desconto: R$ %.2f%n", order.getDiscountedPrice()));
        sb.append(String.format("Frete:       R$ %.2f%n", 
                  order.getTotal() - order.getDiscountedPrice()));
        sb.append("-".repeat(30)).append("\n");
        sb.append(String.format("TOTAL:       R$ %.2f%n", order.getTotal()));
        sb.append("=".repeat(30)).append("\n");
        
        return sb.toString();
    }
    
    /**
     * Imprime um recibo no console.
     * Quem chama decide se quer imprimir ou não.
     */
    public void printReceipt(Order order) {
        System.out.println(generateReceipt(order));
    }
}
```

---

## 6️⃣ Main.java (Ponto de Entrada)

```java
import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // ✅ Injeção de Dependência: criamos as implementações aqui
        DiscountProvider discountProvider = new SimpleDiscountProvider();
        ShippingProvider shippingProvider = new SimpleShippingProvider();
        OrderCalculator calculator = new OrderCalculator(discountProvider, 
                                                        shippingProvider);
        
        // Exemplo de pedido
        List<Double> items = Arrays.asList(100.0, 50.0, 75.0);
        Order order = calculator.processOrder(items, "GOLD", "SP");
        
        // Gera e imprime o recibo (I/O separado)
        ReceiptGenerator generator = new ReceiptGenerator();
        generator.printReceipt(order);
    }
}
```

---

## 🧪 Teste Unitário (Agora é Fácil!)

**OrderCalculatorTest.java:**
```java
import org.junit.Before;
import org.junit.Test;
import static org.junit.Assert.*;

public class OrderCalculatorTest {
    
    private OrderCalculator calculator;
    private DiscountProvider mockDiscountProvider;
    private ShippingProvider mockShippingProvider;
    
    @Before
    public void setUp() {
        // ✅ Mocka as dependências
        mockDiscountProvider = (customerType) -> {
            if (customerType.equals("GOLD")) return 0.15;
            return 0.0;
        };
        
        mockShippingProvider = (region, amount) -> {
            if (region.equals("SP")) return 15.0;
            return 50.0;
        };
        
        calculator = new OrderCalculator(mockDiscountProvider, 
                                        mockShippingProvider);
    }
    
    @Test
    public void testCalculateSubtotal() {
        var items = Arrays.asList(100.0, 50.0, 75.0);
        Double result = calculator.calculateSubtotal(items);
        
        assertEquals(225.0, result, 0.01);
    }
    
    @Test
    public void testApplyDiscountForGoldCustomer() {
        Double result = calculator.applyDiscount(100.0, "GOLD");
        
        // 100 * (1 - 0.15) = 85
        assertEquals(85.0, result, 0.01);
    }
    
    @Test
    public void testFullOrderProcessing() {
        var items = Arrays.asList(100.0, 50.0, 75.0);
        Order order = calculator.processOrder(items, "GOLD", "SP");
        
        assertEquals(225.0, order.getSubtotal(), 0.01);      // Soma
        assertEquals(191.25, order.getDiscountedPrice(), 0.01); // 225 * 0.85
        assertEquals(206.25, order.getTotal(), 0.01);        // 191.25 + 15
    }
    
    @Test
    public void testEmptyItemsList() {
        var items = Arrays.asList();
        Double result = calculator.calculateSubtotal(items);
        
        assertEquals(0.0, result, 0.01);
    }
}
```

---

## 📊 Comparação: Ruim vs. Bom

| Aspecto | Projeto A/B (Ruim) | Corrigido (Bom) |
|---------|-------------------|-------------------|
| **Nomes de variáveis** | `c, v1, v2, tp` | `customerType, subtotal, discountedPrice` |
| **Aninhamento IF** | 4+ níveis | Switch (máx 1 nível) |
| **Números mágicos** | `0.9, 15.0, etc.` | Constantes nomeadas |
| **Métodos pelo menos** | Gigantesco (100+ linhas) | Pequenos (< 15 linhas) |
| **Acoplamento** | Oculto | Injeção de dependência |
| **I/O e Lógica** | Misturados | Separados |
| **Testabilidade** | ❌ Impossível | ✅ Simples |
| **Linhas de teste** | N/A | ~50 linhas |
| **Reusabilidade** | ❌ Impossível | ✅ Fácil |

---

## 🎯 Lições Finais

1. **Nomes significativos**: `customerType` vs `c` (5x mais direcionado)
2. **Métodos pequenos**: Cada um tem 1 responsabilidade
3. **Sem números mágicos**: Constantes explicam a intenção
4. **Injeção de dependência**: Possível mockar em testes
5. **Separação de responsabilidades**: Lógica ≠ I/O
6. **Objetos modelo**: `Order` encapsula resultado
7. **Interfaces**: Permite múltiplas implementações
8. **Testes unitários**: Agora são triviais

Este é o padrão que deve ser ensinado aos alunos!
