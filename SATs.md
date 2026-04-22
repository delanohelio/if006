# Ferramentas de Análise Estática para Legibilidade de ódigo

Este material resume ferramentas de analise estatica e conecta os conceitos com exemplos deste repositorio.

Para análise geral de regras associadas com legibilidade de código, foi extraído a lista de regras avaliada na RQ6 do estudo ([Understanding Code Understandability Improvements in Code Reviews](http://arxiv.org/pdf/2410.21990)): 

[RQ6 - Can linters detect the identified code understandability smells?](https://github.com/codeupcrc/codeupcrc.github.io/blob/main/RQ6.md)

## O que é análise estática?

Análise estática e a avaliacao automatica do codigo sem executar o programa.
Ela ajuda a identificar problemas de:
- legibilidade
- padronização
- manutenção
- potenciais bugs

## Ferramentas

### SonarQube
- Plataforma de inspecao continua de qualidade de codigo.
- Agrega regras de qualidade e code smells, incluindo regras ligadas a legibilidade.
- Pode ser integrada ao CI para bloquear regressao de qualidade.

Exemplo no repositorio:
- [example_sonar](../example_sonar)

### SpotBugs
- Analisa bytecode Java para encontrar padroes de bugs.
- Embora focada em defeitos, tambem encontra sinais que afetam clareza e manutencao (por exemplo, campos nao usados).

Exemplo no repositorio:
- [example_spotbugs](../example_spotbugs)

### PMD
- Analisa codigo-fonte com regras de estilo, design e boas praticas.
- Tem forte cobertura em nomeacao, documentacao e codigo desnecessario.

Exemplo no repositorio:
- [example_pmd](./example_pmd)

### Checkstyle
- Ferramenta focada em convencoes de estilo e formatacao.
- Muito util para padronizar legibilidade no nivel de linha, bloco e arquivo.

Exemplo no repositorio:
- [example_checkstyle](./example_checkstyle)

## Regras de legibilidade e ferramentas associadas

A lista abaixo consolida as regras marcadas como cobertas (Covered = Yes) no RQ6, por ferramenta no estudo realizado por Delano et al.

### SpotBugs
- NM_FIELD_NAMING_CONVENTION
- URF_UNREAD_FIELD
- URF_UNREAD_PUBLIC_OR_PROTECTED_FIELD
- UUF_UNUSED_PUBLIC_OR_PROTECTED_FIELD
- UWF_NULL_FIELD

### PMD
- ClassNamingConventions
- CommentRequired
- ControlStatementBraces
- FieldNamingConventions
- FormalParameterNamingConventions
- LocalVariableNamingConventions
- MethodNamingConventions
- SignatureDeclareThrowsException
- SystemPrintln
- UnnecessaryFullyQualifiedName
- UnnecessaryImport
- UnusedLocalVariable
- UnusedPrivateField
- UnusedPrivateMethod
- UselessParentheses

### SonarQube
- Local variable and method parameter names should comply with a naming convention
- Test classes should comply with a naming convention
- Unused "private" methods should be removed
- Unused assignments should be removed
- Sections of code should not be commented out
- Unused "private" fields should be removed
- Simple class names should be used
- Unnecessary imports should be removed
- Unused local variables should be removed
- Source code should be indented consistently
- Comments should not be located at the end of lines of code
- Multiline blocks should be enclosed in curly braces
- Control structures should use curly braces
- Redundant pairs of parentheses should be removed
- Parentheses should be removed from a single lambda input parameter when its type is inferred
- An open curly brace should be located at the beginning of a line
- Files should contain an empty newline at the end
- Lines should not be too long
- Close curly brace and the next "else", "catch" and "finally" keywords should be located on the same line
- Conditionals should start on new lines
- A conditionally executed single line should be denoted by indentation
- Generic exceptions should never be thrown
- Standard outputs should not be used directly to log anything
- Magic numbers should not be used
- Track uses of "TODO" tags
- Public types, methods and fields (API) should be documented with Javadoc

### Checkstyle
- AbbreviationAsWordInName
- AtclauseOrder
- EmptyLineSeparator
- ExplicitInitialization
- Indentation
- LeftCurly
- LineLength
- LocalVariableName
- MagicNumber
- MethodName
- MissingJavadocMethod
- MissingJavadocType
- NeedBraces
- NewlineAtEndOfFile
- NoWhitespaceAfter
- ParameterName
- RequireThis
- RightCurly
- SingleSpaceSeparator
- TodoComment
- TrailingComment
- TypeName
- UnnecessaryParentheses
- UnusedImports
- UnusedLocalVariable
- WhitespaceAfter
- WhitespaceAround
- WriteTag

## Observacao

No repositorio atual, ha exemplos prontos de execucao para SonarQube, SpotBugs, PMD e Checkstyle. A lista de regras acima foi consolidada a partir do estudo RQ6, que mapeia quais ferramentas cobrem aspectos ligados a legibilidade de codigo.