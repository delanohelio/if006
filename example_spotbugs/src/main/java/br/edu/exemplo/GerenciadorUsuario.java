package br.edu.exemplo;

import java.io.FileInputStream;
import java.io.IOException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Classe com exemplos de bugs detectáveis pelo SpotBugs.
 *
 * Bugs intencionais presentes nesta classe:
 *
 *   BUG 1 - ES_COMPARING_STRINGS_WITH_EQ
 *     Comparação de String usando == em vez de .equals()
 *
 *   BUG 2 - EI_EXPOSE_REP
 *     Retorno direto de referência a array interno (objeto mutável)
 *
 *   BUG 3 - OS_OPEN_STREAM
 *     Stream aberto sem try-with-resources; vaza memória se exceção ocorrer
 *
 *   BUG 4 - DM_DEFAULT_ENCODING
 *     Conversão de bytes para String sem especificar charset
 *
 *   BUG 5 - NP_NULL_ON_SOME_PATH
 *     Possível desreferência de null retornado por Map.get()
 */
public class GerenciadorUsuario {

    private String[] permissoes;

    public GerenciadorUsuario(String... permissoes) {
        this.permissoes = permissoes;
    }

    // ==========================================================================
    // BUG 1: ES_COMPARING_STRINGS_WITH_EQ
    //
    // Strings são objetos em Java. O operador == compara REFERÊNCIAS de memória,
    // não o conteúdo. O correto é usar .equals() ou .equalsIgnoreCase().
    //
    // Consequência: "ADMIN".equals(role) pode ser true, mas "ADMIN" == role
    // pode ser false se 'role' não for a mesma instância literal.
    // ==========================================================================
    public boolean isAdmin(String role) {
        return role == "ADMIN"; // BUG: use role.equals("ADMIN")
    }

    // ==========================================================================
    // BUG 2: EI_EXPOSE_REP (Expose Internal Representation)
    //
    // Retornar a referência direta ao array interno permite que código externo
    // modifique o estado privado do objeto sem passar pelos métodos da classe,
    // quebrando o encapsulamento.
    //
    // Consequência: quem chama getPermissoes() pode fazer
    //   usuario.getPermissoes()[0] = "ADMIN"
    // e alterar o estado interno sem que a classe perceba.
    //
    // Correto: retornar Arrays.copyOf(permissoes, permissoes.length)
    // ==========================================================================
    public String[] getPermissoes() {
        return permissoes; // BUG: retorna referência interna diretamente
    }

    // ==========================================================================
    // BUG 3: OS_OPEN_STREAM
    //
    // O FileInputStream é aberto, mas se readAllBytes() lançar uma exceção,
    // fis.close() nunca será chamado e o recurso ficará aberto (vazamento).
    //
    // Correto: usar try-with-resources:
    //   try (FileInputStream fis = new FileInputStream(caminho)) { ... }
    //
    // BUG 4: DM_DEFAULT_ENCODING
    //
    // new String(bytes) usa o charset padrão da JVM/SO, que pode variar entre
    // ambientes (Windows usa CP1252, Linux usa UTF-8, etc.), causando problemas
    // de portabilidade com caracteres especiais (acentos, cedilha, etc.).
    //
    // Correto: new String(dados, StandardCharsets.UTF_8)
    // ==========================================================================
    public String lerArquivoConfig(String caminho) throws IOException {
        FileInputStream fis = new FileInputStream(caminho); // BUG 3: sem try-with-resources
        byte[] dados = fis.readAllBytes();
        fis.close();
        return new String(dados); // BUG 4: charset não especificado
    }

    // ==========================================================================
    // BUG 5: NP_NULL_ON_SOME_PATH (Possible Null Pointer Dereference)
    //
    // Map.get() retorna null quando a chave não existe no mapa.
    // Chamar .toUpperCase() em um valor null lança NullPointerException em tempo
    // de execução, mas o compilador Java não detecta este erro.
    //
    // Correto: verificar se o valor é null antes de usar, ou usar
    //   config.getOrDefault("perfil", "").toUpperCase()
    // ==========================================================================
    public String obterPerfilFormatado(Map<String, String> config) {
        String perfil = config.get("perfil"); // pode retornar null
        return perfil.toUpperCase();           // BUG: NullPointerException se perfil == null
    }

    // Método auxiliar sem bugs (para contraste)
    public Map<String, String> criarConfigPadrao() {
        Map<String, String> config = new HashMap<>();
        config.put("perfil", "usuario");
        config.put("idioma", "pt-BR");
        return config;
    }
}
