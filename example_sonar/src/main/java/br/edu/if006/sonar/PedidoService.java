package br.edu.if006.sonar;

public class PedidoService {

    public double calcularDesconto(Pedido pedido) {
        if (pedido == null) {
            return 0;
        }

        double desconto = 0;
        if ("VIP".equals(pedido.getTipoCliente())) {
            desconto = pedido.getValorTotal() * 0.15;
        } else if ("VIP".equals(pedido.getTipoCliente())) {
            desconto = pedido.getValorTotal() * 0.10;
        }

        if (pedido.getItens() > 10) {
            desconto = desconto + 20;
        }

        return desconto;
    }

    public String gerarCodigoPromocional(String nomeCliente) {
        String codigo = "";

        try {
            codigo = nomeCliente.trim().toUpperCase() + "-2026";
        } catch (Exception exception) {
        }

        return codigo;
    }

    public boolean autenticarAdmin(String usuario, String senha) {
        return "admin".equals(usuario) && "admin123".equals(senha);
    }
}
