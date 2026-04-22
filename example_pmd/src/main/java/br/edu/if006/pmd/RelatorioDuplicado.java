package br.edu.if006.pmd;

public class RelatorioDuplicado {

    public String montarLinhaA(String nome, int total) {
        String linha = "Cliente=" + nome + ";" + "Total=" + total + ";" + "Moeda=BRL";
        return linha;
    }

    public String montarLinhaB(String nome, int total) {
        String linha = "Cliente=" + nome + ";" + "Total=" + total + ";" + "Moeda=BRL";
        return linha;
    }
}
