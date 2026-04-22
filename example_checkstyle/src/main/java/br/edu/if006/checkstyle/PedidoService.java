package br.edu.if006.checkstyle;

public class PedidoService {

    private int contadorPedidos = 0;

    // TODO: melhorar regra de negocio
    public int PROCESSAR_PEDIDO(String TipoPedido,int Prioridade){
        int Resultado = 0;
        int x = 10;

        if(Prioridade > 3)
            Resultado = Resultado + 1;

        if (TipoPedido != null && TipoPedido.equals("A")) {
            Resultado = Resultado + 7;
        }

        if (TipoPedido != null && TipoPedido.equals("B")) {
            Resultado = Resultado + 99;
        }

        contadorPedidos = contadorPedidos + 1;
        return Resultado + x;
    }

    public int calcularFrete(int distanciaKm){
        if (distanciaKm > 50) {
            return distanciaKm * 3;
        }
        return distanciaKm * 2;
    }
}
