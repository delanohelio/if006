// Simulação de leitura de desconto de arquivo externo
// PROBLEMA: Chamado dentro de applyCustomerDiscount(),
// deixando impossível testar o cálculo de desconto isoladamente
public class DiscountReader {
    
    public DiscountReader() {
        // Simula leitura de arquivo/API externa
        System.out.println("[DISCOUNT_READER] Carregando tabela de descontos...");
    }
    
    public Double getDiscount(String customerType) {
        // Em uma aplicação real: leiria de arquivo, API ou BD
        // Aqui simulamos com if/else
        if (customerType.equals("BRONZE")) {
            return 0.05; // 5%
        } else if (customerType.equals("SILVER")) {
            return 0.10; // 10%
        } else if (customerType.equals("GOLD")) {
            return 0.15; // 15%
        } else if (customerType.equals("PLATINUM")) {
            return 0.20; // 20%
        }
        return 0.0;
    }
}
