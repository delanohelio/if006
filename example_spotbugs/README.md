# Exemplo SpotBugs

Projeto Java de exemplo para demonstrar o uso do **SpotBugs**, uma ferramenta de análise estática que detecta bugs em bytecode Java sem executar o programa.

## O que é análise estática?

Análise estática é o processo de examinar o código-fonte (ou bytecode) **sem executá-lo**, com o objetivo de encontrar problemas como:

- Erros de lógica que o compilador não detecta
- Má uso de APIs da linguagem
- Vulnerabilidades de segurança
- Violações de boas práticas

O SpotBugs analisa o **bytecode** compilado (`.class`) e procura por padrões conhecidos de bugs, chamados de **bug patterns**.

---

## Estrutura do Projeto

```
example_spotbugs/
├── pom.xml                          # Configuração Maven com o plugin SpotBugs
├── spotbugs-exclude.xml             # Filtro de exclusão de bugs
└── src/main/java/br/edu/exemplo/
    ├── Main.java                    # Ponto de entrada
    ├── GerenciadorUsuario.java      # Classe com 5 bugs intencionais
    └── ArquivoUtil.java             # Classe com 1 bug excluído e 1 bug ativo
```

---

## Pré-requisitos

- Java 17+
- Maven 3.6+

---

## Como Executar

### Rodar a análise e falhar a build se houver bugs

```bash
mvn verify
```

A build **irá falhar** pois existem bugs não cobertos pelo filtro de exclusão. O SpotBugs exibirá no terminal a lista de bugs encontrados com o nome do padrão, classe e linha.

### Rodar apenas o SpotBugs (sem falhar a build)

```bash
mvn spotbugs:spotbugs
```

Gera o relatório em `target/spotbugsXml.xml` sem interromper a build.

### Abrir a interface gráfica do SpotBugs

```bash
mvn spotbugs:gui
```

Abre uma janela visual onde é possível navegar pelos bugs encontrados, ver a descrição de cada padrão e a linha do código afetado.

---

## Bugs Intencionais

### `GerenciadorUsuario.java`

#### BUG 1 — `ES_COMPARING_STRINGS_WITH_EQ`

```java
// ERRADO
return role == "ADMIN";

// CORRETO
return role.equals("ADMIN");
```

**Por que é um bug?** O operador `==` compara **referências de memória**, não o conteúdo da String. Duas Strings com o mesmo texto podem estar em endereços diferentes, fazendo a comparação retornar `false` inesperadamente.

---

#### BUG 2 — `EI_EXPOSE_REP` (Expose Internal Representation)

```java
// ERRADO
public String[] getPermissoes() {
    return permissoes; // retorna a referência interna
}

// CORRETO
public String[] getPermissoes() {
    return Arrays.copyOf(permissoes, permissoes.length);
}
```

**Por que é um bug?** Retornar a referência direta a um array interno permite que código externo modifique o estado privado do objeto, quebrando o **encapsulamento**. O chamador pode fazer `usuario.getPermissoes()[0] = "ADMIN"` e alterar o estado interno sem passar pelos métodos da classe.

---

#### BUG 3 — `OS_OPEN_STREAM`

```java
// ERRADO
FileInputStream fis = new FileInputStream(caminho);
byte[] dados = fis.readAllBytes(); // se lançar exceção, fis nunca é fechado
fis.close();

// CORRETO
try (FileInputStream fis = new FileInputStream(caminho)) {
    return new String(fis.readAllBytes(), StandardCharsets.UTF_8);
}
```

**Por que é um bug?** Se `readAllBytes()` lançar uma exceção, a execução pula `fis.close()` e o stream fica aberto, causando **vazamento de recursos** (file descriptor leak). O `try-with-resources` garante que o stream seja fechado mesmo em caso de exceção.

---

#### BUG 4 — `DM_DEFAULT_ENCODING`

```java
// ERRADO
return new String(dados);

// CORRETO
return new String(dados, StandardCharsets.UTF_8);
```

**Por que é um bug?** Sem especificar o charset, a JVM usa o **encoding padrão do sistema operacional**, que varia entre ambientes (Windows usa CP1252, Linux usa UTF-8, macOS usa UTF-8). Isso causa corrupção de caracteres especiais (acentos, cedilha) em ambientes diferentes.

