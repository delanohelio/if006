# Exemplo SonarQube

Projeto Java com Maven para demonstrar, em aula, como o SonarQube executa analise estatica, consolida metricas e permite configurar verificacoes basicas.

O projeto foi montado para fins didaticos. Ele contem problemas intencionais para que os estudantes vejam o SonarQube apontando bugs, code smells, hotspots de seguranca e cobertura parcial de testes.

## Objetivos da aula

- Entender o que o SonarQube analisa
- Executar uma analise local usando Docker
- Enviar os resultados com Maven
- Ler os problemas encontrados no painel
- Alterar configuracoes basicas do scanner

## O que o SonarQube faz

O SonarQube e uma plataforma de analise continua de qualidade. Ele processa o codigo-fonte e relatórios gerados durante a build para produzir indicadores como:

- Bugs
- Vulnerabilities ou Security Hotspots
- Code Smells
- Coverage
- Duplications
- Quality Gate

No fluxo deste exemplo, o Maven compila o projeto, executa os testes, gera a cobertura com JaCoCo e depois envia tudo para o SonarQube.

## Estrutura do projeto

```text
example_sonar/
├── docker-compose.yml
├── pom.xml
├── sonar-project.properties
├── README.md
└── src
    ├── main/java/br/edu/if006/sonar
    │   ├── App.java
    │   ├── Pedido.java
    │   ├── PedidoService.java
    │   └── RelatorioFinanceiro.java
    └── test/java/br/edu/if006/sonar
        └── PedidoServiceTest.java
```

## Pre-requisitos

- Java 17 ou superior
- Maven 3.9 ou superior
- Docker e Docker Compose

## Como subir o SonarQube localmente

Na raiz do projeto, execute:

```bash
docker compose up -d
```

Depois acompanhe os logs, se quiser:

```bash
docker compose logs -f sonarqube
```

Quando a aplicacao estiver pronta, acesse:

```text
http://localhost:9000
```

Credenciais iniciais padrao:

- login: admin
- senha: admin

No primeiro acesso o SonarQube pedira a troca da senha.

## Como gerar o token de acesso

Depois de entrar no SonarQube:

1. Clique no avatar do usuario
2. Acesse My Account
3. Abra a aba Security
4. Gere um token
5. Guarde o valor em uma variavel de ambiente

No macOS ou Linux:

```bash
export SONAR_TOKEN="cole_o_token_aqui"
```

## Como executar a analise

Primeiro gere a build local, os testes e o relatorio de cobertura:

```bash
mvn clean verify
```

Depois envie os dados para o SonarQube:

```bash
mvn sonar:sonar -Dsonar.token=$SONAR_TOKEN
```

Se quiser explicitar a URL do servidor:

```bash
mvn sonar:sonar \
  -Dsonar.host.url=http://localhost:9000 \
  -Dsonar.token=$SONAR_TOKEN
```

## Como o fluxo funciona

1. O Maven compila o codigo
2. Os testes JUnit sao executados
3. O JaCoCo gera o relatorio XML de cobertura
4. O plugin do Sonar envia codigo e metricas para o servidor
5. O SonarQube aplica regras de qualidade e exibe o resultado no painel

## Problemas intencionais do projeto

O objetivo nao e ter um codigo correto, mas um codigo que gere feedback util na ferramenta.

### PedidoService.java

Arquivo: `src/main/java/br/edu/if006/sonar/PedidoService.java`

Problemas intencionais:

- Condicao duplicada em `calcularDesconto`, o que indica regra de negocio inconsistente
- Bloco `catch` vazio em `gerarCodigoPromocional`
- Credenciais de administrador fixas em codigo-fonte em `autenticarAdmin`

### RelatorioFinanceiro.java

Arquivo: `src/main/java/br/edu/if006/sonar/RelatorioFinanceiro.java`

Problemas intencionais:

- Recurso aberto sem `try-with-resources` em `carregarLinhas`
- Montagem de string de forma simples e pouco escalavel em `construirResumo`
- Classe sem testes dedicados, o que ajuda a demonstrar cobertura parcial

## O que observar no painel do SonarQube

