package br.edu.if006.sonar;

public class Pedido {

    private final String cliente;
    private final String tipoCliente;
    private final double valorTotal;
    private final int itens;

    public Pedido(String cliente, String tipoCliente, double valorTotal, int itens) {
        this.cliente = cliente;
        this.tipoCliente = tipoCliente;
        this.valorTotal = valorTotal;
        this.itens = itens;
    }

    public String getCliente() {
        return cliente;
    }

    public String getTipoCliente() {
        return tipoCliente;
    }

    public double getValorTotal() {
        return valorTotal;
    }

    public int getItens() {
        return itens;
    }
}
