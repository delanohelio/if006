**Título da Tarefa:** Auditoria de Código Legado: O Desafio do E-commerce
**Contexto:** Vocês são a nova equipe de Engenharia de Software contratada para assumir o sistema de E-commerce da empresa. A gestão entregou a vocês duas versões do motor de vendas (Projeto A e Projeto B) e pediu para vocês escolherem qual manter. Antes de escrever uma única linha nova de código, vocês precisam auditar a "saúde" atual desses projetos.

**Instruções:** Leiam o código dos dois projetos. Discutam em grupo e respondam às perguntas abaixo. Não se preocupem com jargões técnicos agora; descrevam o que vocês sentem ao ler e tentar alterar o código.

**Perguntas de Auditoria:**

**Sobre o Projeto A**
1. No Projeto A, existe uma regra que dá 15% de desconto. Quanto tempo o grupo levou para descobrir *exatamente* quais são as condições para um cliente ganhar esse desconto? O que tornou essa descoberta difícil ou dolorosa?
2. O setor de Marketing acabou de ligar. Eles querem criar um novo tipo de cliente ("Super VIP") que ganha frete grátis se a compra for acima de R$ 500 numa terça-feira. Se vocês tivessem que colocar essa regra no Projeto A, vocês se sentiriam seguros de que não quebrariam as regras antigas? Por que o código atual não ajuda nisso?

**Sobre o Projeto B**
3. O Projeto B parece muito mais fácil de ler, certo? Porém, a empresa vai lançar um Aplicativo Mobile na próxima semana. O app precisa usar a *exata mesma matemática* de descontos do Projeto B, mas o app tem uma tela própria e não usa o console do computador (`System.out.println`). É possível reaproveitar o método de cálculo do Projeto B diretamente no mobile sem alterar nada? O que está atrapalhando?
4. Imagine que vocês precisam criar um script automatizado que rode 100 vezes por segundo apenas para verificar se a conta matemática do frete está certa. Olhando para o Projeto B, é possível rodar apenas a matemática de forma isolada, sem que o sistema tente gravar coisas no banco de dados ou pedir *inputs* do usuário pelo teclado? O que impede o isolamento das coisas?

**Conclusão do Grupo:**
5. Considerando as dores de cabeça estruturais de ambos, se o chefe obrigar o grupo a adicionar novas regras de negócio amanhã, qual dos dois projetos vocês prefeririam assumir e tentar consertar primeiro? Por quê?