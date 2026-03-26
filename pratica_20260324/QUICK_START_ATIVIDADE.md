# 📋 RESUMO EXECUTIVO: Atividade de Leitura vs. Escrita

## O QUE FOI CRIADO

Você recebeu uma atividade **completa e pronta para usar em sala** com 3 componentes:

```
projeto-c/
├── README.md                           ← Guia do professor
├── InventoryManager.java               ← CÓDIGO SUJO (para alunos)
├── InventoryManagerRefactored.java     ← CÓDIGO LIMPO (referência)
└── atividade-leitura-escrita.md        ← Enunciado da atividade

GUIA_ANALISE_ATIVIDADE.md               ← Discussão pós-atividade
```

---

## ✅ CHECKLIST: O QUE ESTÁ PRONTO

- ✅ **Enunciado da atividade** com timeline clara
- ✅ **Código desorganizado** com intenção didática
  - ❌ Nomes péssimos (c, tp, it, v1, v2)
  - ❌ God Object (6 listas desconexas)
  - ❌ Magic numbers (0.9, 0.95)
  - ❌ Mistura lógica + I/O
  - ❌ BUG real: Notificação duplicada
  - ❌ Impossível testar

- ✅ **Duas tarefas claras para os alunos:**
  1. Corrigir bug de notificação duplicada
  2. Implementar suporte a desconto

- ✅ **Código refatorado** como solução
  - Classe `Product` bem estruturada
  - Classe `NotificationService` separada
  - Métodos testáveis
  - Bug corrigido elegantemente
  - Desconto integrado naturalmente

- ✅ **Guia completo para o professor**
  - Tempos esperados (15 min leitura, 20 min implementação)
  - Análise de 7 code smells específicos
  - Perguntas de discussão
  - Métricas comparativas

---

## 🎯 COMO USAR EM AULA

### Preparação (2 min antes da aula)
1. Imprima/compartilhe: `atividade-leitura-escrita.md`
2. Tenha pronto para mostrar: `InventoryManagerRefactored.java`
3. Estude: `GUIA_ANALISE_ATIVIDADE.md`

### Durante a Aula (35 min)

| Tempo | Atividade | Arquivo |
|-------|-----------|---------|
| 5 min | Contexto + Explicação | Explicação verbal |
| 10 min | **Fase 1: Leitura** | Alunos abrem `InventoryManager.java` |
| 20 min | **Fase 2: Implementação** | Editam mesmo arquivo |
| A qualquer hora | **Análise Pós** | Projetar `InventoryManagerRefactored.java` |

### Depois da Aula (10 min)
Discussão usando `GUIA_ANALISE_ATIVIDADE.md`:
- Compare side-by-side
- Pergunte quantos tempos
- Peça feedback

---

## 📊 RESULTADOS ESPERADOS

```
CÓDIGO SUJO
Leitura:       15 minutos (difícil entender)
Implementação: 20 minutos (onde fazer? como?)
TOTAL:         35 minutos ⚠️

CÓDIGO LIMPO  
Leitura:       5 minutos (entende rápido)
Implementação: 10 minutos (bem direto)
TOTAL:         15 minutos ✅

DIFERENÇA:     2.3x MAIS RÁPIDO COM CÓDIGO LIMPO
```

---

## 💡 DINÂMICA SUGERIDA

### Passo 1: "Leiam sem entender"
*"Vocês têm 10 minutos para ler `InventoryManager.java`. Tentem encontrar o bug e onde colocar desconto. Sem copiar/colar nada. Só lendo mesmo."*

### Passo 2: "Agora corrijam"
*"20 minutos para fazer as duas tarefas. Podem editar o código à vontade."*

### Passo 3: "Vocês conseguiram?"
*Coleta feedbacks:*
- Quantos encontraram o bug? (~30%)
- Quantos confiavam no código? (~10%)
- Qual foi a maior dificuldade?

### Passo 4: "OLHEM ISTO"
*Projetar `InventoryManagerRefactored.java`*

*"Isto é o MESMO sistema, mas escrito bem. Vejam como é fácil entender, como é fácil achar bugs, como é fácil adicionar features."*

### Passo 5: "DISCUSSÃO"
Usar `GUIA_ANALISE_ATIVIDADE.md` como roteiro:
- Por que demorou mais?
- Qual code smell foi mais prejudicial?
- Qual arquivo deixava você mais seguro?

---

## 🐛 O BUG QUE OS ALUNOS PRECISAM CORRIGIR

**Localização:** Método `checkLowStock()` em `InventoryManager.java`

**Problema:** Se chamar `checkLowStock()` 3 vezes → alerta 3 vezes do mesmo produto

**Dica (não diga direto):**
- "Veja que existe um mapa `lastNotifTime`"
- "Por que não está sendo usado para checar a data?"

---

## 🎁 O QUE IMPLEMENTAR (DESCONTO)

**Localização:** Método `listProducts()` em `InventoryManager.java`

**Requisito:** Mostrar preço com desconto ao listar

**Desafio:** De onde vem o desconto? Não existe parâmetro em `addProduct()`!

**Isso é proposital** para demonstrar como código ruim força decisões ruins.

---

## 📚 MATERIAIS DE REFERÊNCIA

| Arquivo | Propósito |
|---------|-----------|
| `projeto-c/README.md` | **Para o professor:** Contexto completo |
| `atividade-leitura-escrita.md` | **Para alunos:** Enunciado + timing |
| `InventoryManager.java` | **Para alunos:** Código para corrigir |
| `InventoryManagerRefactored.java` | **Para professor:** Solução + exemplar |
| `GUIA_ANALISE_ATIVIDADE.md` | **Para professor:** Análise + discussão |

---

## 🚀 EXTENSÕES POSSÍVEIS

Se tiver mais tempo:

1. **Peça refatoração:**
   > "Rewrite `InventoryManager.java` seguindo o padrão de `InventoryManagerRefactored.java`"

2. **Teste unitário:**
   > "Escreva testes JUnit para `Product.getFinalPrice()`"

3. **Comparação automática:**
   > "Use ferramentas para medir: linhas de código, complexidade ciclomática, testabilidade"

4. **Padrões de design:**
   > "Em qual padrão design se baseou `NotificationService`?"

---

## ⚠️ NOTAS IMPORTANTES

- **Não revele a solução muito cedo**
- Os alunos PRECISAM lutar com o código sujo para sentir a dificuldade
- O valor da atividade está na mensagem: "Código ruim custa tempo real"
- Deixe-os frustrados PROPOSITALMENTE (é didático)

---

## 🎓 APRENDIZADOS QUE DEVERÃO SACAR

Ao final, os alunos vão entender:

1. ✅ Legibilidade não é luxo, é necessidade
2. ✅ Code smells têm impacto mensurável
3. ✅ Refatoração é investimento, não overhead
4. ✅ Design afeta a produtividade da equipe
5. ✅ Bom código reza confiança para modificar

---

**Criado:** 24 de março de 2026  
**Versão:** 1.0 - Completa e Pronta para Usar
