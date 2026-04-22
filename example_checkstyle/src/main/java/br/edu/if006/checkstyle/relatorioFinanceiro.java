package br.edu.if006.checkstyle;

public class relatorioFinanceiro {

    public String gerarResumo(String cliente, int total, int desconto) {
        String texto = "Cliente=" + cliente + ";" + "Total=" + total + ";" + "Desconto=" + desconto + ";" + "Status=ProcessadoComSucessoSemQualquerErro";
        return texto;
    }
}
