// Serviço de cálculo de frete
// PROBLEMA: Instanciado diretamente dentro de addShippingCost(),
// tornando impossível reutilizar ou mockar em testes
public class ShippingService {
    
    public ShippingService() {
        System.out.println("[SHIPPING_SERVICE] Inicializando serviço de frete...");
    }
    
    public Double calculateShipping(String region, Double orderValue) {
        // Em uma aplicação real: consultaria uma API de frete ou tabela externa
        // Aqui simulamos com valores pré-definidos
        
        Double baseCost = 15.0;
        
        if (region.equals("SP")) {
            baseCost = 15.0;
        } else if (region.equals("MG")) {
            baseCost = 20.0;
        } else if (region.equals("BA")) {
            baseCost = 35.0;
        } else if (region.equals("SC")) {
            baseCost = 25.0;
        } else {
            baseCost = 50.0;
        }
        
        // Ajusta por valor do pedido (custo adicional para pedidos acima de 500)
        if (orderValue > 500.0) {
            baseCost = baseCost * 1.2;
        }
        
        return baseCost;
    }
}
