# Códigos com Átomos de Confusão

Este material contém 10 trechos de código contendo "átomos de confusão" — padrões que causam equívocos semânticos apesar de serem sintaticamente corretos.

Baseado em: Atoms of Confusion in Code (https://arxiv.org/abs/2103.05424)

Use um código por grupo. A tarefa é:
1. **Fase 1 e 2:** Gerar código que reproduza esta funcionalidade usando o prompt sugerido.
2. **Fase 3 e 4:** Revisar e melhorar o código gerado em relação ao original.

---

## AC01 - Filtro de Relevância (Conversão Implícita)

```java
public class RelevanceFilter {
    public static int calculateScore(int[] votes) {
        int score = 0;
        for (int i = 0; i < votes.length; i++) {
            score += (votes[i] > 0) ? 1 : 0;
        }
        return score;
    }
}
```

**Átomos presentes:** Conversão implícita de booleano para inteiro, operador ternário, semântica não clara.

**Prompt sugerido para gerar este código:**
"Escreva um método que receba um array de votos e retorne uma pontuação de relevância contando quantos votos são positivos."

---

## AC02 - Validador de Acesso (Precedência de Operador)

```java
public class AccessValidator {
    public static boolean canAccess(String user, String password, boolean adminOverride) {
        return user != null && password.length() > 5 || adminOverride;
    }
}
```

**Átomos presentes:** Precedência de operador, boolean complexo, lógica ambígua de negócio.

**Prompt sugerido para gerar este código:**
"Escreva um método que valida se um usuário pode acessar um recurso. Retorna verdadeiro se o usuário forneceu uma senha válida (mais de 5 caracteres) OU se há um override de administrador."

---

## AC03 - Processador de Sequência (Pre/Pós-incremento)

```java
public class SequenceProcessor {
    public static void processWindow() {
        int position = 5;
        int result = position++ + ++position + position;
        System.out.println(result);
    }
}
```

**Átomos presentes:** Pre/pós-incremento em mesma expressão, lado-efeito não-óbvio, indeterminação.

**Prompt sugerido para gerar este código:**
"Escreva um método que processa uma janela de dados começando na posição 5. Calcule um resultado que envolva a posição em três momentos diferentes. Imprima o resultado."

---

## AC04 - Mapeador de Conceitos (Ternário Aninhado)

```java
public class ConceptMapper {
    public static String mapGrade(int score) {
        return score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : "F";
    }
}
```

**Átomos presentes:** Ternário aninhado, precedência implícita, dificuldade de leitura.

**Prompt sugerido para gerar este código:**
"Escreva um método que mapeie uma nota numérica para conceitos acadêmicos: 90+ = A, 80-89 = B, 70-79 = C, <70 = F."

---

## AC05 - Iterador com Contador (Variable Shadowing)

```java
public class ItemIterator {
    private int iteration = 0;

    public void process() {
        for (int iteration = 0; iteration < 10; iteration++) {
            System.out.println(this.iteration + iteration);
        }
    }
}
```

**Átomos presentes:** Variable shadowing, escopo confuso, referência implícita de this.

**Prompt sugerido para gerar este código:**
"Escreva uma classe que rastreia iterações. Tenha uma variável de instância para contar o total (inicializada com 0). Implemente um método que loop 10 vezes e imprima a soma da contagem total com a iteração atual."

---

## AC06 - Processador de Fila (Efeito Colateral em Condição)

```java
public class QueueProcessor {
    public static void processItems(java.util.List<String> items) {
        int index = 0;
        while ((index < items.size()) && (isValid(items.get(index++)))) {
        }
    }

    private static boolean isValid(String item) {
        return item != null && item.length() > 0;
    }
}
```

**Átomos presentes:** Efeito colateral em condição, incremento em argumento, fluxo não-óbvio.

**Prompt sugerido para gerar este código:**
"Escreva um método que processa uma lista de itens validando cada um. Use uma função auxiliar que retorna verdadeiro se o item é válido (não nulo e não vazio)."

---

## AC07 - Leitor de Configuração (Atribuição em Condição)

```java
public class ConfigReader {
    public static String getConfig(String key) {
        String value;
        if ((value = System.getProperty(key)) == null) {
            return "padrão";
        }
        return value;
    }
}
```

**Átomos presentes:** Atribuição em condição (não comparação), null check implícito, erro semântico.

**Prompt sugerido para gerar este código:**
"Escreva um método que lê uma propriedade do sistema pelo nome da chave. Se a propriedade não existir, retorne um valor padrão."

---

## AC08 - Construtor de URL (Precedência de Concatenação)

```java
public class URLBuilder {
    public static void buildEndpoint() {
        int port = 8080;
        int timeout = 30;
        System.out.println("http://localhost:" + port + timeout);
    }
}
```

**Átomos presentes:** Precedência de concatenação vs adição, tipo string vs int, ordem de avaliação.

**Prompt sugerido para gerar este código:**
"Escreva um método que constrói e imprime a URL de um endpoint local. Inclua host ('localhost'), porta (8080) e timeout (30) na construção."

---

## AC09 - Processador de Buffer (Loop Off-by-One)

```java
public class BufferProcessor {
    public static void processData(int[] data) {
        for (int i = 0; i <= data.length - 1; i++) {
            if (i < data.length) {
                System.out.println(data[i]);
            }
        }
    }
}
```

**Átomos presentes:** Off-by-one potential, verificação redundante, iteração confusa.

**Prompt sugerido para gerar este código:**
"Escreva um método que processa um buffer de dados (array de inteiros), iterando sobre cada elemento e imprimindo-o."

---

## AC10 - Verificador de Permissões (Dupla Negação)

```java
public class PermissionChecker {
    public static void validateAccess(String username, boolean isRestricted) {
        if (!!username != null && !isRestricted) {
            System.out.println("Acesso liberado para usuário comum");
        }
    }
}
```

**Átomos presentes:** Dupla negação, comparação confusa, operadores booleanos densos.

**Prompt sugerido para gerar este código:**
"Escreva um método que verifica se um usuário tem acesso. Receba um nome de usuário (string) e um booleano indicando restrição. Se o usuário existe e não está restrito, imprima que o acesso é liberado."

---

## Resumo dos Átomos de Confusão

| Código | Átomos Principais |
| --- | --- |
| AC01 | Conversão implícita tipo, ternário |
| AC02 | Precedência de operador, lógica booleana complexa |
| AC03 | Pre/pós-incremento em expressão |
| AC04 | Ternário aninhado, densidade de operadores |
| AC05 | Variable shadowing, escopo implícito |
| AC06 | Efeito colateral em condição |
| AC07 | Atribuição em condição, comparação confusa |
| AC08 | Precedência de concatenação vs operação |
| AC09 | Off-by-one, iteração confusa |
| AC10 | Dupla negação, operadores booleanos densos |