---

#### BUG 5 — `NP_NULL_ON_SOME_PATH` (Null Pointer Dereference)

```java
// ERRADO
String perfil = config.get("perfil"); // retorna null se a chave não existir
return perfil.toUpperCase();          // NullPointerException!

// CORRETO
return config.getOrDefault("perfil", "").toUpperCase();
```

**Por que é um bug?** `Map.get()` retorna `null` quando a chave não existe. Chamar qualquer método em `null` lança `NullPointerException` em tempo de execução. O compilador Java não detecta este erro — é exatamente o tipo de problema que a análise estática encontra.

---

### `ArquivoUtil.java`

#### BUG 6 — `MS_MUTABLE_ARRAY` *(ativo, não excluído)*

```java
// ERRADO
public static final String[] EXTENSOES_PERMITIDAS = {".txt", ".csv", ".json"};

// CORRETO
public static final List<String> EXTENSOES_PERMITIDAS =
    Collections.unmodifiableList(Arrays.asList(".txt", ".csv", ".json"));
```

**Por que é um bug?** `final` em uma variável de array impede a **reatribuição** da variável, mas não impede a modificação do **conteúdo** do array. Qualquer classe pode fazer `ArquivoUtil.EXTENSOES_PERMITIDAS[0] = ".exe"` e comprometer a segurança da validação.

---

#### BUG 7 — `RV_RETURN_VALUE_IGNORED_BAD_PRACTICE` *(excluído pelo filtro)*

```java
arquivo.delete(); // retorno boolean ignorado
```

**Por que é um bug?** `File.delete()` retorna `true` se o arquivo foi deletado com sucesso e `false` em caso de falha (arquivo inexistente, sem permissão, etc.). Ignorar este retorno significa que o programa não sabe se a operação funcionou.

**Por que foi excluído?** Neste contexto específico, a remoção do arquivo é uma operação *best-effort* (melhor esforço). A falha não impacta o fluxo principal da aplicação. A exclusão está documentada em `spotbugs-exclude.xml`.

---

## Filtro de Exclusão (`spotbugs-exclude.xml`)

O filtro define quais bugs devem ser **ignorados** pela análise. Cada bloco `<Match>` especifica a classe, o método e o padrão de bug a suprimir:

```xml
<Match>
    <Class name="br.edu.exemplo.ArquivoUtil"/>
    <Method name="removerArquivoTemporario"/>
    <Bug pattern="RV_RETURN_VALUE_IGNORED_BAD_PRACTICE"/>
</Match>
```

### Exercício: ver o efeito do filtro

1. Abra `spotbugs-exclude.xml` e **comente ou remova** o bloco `<Match>` acima
2. Execute `mvn verify`
3. Observe a build falhar agora também com `RV_RETURN_VALUE_IGNORED_BAD_PRACTICE`
4. Restaure o bloco para ver a build voltar a passar com relação a esse bug

> **Atenção:** filtros de exclusão devem sempre ser bem justificados. Suprimir warnings indiscriminadamente elimina o valor da análise estática.

---

## Configuração do Plugin (`pom.xml`)

```xml
<configuration>
    <effort>Max</effort>
    <threshold>Low</threshold>
    <excludeFilterFile>spotbugs-exclude.xml</excludeFilterFile>
    <failOnError>true</failOnError>
</configuration>
```

| Parâmetro | Valores | Descrição |
|---|---|---|
| `effort` | `Min`, `Default`, `Max` | Profundidade da análise. `Max` é mais lento, porém mais completo. |
| `threshold` | `Low`, `Medium`, `High` | Confiança mínima para reportar. `Low` reporta todos os warnings. |
| `excludeFilterFile` | caminho do arquivo | Arquivo XML com os bugs a suprimir. |
| `failOnError` | `true` / `false` | Se `true`, a build falha ao encontrar bugs não suprimidos. |

---

## Referências

- [Documentação oficial do SpotBugs](https://spotbugs.readthedocs.io/)
- [Lista completa de bug patterns](https://spotbugs.readthedocs.io/en/latest/bugDescriptions.html)
- [Documentação do plugin Maven](https://spotbugs.github.io/spotbugs-maven-plugin/)
- [Sintaxe dos filtros de exclusão](https://spotbugs.readthedocs.io/en/latest/filter.html)
