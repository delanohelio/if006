# IF006 - Legibilidade e Manutenabilidade de Codigo

Repositorio de atividades praticas da disciplina **IF006 - Legibilidade e Manutenabilidade de Codigo**.

Este material foi organizado para apoiar aulas sobre:
- leitura e compreensao de codigo
- identificacao de code smells e anti-padroes
- impacto de decisoes de design em analisabilidade, modificabilidade e testabilidade
- refatoracao orientada a melhoria de qualidade

## Objetivo do repositorio

Concentrar exercicios, guias e exemplos comparativos para que estudantes possam:
- analisar codigo com problemas reais de manutencao
- medir custo de leitura versus escrita de codigo
- propor melhorias de design e estrutura
- discutir boas praticas de codigo limpo e arquitetura

## Praticas disponiveis

### 1) Pratica 2026-03-17 - Auditoria de codigo legado (e-commerce)

Compara duas implementacoes com o mesmo comportamento funcional:
- **Projeto A**: foco em baixa analisabilidade e baixa modificabilidade
- **Projeto B**: codigo aparentemente organizado, mas com baixa testabilidade e alto acoplamento

Material principal:
- `pratica_20260317/task.md`
- `pratica_20260317/COMPARACAO_DIDATICA.md`
- `pratica_20260317/GUIA_EXECUCAO_E_ANALISE.md`

### 2) Pratica 2026-03-24 - Custo de leitura vs escrita

Atividade experimental para medir o custo cognitivo de manter codigo com code smells.

Material principal:
- `pratica_20260324/atividade-leitura-escrita.md`

## Como executar os exemplos Java

Pre-requisito:
- Java 11 ou superior instalado

### Projeto A

```bash
cd pratica_20260317/projeto-a
javac OrderProcessing.java
java OrderProcessing
```

### Projeto B

```bash
cd pratica_20260317/projeto-b
javac Database.java DiscountReader.java ShippingService.java OrderProcessor.java
java OrderProcessor
```

### Projeto C

```bash
cd pratica_20260324/projeto-c
javac InventoryManager.java InventoryManagerRefactored.java
java InventoryManager
```


## Licenca e uso academico

Este repositorio foi preparado para fins educacionais na disciplina IF006.
