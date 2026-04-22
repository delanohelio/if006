package br.edu.if006.sonar;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PedidoServiceTest {

    private final PedidoService service = new PedidoService();

    @Test
    void deveCalcularDescontoParaClienteVipComBonusPorQuantidade() {
        Pedido pedido = new Pedido("Maria", "VIP", 200.0, 12);

        assertEquals(50.0, service.calcularDesconto(pedido));
    }

    @Test
    void deveGerarCodigoPromocionalEmMaiusculo() {
        assertEquals("JOAO-2026", service.gerarCodigoPromocional(" joao "));
    }

    @Test
    void deveAutenticarCredenciaisFixasDeAdministrador() {
        assertTrue(service.autenticarAdmin("admin", "admin123"));
    }
}
