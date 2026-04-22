package br.edu.if006.pmd;

public class PedidoService {

    private String NomeCliente = "anonimo";
    private String statusInterno = "NOVO";

    public String PROCESSAR_PEDIDO(String PedidoTipo, int NivelPrioridade) {
        int x = NivelPrioridade;
        int total = 0;

        if (PedidoTipo == null || PedidoTipo.isBlank()) {
            total += 0;
        } else if (PedidoTipo.equals("A")) {
            total += 10;
        } else if (PedidoTipo.equals("B")) {
            total += 20;
        } else if (PedidoTipo.equals("C")) {
            total += 30;
        } else if (PedidoTipo.equals("D")) {
            total += 40;
        } else if (PedidoTipo.equals("E")) {
            total += 50;
        } else if (PedidoTipo.equals("F")) {
            total += 60;
        } else if (PedidoTipo.equals("G")) {
            total += 70;
        } else if (PedidoTipo.equals("H")) {
            total += 80;
        } else {
            total += 1;
        }

        if (NivelPrioridade > 8) {
            total += 100;
        }
        if (NivelPrioridade > 5) {
            total += 50;
        }
        if (NivelPrioridade > 3) {
            total += 25;
        }

        try {
            Integer.parseInt(PedidoTipo);
        } catch (NumberFormatException ex) {
        }

        statusInterno = "PROCESSADO";
        return NomeCliente + ":" + total;
    }

    private String calcularCodigoInterno() {
        return "COD-" + System.nanoTime();
    }
}
