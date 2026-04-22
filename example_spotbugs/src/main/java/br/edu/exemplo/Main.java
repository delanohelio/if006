package br.edu.exemplo;

/**
 * Classe principal do projeto de exemplo SpotBugs.
 *
 * Para executar a análise:
 *   mvn verify             -> compila e roda o SpotBugs (falha se encontrar bugs)
 *   mvn spotbugs:check     -> roda apenas o SpotBugs
 *   mvn spotbugs:gui       -> abre a interface gráfica do SpotBugs
 *   mvn spotbugs:spotbugs  -> gera relatório XML em target/spotbugsXml.xml
 */
public class Main {

    public static void main(String[] args) {
        System.out.println("=== Exemplo SpotBugs ===");
        System.out.println("Execute 'mvn verify' para rodar a análise estática.");
        System.out.println("Execute 'mvn spotbugs:gui' para visualizar os bugs encontrados.");
    }
}
