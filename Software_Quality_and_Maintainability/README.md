# 📦 Sistema de Processamento de Pedidos E-commerce

## 📋 Descrição

Sistema que processa pedidos de e-commerce com as seguintes funcionalidades:

- ✅ **Cálculo de Total**: Soma o valor de todos os itens do pedido
- ✅ **Aplicação de Descontos**: Descontos progressivos baseados no tipo de cliente
- ✅ **Cálculo de Frete**: Custo de envio variável por região
- ✅ **Finalização de Pedido**: Consolidação de todos os valores e geração de recibo

---

## 🎯 Tipos de Clientes e Descontos

| Tipo de Cliente | Desconto |
|-----------------|----------|
| Bronze | 5% |
| Silver | 10% |
| Gold | 15% |
| Platinum | 20% |

---

## 🚚 Regiões e Frete

| Região | Custo Base |
|--------|-----------|
| SP | R$ 15,00 |
| MG | R$ 20,00 |
| BA | R$ 35,00 |
| SC | R$ 25,00 |
| Outras | R$ 50,00 |

**Nota**: Pedidos com valor >R$ 500,00 têm 20% de taxa adicional no frete.

---

## 💰 Exemplo de Processamento

**Entrada:**
- Cliente: Gold
- Região: SP
- Itens: R$ 100,00 + R$ 50,00 + R$ 75,00

**Cálculo:**
1. Subtotal: R$ 225,00
2. Desconto (15%): -R$ 33,75 → R$ 191,25
3. Frete: +R$ 15,00
4. **Total Final: R$ 206,25**

---

## 🏃 Como Executar

### Projeto A - Versão 1
```bash
cd projeto-a
javac OrderProcessing.java
java OrderProcessing
```

### Projeto B - Versão 2
```bash
cd projeto-b
javac Database.java DiscountReader.java ShippingService.java OrderProcessor.java
java OrderProcessor
```

---

## 📤 Saída Esperada

Ambos os projetos processam um pedido de exemplo e geram um recibo com:
- Tipo de cliente
- Região de envio
- Subtotal do pedido
- Valor com desconto aplicado
- Custo de frete
- Total final do pedido

---

## 🔄 Fluxo do Processamento

```
1. Recebe lista de itens
   ↓
2. Calcula subtotal (soma)
   ↓
3. Identifica tipo de cliente
   ↓
4. Aplica desconto apropriado
   ↓
5. Identifica região
   ↓
6. Calcula frete por região
   ↓
7. Calcula total final
   ↓
8. Gera e exibe recibo
```

---

## 🎓 Propósito Didático

Este sistema foi criado em **duas implementações diferentes** para observar e comparar diferentes abordagens de desenvolvimento, estrutura de código e organização.

Ambas as versões implementam **exatamente as mesmas regras de negócio** e produzem **os mesmos resultados funcionais**.

---

## 📝 Detalhes Técnicos

- **Linguagem**: Java
- **Paradigma**: Orientado a Objetos
- **Versão Java**: 11+
- **Dependências**: Nenhuma (código puro)