Depois da analise, abra o projeto no SonarQube e peça aos estudantes para observar:

- Aba Overview: visao geral da qualidade
- Aba Issues: lista detalhada de problemas encontrados
- Aba Measures: cobertura, complexidade, tamanho e duplicacao
- Security Hotspots: pontos que exigem revisao manual
- Quality Gate: condicao final do projeto

## Configuracoes basicas deste exemplo

O projeto usa dois lugares principais de configuracao: `pom.xml` e `sonar-project.properties`.

### pom.xml

Responsabilidades principais:

- definir a versao do Java
- executar testes
- gerar cobertura com JaCoCo
- disponibilizar o plugin Maven do Sonar

Trechos importantes:

```xml
<sonar.host.url>http://localhost:9000</sonar.host.url>
<sonar.coverage.jacoco.xmlReportPaths>
    ${project.basedir}/target/site/jacoco/jacoco.xml
</sonar.coverage.jacoco.xmlReportPaths>
```

### sonar-project.properties

Responsabilidades principais:

- definir nome e chave do projeto
- informar pastas de codigo e testes
- informar onde estao os binarios compilados
- dizer ao scanner onde esta o relatorio de cobertura
- opcionalmente esperar a resposta do Quality Gate

Conteudo principal:

```properties
sonar.projectKey=example-sonarqube
sonar.projectName=Example SonarQube
sonar.sources=src/main/java
sonar.tests=src/test/java
sonar.java.binaries=target/classes
sonar.coverage.jacoco.xmlReportPaths=target/site/jacoco/jacoco.xml
sonar.qualitygate.wait=true
```

## Configuracoes basicas que voce pode experimentar

### 1. Excluir arquivos da analise

```properties
sonar.exclusions=src/main/java/**/legacy/**
```

Uso comum:

- codigo legado
- codigo gerado automaticamente
- exemplos que nao devem entrar na avaliacao

### 2. Excluir arquivos da cobertura

```properties
sonar.coverage.exclusions=src/main/java/**/App.java
```

Uso comum:

- classes bootstrap
- DTOs simples
- codigo de infraestrutura que nao faz sentido medir

### 3. Limitar quais testes entram no scanner

```properties
sonar.test.inclusions=src/test/java/**/*Test.java
```

### 4. Esperar o resultado do Quality Gate no terminal

```properties
sonar.qualitygate.wait=true
```

Isso e util em pipelines CI/CD porque o comando pode falhar quando o projeto nao atende ao criterio de qualidade definido no servidor.

## Exercicios sugeridos para os estudantes

1. Rodar a analise pela primeira vez e listar os problemas encontrados.
2. Corrigir o `catch` vazio e executar a analise novamente.
3. Substituir a senha fixa por configuracao externa.
4. Refatorar `carregarLinhas` usando `try-with-resources`.
5. Criar testes para `RelatorioFinanceiro` e comparar a cobertura antes e depois.
6. Adicionar `sonar.coverage.exclusions` e observar como a cobertura muda.

## Possivel roteiro de aula

1. Subir o SonarQube com Docker.
2. Mostrar o projeto antes da analise.
3. Executar `mvn clean verify`.
4. Executar `mvn sonar:sonar -Dsonar.token=$SONAR_TOKEN`.
5. Navegar pelo painel e explicar cada metrica.
6. Corrigir um problema simples e reenviar a analise.
7. Alterar uma configuracao basica e comparar o resultado.

## Observacoes importantes

- O SonarQube nao substitui revisao de codigo nem testes.
- Nem todo Security Hotspot e uma vulnerabilidade confirmada.
- O conjunto de regras exibido depende do Quality Profile ativo no servidor.
- Em projetos reais, a configuracao pode ficar no `pom.xml`, em `sonar-project.properties` ou no pipeline.

## Comandos uteis

```bash
docker compose up -d
docker compose down
mvn clean verify
mvn sonar:sonar -Dsonar.token=$SONAR_TOKEN
```

## Resultado esperado

Ao final, os estudantes devem conseguir:

- explicar o papel do SonarQube
- executar uma analise local
- localizar issues no painel
- entender de onde vem a cobertura
- aplicar configuracoes basicas do scanner
