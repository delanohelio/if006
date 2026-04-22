package br.edu.exemplo;

import java.io.File;

/**
 * Classe com exemplo de bug EXCLUÍDO pelo filtro do SpotBugs.
 *
 * Bug presente nesta classe:
 *
 *   BUG EXCLUÍDO - RV_RETURN_VALUE_IGNORED_BAD_PRACTICE
 *     O valor de retorno de File.delete() é ignorado.
 *     Este bug está suprimido em spotbugs-exclude.xml para o método
 *     removerArquivoTemporario(), portanto a build NÃO irá falhar por ele.
 *
 *     Para ver o bug ser reportado:
 *       1. Remova (ou comente) o bloco <Match> correspondente em spotbugs-exclude.xml
 *       2. Execute: mvn verify
 *       3. Observe a build falhar com o bug RV_RETURN_VALUE_IGNORED_BAD_PRACTICE
 *
 * Bug também presente nesta classe (NÃO excluído):
 *
 *   MS_MUTABLE_ARRAY
 *     Array public static final é mutável: qualquer código pode alterar seu
 *     conteúdo com EXTENSOES_PERMITIDAS[0] = ".exe", mesmo sendo "final".
 *     "final" em arrays apenas impede a reatribuição da variável, não a
 *     modificação do conteúdo.
 */
public class ArquivoUtil {

    // ==========================================================================
    // BUG: MS_MUTABLE_ARRAY (Mutable Static)
    //
    // Declarar um array como public static final não impede a modificação
    // dos seus elementos. Qualquer classe pode fazer:
    //   ArquivoUtil.EXTENSOES_PERMITIDAS[0] = ".exe";
    //
    // Correto: usar uma coleção imutável:
    //   public static final List<String> EXTENSOES_PERMITIDAS =
    //       Collections.unmodifiableList(Arrays.asList(".txt", ".csv", ".json"));
    // ==========================================================================
    public static final String[] EXTENSOES_PERMITIDAS = {".txt", ".csv", ".json"}; // BUG

    // ==========================================================================
    // BUG EXCLUÍDO: RV_RETURN_VALUE_IGNORED_BAD_PRACTICE
    //
    // File.delete() retorna:
    //   true  -> arquivo deletado com sucesso
    //   false -> falha (arquivo não existe, sem permissão, diretório não vazio, etc.)
    //
    // Ignorar este retorno significa que o código não sabe se a operação
    // foi bem-sucedida, o que geralmente é uma má prática.
    //
    // Este bug foi EXCLUÍDO no spotbugs-exclude.xml com a justificativa de
    // que a remoção é "best-effort" neste contexto específico.
    // ==========================================================================
    public void removerArquivoTemporario(String caminho) {
        File arquivo = new File(caminho);
        arquivo.delete(); // BUG (excluído pelo filtro): retorno ignorado
    }

    public boolean extensaoPermitida(String nomeArquivo) {
        for (String ext : EXTENSOES_PERMITIDAS) {
            if (nomeArquivo.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }
}
