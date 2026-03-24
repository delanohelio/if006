// Simulação de conexão com banco de dados
// PROBLEMA: OrderProcessor instancia isso diretamente,
// impedindo injeção de dependência e tornando testes impossíveis
public class Database {
    
    public Database() {
        // Simula conexão com banco
        System.out.println("[DATABASE] Conectando...");
    }
    
    public void saveOrder(String customerType, Double total) {
        // Simula salvamento em BD
        System.out.println("[DATABASE] Salvando pedido do cliente " + customerType + 
                          " com total: R$ " + String.format("%.2f", total));
    }
}
