package br.edu.if006.sonar;

public class App {

    public static void main(String[] args) {
        PedidoService pedidoService = new PedidoService();
        Pedido pedido = new Pedido("Maria", "VIP", 250.0, 12);

        System.out.println("Desconto calculado: " + pedidoService.calcularDesconto(pedido));
        System.out.println("Codigo promocional: " + pedidoService.gerarCodigoPromocional("Maria"));
    }
}
