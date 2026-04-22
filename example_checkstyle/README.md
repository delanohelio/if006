# Exemplo Checkstyle

Projeto Java com Maven para demonstrar, em aula, como o Checkstyle aplica regras de formatacao, convencoes de nomeacao e padroes de legibilidade.

O projeto foi montado para fins didaticos. Ele contem problemas intencionais para que os estudantes vejam o Checkstyle falhando a build e listando as violacoes no terminal.

## Objetivos da aula

- Entender o que o Checkstyle analisa
- Executar a analise local com Maven
- Ler violacoes no terminal
- Ajustar regras de estilo no arquivo de configuracao

## O que o Checkstyle faz

Checkstyle e uma ferramenta de analise estatica focada em padroes de estilo, formatacao e convencoes de codigo.

No fluxo deste exemplo, o Maven executa `checkstyle:check` na fase `verify`. Se houver violacoes, a build falha.

## Estrutura do projeto

```text
example_checkstyle/
├── pom.xml
├── checkstyle.xml
├── README.md
└── src
    └── main/java/br/edu/if006/checkstyle
        ├── Main.java
        ├── PedidoService.java
        └── relatorioFinanceiro.java
```

## Pre-requisitos

- Java 17 ou superior
- Maven 3.9 ou superior

## Como executar a analise

Rodar validacao completa:

```bash
mvn verify
```

Rodar apenas Checkstyle:

```bash
mvn checkstyle:check
```

Gerar relatorio HTML:

```bash
mvn checkstyle:checkstyle
```

## Onde ficam os resultados

Depois da execucao:

- XML: `target/checkstyle-result.xml`
- HTML: `target/site/checkstyle.html` (quando usar `checkstyle:checkstyle`)

## Problemas intencionais deste exemplo

### PedidoService.java

Arquivo: `src/main/java/br/edu/if006/checkstyle/PedidoService.java`

Violacoes intencionais para demonstracao:

- Nome de metodo fora do padrao (`PROCESSAR_PEDIDO`)
- Nome de parametro fora do padrao (`TipoPedido`, `Prioridade`)
- Nome de variavel local fora do padrao (`Resultado`)
- Falta de espacos em assinatura e condicoes
- `if` sem chaves para demonstrar `NeedBraces`
- Uso de numeros magicos (`7`, `99`, `3`, `2`)
- Comentario `TODO`

### relatorioFinanceiro.java

Arquivo: `src/main/java/br/edu/if006/checkstyle/relatorioFinanceiro.java`

Violacoes intencionais:

- Nome de classe fora do padrao (`TypeName`)
- Linha longa para demonstrar `LineLength`

## Configuracao basica deste exemplo

### pom.xml

Responsabilidades principais:

- definir Java 17
- configurar `maven-checkstyle-plugin`
- executar `check` na fase `verify`

Trecho principal:

```xml
<execution>
  <id>checkstyle-check</id>
  <phase>verify</phase>
  <goals>
    <goal>check</goal>
  </goals>
</execution>
```

### checkstyle.xml

Responsabilidades principais:

- definir regras didaticas para aula
- priorizar nomeacao e formatacao ligadas a legibilidade

Regras destacadas no exemplo:

- `TypeName`
- `MethodName`
- `ParameterName`
- `LocalVariableName`
- `Indentation`
- `WhitespaceAround`
- `WhitespaceAfter`
- `NeedBraces`
- `LineLength`
- `TodoComment`
- `EmptyLineSeparator`
- `MagicNumber`

## Exercicios sugeridos para os estudantes

1. Rodar `mvn verify` e listar as violacoes.
2. Corrigir naming (classe, metodo, parametros e variaveis).
3. Adicionar chaves nos `if` sem bloco.
4. Substituir numeros magicos por constantes com nomes claros.
5. Reformatar linhas e espacos para atender as regras.
6. Ajustar regras no `checkstyle.xml` e comparar o resultado.

## Referencias

- Documentacao Checkstyle: https://checkstyle.org/
- Lista de checks: https://checkstyle.sourceforge.io/checks.html
- Maven Checkstyle Plugin: https://maven.apache.org/plugins/maven-checkstyle-plugin/
