public class OrderProcessor {
    private String customerType;
    private java.util.List<Double> items;
    private String region;
    private Database database;
    
    public OrderProcessor(String customerType, String region) {
        this.customerType = customerType;
        this.region = region;
        this.items = new java.util.ArrayList<>();
        // Dependência oculta: instancia o Database aqui dentro!
        this.database = new Database();
    }
    
    public void addItem(Double price) {
        items.add(price);
    }
    
    // Este método parece inocente, mas...
    public void processOrder() {
        // Calcula o total
        Double subtotal = calculateSubtotal();
        
        // Aplica o desconto
        Double discountedPrice = applyCustomerDiscount(subtotal);
        
        // Adiciona o frete
        Double finalPrice = addShippingCost(discountedPrice);
        
        // Salva no "banco de dados"
        database.saveOrder(customerType, finalPrice);
        
        // Imprime recibo (MISTURANDO I/O COM LÓGICA!)
        printReceipt(subtotal, discountedPrice, finalPrice);
    }
    
    // Método aparentemente limpo
    private Double calculateSubtotal() {
        Double total = 0.0;
        for (Double item : items) {
            total += item;
        }
        return total;
    }
    
    // O PROBLEMA ESTÁ AQUI: Este método que DEVERIA ser testável
    // instancia coisas (banco de dados) e mistura lógica com I/O
    private Double applyCustomerDiscount(Double amount) {
        Double discount = 0.0;
        
        // Lê desconto do "banco de dados" (impossível mockar em teste!)
        // Ou pior: lê de arquivo/rede
        DiscountReader reader = new DiscountReader();
        discount = reader.getDiscount(customerType);
        
        // Mistura cálculo com System.out
        Double discountedAmount = amount * (1 - discount);
        System.out.println("[LOG INTERNO] Desconto aplicado: " + discount);
        
        return discountedAmount;
    }
    
    // Outro problema: acoplamento direto com sistema de frete
    private Double addShippingCost(Double amount) {
        // Acoplamento total! Não posso testar este método isolado
        ShippingService shipping = new ShippingService();
        Double cost = shipping.calculateShipping(region, amount);
        
        return amount + cost;
    }
    
    // PROBLEMA FINAL: Este método que retorna preço IMPRIME O RECIBO
    // Impossível usar em uma API REST que quereria JSON
    private void printReceipt(Double subtotal, Double discounted, Double total) {
        System.out.println("\n=== RECIBO DO PEDIDO ===");
        System.out.println("Cliente: " + customerType);
        System.out.println("Region: " + region);
        System.out.println("Subtotal: R$ " + String.format("%.2f", subtotal));
        System.out.println("Com desconto: R$ " + String.format("%.2f", discounted));
        System.out.println("Total com frete: R$ " + String.format("%.2f", total));
        System.out.println("=======================\n");
    }
    
    public static void main(String[] args) {
        OrderProcessor processor = new OrderProcessor("GOLD", "SP");
        processor.addItem(100.0);
        processor.addItem(50.0);
        processor.addItem(75.0);
        processor.processOrder();
    }
}
