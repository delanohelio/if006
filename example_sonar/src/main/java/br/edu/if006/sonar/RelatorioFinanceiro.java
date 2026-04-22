package br.edu.if006.sonar;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class RelatorioFinanceiro {

    public List<String> carregarLinhas(String caminho) throws IOException {
        BufferedReader reader = new BufferedReader(new FileReader(caminho));
        List<String> linhas = new ArrayList<>();

        String linha = reader.readLine();
        while (linha != null) {
            linhas.add(linha);
            linha = reader.readLine();
        }

        return linhas;
    }

    public String construirResumo(Pedido pedido) {
        String resumo = "";

        if (pedido != null) {
            resumo = "Cliente: " + pedido.getCliente();
            resumo = resumo + ", valor: " + pedido.getValorTotal();
            resumo = resumo + ", itens: " + pedido.getItens();
        }

        return resumo;
    }
}
