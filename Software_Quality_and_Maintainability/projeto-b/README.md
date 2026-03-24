# Projeto B - Código "Bonito" com Péssima Testabilidade e Reusabilidade

## 📋 Propósito Didático

Este projeto demonstra como código que **parece bom** na superfície (nomes legítimos, métodos pequenos) pode ser completamente **não-testável** e **não-reusável** por causa de acoplamento oculto e mistura de responsabilidades.

**O PIOR tipo de código ruim**: aquele que pareça estar certo!

## 🚫 Falhas Arquiteturais Intencionais

### 1. **Instanciação de Dependências Dentro dos Métodos (Acoplamento Oculto)**

```java
private Double applyCustomerDiscount(Double amount) {
    DiscountReader reader = new DiscountReader();  // ❌ ACOPLADO!
    discount = reader.getDiscount(customerType);
    ...
}

private Double addShippingCost(Double amount) {
    ShippingService shipping = new ShippingService();  // ❌ ACOPLADO!
    Double cost = shipping.calculateShipping(region, amount);
    ...
}
```

**Impacto**: 
- Impossível mockar em testes unitários
- Impossível testar a lógica sem executar `DiscountReader` real
- Código testa AND DiscountReader AND ShippingService (3 coisas ao mesmo tempo)

### 2. **Mistura de Lógica de Negócio com I/O**

```java
private Double applyCustomerDiscount(Double amount) {
    Double discountedAmount = amount * (1 - discount);
    System.out.println("[LOG INTERNO] Desconto aplicado: " + discount);  // ❌ I/O!
    return discountedAmount;
}

private void printReceipt(Double subtotal, Double discounted, Double total) {
    System.out.println("\n=== RECIBO DO PEDIDO ===");  // ❌ I/O DIRETO!
    ...
}
```

**Impacto**:
- Testes unitários teriam que capturar `System.out` (super frágil)
- Impossível usar em uma API REST (não pode imprimir texto na resposta JSON)
- Não pode enviar recibo por email, SMS ou API sem refatoração massiva
- Lógica de cálculo é inseparável de apresentação

### 3. **Dependência com Banco de Dados Instanciado no Construtor**

```java
public OrderProcessor(String customerType, String region) {
    this.customerType = customerType;
    this.region = region;
    this.items = new java.util.ArrayList<>();
    this.database = new Database();  // ❌ Sempre conecta!
}
```

**Impacto**:
- Toda vez que cria `OrderProcessor`, conecta ao BD
- Em testes, tentaria se conectar ao BD real
- Impossível testar sem BD disponível
- Testes ficariam lento se o BD fosse real

## 📊 Por Que É Não-Testável?

### ❌ Isso não é possível:
```java
@Test
public void testDiscountCalculation() {
    OrderProcessor processor = new OrderProcessor("GOLD", "SP");
    // Problema 1: Banco de dados foi instanciado
    // Problema 2: Qual é o resultado esperado? 
    //            applyCustomerDiscount não retorna nada diretamente
    // Problema 3: Mesmo que retornasse, dependeria de DiscountReader real
}
```

### ✅ Versão Testável seria:
```java
@Test
public void testDiscountCalculation() {
    // Mocka as dependências
    DiscountReader mockReader = mock(DiscountReader.class);
    when(mockReader.getDiscount("GOLD")).thenReturn(0.15);
    
    OrderCalculator calculator = new OrderCalculator(mockReader);
    Double result = calculator.applyDiscount(100.0, "GOLD");
    
    assertEquals(85.0, result);  // 100 * (1 - 0.15)
}
```

## 📊 Comparação: Projeto B vs. Versão Corrigida

| Aspecto | Projeto B | Versão Corrigida |
|---------|-----------|------------------|
| Nomes | ✅ Bons | ✅ Bons |
| Tamanho de métodos | ✅ Pequenos | ✅ Pequenos |
| Testabilidade | ❌ Impossível | ✅ Fácil |
| Acoplamento | ❌ Alto | ✅ Baixo |
| Reusabilidade | ❌ Impossível | ✅ Fácil |
| API REST | ❌ Impossível | ✅ Simples |
| Injeção de dependência | ❌ Nenhuma | ✅ Total |

## 💡 Lições Aprendidas

1. **Código "bonito" não garante qualidade** - precisamos ir além de nomes e tamanho de métodos
2. **Injeção de dependência** é essencial para testabilidade
3. **Separação de responsabilidades** significa não misturar cálculo com I/O
4. **Métodos devem retornar valores**, não fazer efeitos colaterais (I/O)
5. **Acoplamento oculto** é mais perigoso que acoplamento óbvio

## 🛠️ Como Executar

```bash
javac Database.java
javac DiscountReader.java
javac ShippingService.java
javac OrderProcessor.java
java OrderProcessor
```

## ⚠️ NÃO USE ESTE CÓDIGO EM PRODUÇÃO!

Este é material puramente educacional para demonstrar **anti-padrões**.
