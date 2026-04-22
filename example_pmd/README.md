# Exemplo PMD

Projeto Java com Maven para demonstrar, em aula, como o PMD executa analise estatica e aponta problemas de legibilidade, manutencao e padrao de codigo.

O projeto foi montado para fins didaticos. Ele contem problemas intencionais para que os estudantes vejam o PMD reportando violacoes no terminal e em relatorios.

## Objetivos da aula

- Entender o que o PMD analisa
- Executar a analise local com Maven
- Ler violacoes no terminal
- Gerar relatorio HTML
- Ajustar regras basicas do PMD

## O que o PMD faz

PMD e um analisador estatico de codigo-fonte. Ele aplica regras sobre estilo, design, error-prone e boas praticas, sem executar o programa.

No fluxo deste exemplo, o Maven compila o projeto e, na fase `verify`, executa:

- `pmd:check` para validar regras PMD
- `pmd:cpd-check` para detectar duplicacao de codigo

## Estrutura do projeto

```text
example_pmd/
├── pom.xml
├── pmd-ruleset.xml
├── README.md
└── src
    └── main/java/br/edu/if006/pmd
        ├── Main.java
        ├── PedidoService.java
        └── RelatorioDuplicado.java
```

## Pre-requisitos

- Java 17 ou superior
- Maven 3.9 ou superior

## Como executar a analise

Rodar validacao completa com falha da build em caso de violacao:

```bash
mvn verify
```

Rodar apenas PMD (gera relatorio, sem etapa de check):

```bash
mvn pmd:pmd
```

Rodar apenas CPD (duplicacao):

```bash
mvn pmd:cpd
```

## Onde ficam os relatorios

Depois da execucao:

- PMD: `target/site/pmd.html`
- CPD: `target/site/cpd.html`
- XML PMD: `target/pmd.xml`

## Problemas intencionais deste exemplo

### PedidoService.java

Arquivo: `src/main/java/br/edu/if006/pmd/PedidoService.java`

Problemas inseridos para a ferramenta acusar:

- Nome de metodo fora do padrao (`PROCESSAR_PEDIDO`) para regra de naming
- Parametros e variaveis com naming inadequado (`PedidoTipo`, `NivelPrioridade`, `x`)
- Campo privado nao utilizado
- Metodo privado nao utilizado
- `catch` vazio
- Metodo com complexidade ciclomatica elevada
- Uso de `System.out.println` em `Main`

### RelatorioDuplicado.java

Arquivo: `src/main/java/br/edu/if006/pmd/RelatorioDuplicado.java`

Problema inserido:

- Trechos duplicados para demonstrar deteccao por CPD

## Configuracao basica deste exemplo

### pom.xml

Responsabilidades principais:

- definir Java 17
- configurar o plugin `maven-pmd-plugin`
- executar `check` e `cpd-check` na fase `verify`

Trecho principal:

```xml
<execution>
  <id>pmd-check</id>
  <phase>verify</phase>
  <goals>
    <goal>check</goal>
    <goal>cpd-check</goal>
  </goals>
</execution>
```

### pmd-ruleset.xml

Responsabilidades principais:

- definir quais regras PMD serao aplicadas
- priorizar regras de legibilidade e manutencao para aula
- ajustar limiar de complexidade

## Regras destacadas no exemplo

- `ClassNamingConventions`
- `FieldNamingConventions`
- `FormalParameterNamingConventions`
- `LocalVariableNamingConventions`
- `MethodNamingConventions`
- `UnusedLocalVariable`
- `UnusedPrivateField`
- `UnusedPrivateMethod`
- `SystemPrintln`
- `EmptyCatchBlock`
- `CyclomaticComplexity`

## Exercicios sugeridos para os estudantes

1. Rodar `mvn verify` e listar as violacoes.
2. Corrigir nomes fora do padrao e rodar novamente.
3. Remover `catch` vazio e registrar tratamento adequado.
4. Quebrar o metodo `PROCESSAR_PEDIDO` em metodos menores para reduzir complexidade.
5. Eliminar duplicacao em `RelatorioDuplicado` e verificar o efeito no CPD.
6. Ajustar o limiar de `CyclomaticComplexity` no `pmd-ruleset.xml` e comparar resultado.

## Referencias

- Documentacao PMD: https://pmd.github.io/
- Regras Java PMD: https://docs.pmd-code.org/latest/pmd_rules_java.html
- Maven PMD Plugin: https://maven.apache.org/plugins/maven-pmd-plugin/
