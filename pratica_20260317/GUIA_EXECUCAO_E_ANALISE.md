# 🚀 Guia de Execução e Análise

## Executando os Projetos

### Projeto A (Uma Classe Gigantesca)

```bash
cd /Users/delano/aulas/if006/projeto-a-bad-design

# Compilar
javac OrderProcessing.java

# Executar
java OrderProcessing
```

**Saída esperada:**
```
Pedido processado
Subtotal: 225.0
Com desconto: 180.75
Frete: 15.0
TOTAL: 195.75
```

---

### Projeto B (Código "Bonito" Mascarado)

```bash
cd /Users/delano/aulas/if006/projeto-b-bad-design

# Compilar (ordem importa!)
javac Database.java
javac DiscountReader.java
javac ShippingService.java
javac OrderProcessor.java

# Executar
java OrderProcessor
```

**Saída esperada:**
```
[DATABASE] Conectando...
[SHIPPING_SERVICE] Inicializando serviço de frete...
[DISCOUNT_READER] Carregando tabela de descontos...
[DATABASE] Salvando pedido do cliente GOLD com total: R$ 232.50
[LOG INTERNO] Desconto aplicado: 0.15

=== RECIBO DO PEDIDO ===
Cliente: GOLD
Region: SP
Subtotal: R$ 225.00
Com desconto: R$ 191.25
Total com frete: R$ 206.25
=======================
```

---

## 🔍 Análise Comparativa

### Exercício 1: Encontre os Nomes Ruins (Projeto A)

Abra `OrderProcessing.java` e identifique:
1. Todas as variáveis com nomes < 3 caracteres
2. Qual variável é mais confusa? Por quê?
3. Reescreva o método com nomes significativos

**Resposta esperada:**
- `c` → `customerType`
- `v1` → `subtotal`
- `v2` → `discountedPrice`
- `tp` → `customerTypeCode`
- `rg` → `region`
- `flag` → `isValid` (ou remove se não faz nada)

---

### Exercício 2: Conte o Arrow Code (Projeto A)

```java
if (c.equals("BRONZE")) {      // Nível 1
    tp = 1;
} else {
    if (c.equals("SILVER")) {  // Nível 2
        tp = 2;
    } else {
        if (c.equals("GOLD")) { // Nível 3
```

**Pergunta**: Quantos níveis de `else if` coninuam?
- Resposta: 4+ níveis (pesadelo!)

**Desafio**: Reescreva com Switch ou HashMap para reduzir para 1 nível

---

### Exercício 3: Encontre os Números Mágicos (Projeto A)

Procure por:
```
0.9, 0.85, 0.80, 0.75
15.0, 20.0, 35.0, 25.0, 50.0
```

**Pergunta**: Qual é o padrão?
- 0.9 = 10% desconto (tipo 1)
- 0.85 = 15% desconto (tipo 2)
- etc.

**Desafio**: Crie uma classe `DiscountTiers` com constantes:
```java
public class DiscountTiers {
    public static final double BRONZE_DISCOUNT = 0.10;
    public static final double SILVER_DISCOUNT = 0.15;
    public static final double GOLD_DISCOUNT = 0.20;
    public static final double PLATINUM_DISCOUNT = 0.25;
}
```

---

### Exercício 4: Identifique o Acoplamento (Projeto B)

Abra `OrderProcessor.java` e encontre:

1. **Onde são instanciadas as dependências?**
   ```java
   this.database = new Database();  // Linha X
   DiscountReader reader = new DiscountReader();  // Linha Y
   ShippingService shipping = new ShippingService();  // Linha Z
   ```

2. **Por que isso é problema?**
   - Em teste, você NÃO consegue controlar estas instâncias
   - Você NÃO pode criar um `DiscountReader` fake
   - Você NÃO pode usar um `Database` em memória

3. **Como consertar?**
   - Passar as dependências como parâmetros (injeção)
   - Usar interfaces ao invés de classes concretas

---

### Exercício 5: Identifique a Mistura de I/O com Lógica (Projeto B)

Em `OrderProcessor.java`:

1. **Qual método mistura cálculo com System.out?**
   - `applyCustomerDiscount()` → calcula E imprime log
   - `printReceipt()` → só imprime (menos pior)

2. **Por que é impossível testar?**
   ```java
   Double result = processor.applyCustomerDiscount(100.0);
   // Como você testa isso? 
   // - Não há assertEquals possível se imprime na tela
   // - Como você verifica se é 85.0 ou 80.0?
   ```

3. **Como consertar?**
   ```java
   // ❌ Ruim
   private Double applyDiscount(Double amount) {
       Double discounted = amount * (1 - discount);
       System.out.println("...");
       return discounted;
   }
   
   // ✅ Bom
   private Double applyDiscount(Double amount) {
       return amount * (1 - discount);  // Só retorna
   }
   // Quem chama decide se imprime ou não!
   ```

---

### Exercício 6: Tente Escrever Testes (Projeto B)

**Tente criar um arquivo `OrderProcessorTest.java`:**

```java
import org.junit.Test;
import static org.junit.Assert.*;

public class OrderProcessorTest {
    
    @Test
    public void testDiscountForGoldCustomer() {
        // O que você faria aqui?
        // Problema 1: OrderProcessor instancia Database
        // Problema 2: applyCustomerDiscount é private
        // Problema 3: Mesmo se fosse public, mistura I/O
        
        OrderProcessor processor = new OrderProcessor("GOLD", "SP");
        // Banco de dados foi criado aqui!
        
        // Como você testa applyCustomerDiscount?
        // Não consegue chamar (é private)
        // processor.applyCustomerDiscount(100.0);  // ERRO DE COMPILAÇÃO
    }
}
```

**Conclusão**: É impossível escrever teste unitário limpo!

---

### Exercício 7: Refatore o Projeto B

**Desafio**: Crie uma versão nova de `OrderProcessor` que:

1. Use **injeção de dependência** (receba Database, DiscountReader, etc. no construtor)
2. **Separe** cálculo de I/O
3. Faça métodos públicos que retornam valores (não imprimem)
4. Permita testes unitários simples

---

## 📊 Checklist de Manutenibilidade

Para cada projeto, preencha:

| Critério | Projeto A | Projeto B | Ideal |
|----------|-----------|-----------|--------|
| Nomes de variáveis significativos | ❌ | ✅ | ✅ |
| Métodos pequenos (<30 linhas) | ❌ | ✅ | ✅ |
| Sem aninhamento profundo | ❌ | ✅ | ✅ |
| Sem números mágicos | ❌ | ✅ | ✅ |
| Sem acoplamento | ✅ Óbvio | ❌ Oculto | ✅ |
| Separação de responsabilidades | ❌ | ❌ | ✅ |
| Separação de lógica e I/O | ❌ | ❌ | ✅ |
| Testável sem BD/API real | ❌ | ❌ | ✅ |
| Reusável em outro contexto | ❌ | ❌ | ✅ |

---

## 💡 Conclusão Pedagógica

- **Projeto A**: Problemas ÓBVIOS → fácil ver e ensinar
- **Projeto B**: Problemas SUTIS → por isso é mais perigoso
- **Ambos**: Para demonstrar que qualidade = mais que aparência

Use em aula mostrando que **uma classe bem estruturada COM BOM ACOPLAMENTO é melhor que múltiplas classes com mando acoplamento oculto**.
