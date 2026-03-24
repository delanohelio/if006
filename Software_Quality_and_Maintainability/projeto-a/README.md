# Projeto A - Código com Péssima Analisabilidade e Modificabilidade

## 📋 Propósito Didático

Este projeto demonstra **como NÃO fazer** ao focar em destruir a **analisabilidade** (capacidade de entender o código) e **modificabilidade** (capacidade de adicionar/alterar funcionalidades).

## 🚫 Falhas Arquiteturais Intencionais

### 1. **Péssimos Nomes de Variáveis**
```java
String c;        // É cliente? Contexto? Currency?
Double v1, v2;   // Versão 1 e 2? Valor 1 e 2?
Integer tp;      // Type? Tipo? Tamanho do pedido?
String rg;       // Region? Registro?
Boolean flag;    // Para que serve exatamente?
```

**Impacto**: Developer gasta 10x mais tempo tentando entender o código.

### 2. **Números Mágicos Sem Contexto**
```java
if (tp == 1) {
    v2 = v1 * 0.9;  // Por que 0.9? Qual é o tipo 1? 
}
```

**Impacto**: Impossível manter ou corrigir bugs sem documentação externa.

### 3. **Arrow Code (Aninhamento Profundo de IF/ELSE)**
```java
if (c.equals("BRONZE")) {
    tp = 1;
} else {
    if (c.equals("SILVER")) {
        tp = 2;
    } else {
        if (c.equals("GOLD")) {
            // ... mais um nível
        }
    }
}
```

**Impacto**: Adicionar uma nova categoria de cliente requer:
- Entender toda a pirâmide de IFs
- Risco alto de quebrar lógica existente
- Difícil de testar

### 4. **Método Gigantesco com Múltiplas Responsabilidades**
- Cálculo de total
- Aplicação de desconto
- Cálculo de frete
- Impressão de recibo

Tudo em um único método `process()`.

## 📊 Comparação: Antes vs Depois

| Aspecto | Projeto A | Versão Corrigida |
|---------|-----------|------------------|
| Nomes de variáveis | `c, v1, v2, tp, rg, flag` | `customerType, items, subtotal, discountedPrice, region, shippingCost` |
| Estrutura | 1 método gigantesco | Múltiplos métodos pequenos |
| Aninhamento | 4+ níveis | Máximo 2 níveis |
| Números mágicos | `0.9, 0.85, 0.80, 0.75` | Constantes nomeadas |
| Manutenção | Pesadelo | Simples |

## 💡 Lições Aprendidas

1. **Nomes significativos** tornam código auto-documentado
2. **Pequenos métodos** são mais fáceis de entender
3. **Constantes nomeadas** explicam "por quê"
4. **Evitar aninhamento** reduz complexidade cognitiva

## 🛠️ Como Executar

```bash
javac OrderProcessing.java
java OrderProcessing
```

## ⚠️ NÃO USE ESTE CÓDIGO EM PRODUÇÃO!

Este é material puramente educacional para demonstrar **anti-padrões**.
