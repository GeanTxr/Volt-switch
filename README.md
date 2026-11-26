⚡ Volt Switch
🛒 E-commerce de Eletrônicos

Bem-vindo ao Volt Switch!

O Volt Switch é um projeto de e-commerce voltado para o universo da tecnologia e dos eletrônicos, desenvolvido com o objetivo de proporcionar uma experiência de compra prática, moderna e intuitiva.

🌐 Acesse o projeto: Volt Switch

📌 Sobre o Projeto

O Volt Switch é uma loja virtual de produtos eletrônicos, criada para apresentar uma experiência de navegação simples e agradável aos usuários, conectando tecnologia, praticidade e inovação.

O projeto busca oferecer uma interface intuitiva, facilitando a navegação e a experiência de compra dos clientes.

✨ Funcionalidades
🛍️ Vitrine de produtos eletrônicos.
🔎 Navegação pela loja.
💻 Interface voltada para o comércio eletrônico.
⚡ Experiência de navegação intuitiva.
📱 Projeto com foco em acessibilidade e usabilidade.
🛠️ Tecnologias e Estrutura

🚀 Como acessar

Não é necessário realizar instalações para conhecer o projeto. Basta acessar o link abaixo:

👉 https://voltswitch.netlify.app/

📷 Demonstração

Confira o projeto em funcionamento:

Acessar Volt Switch

👨‍💻 Projeto

Nome: Volt Switch

Categoria: E-commerce de Eletrônicos

Deploy: Netlify

<p align="center">
⚡ <strong>Volt Switch</strong> — Tecnologia que conecta você ao futuro!
</p>


## Funcionalidades implementadas nesta versão

- Segunda vitrine de produtos com botões funcionais para adicionar ao carrinho.
- Carrinho com quantidade, remoção de itens, subtotal e total.
- Pesquisa por nome, filtro por categoria e ordenação por preço ou nome.
- Páginas de produtos com descrição, identificação da loja e seção de produtos semelhantes.
- Cadastro, confirmação por e-mail e login com Netlify Identity.
- Painéis de cliente, loja/fornecedor, entregador e administrador com permissões verificadas no servidor.
- Pedidos de demonstração persistidos no Netlify Database (Postgres), com preços calculados no servidor.

### Observação importante

Este projeto é uma demonstração acadêmica: nenhum pagamento ou envio real é processado. O carrinho é um rascunho na aba do navegador; o pedido confirmado fica no banco. O catálogo está em `js/services/catalogo.mjs`. O esquema e as migrações de pedidos ficam em `db/` e `netlify/database/migrations/`.

O cadastro público cria uma conta de cliente. Selecionar loja, entregador ou administrador só registra a solicitação: uma pessoa autorizada precisa atribuir o papel `loja`, `entregador` ou `admin` à conta no Netlify Identity. Contas e pedidos locais da versão anterior não são migrados.

Para validar o fluxo em um Deploy Preview, confirme o e-mail de uma conta de teste, registre um pedido no carrinho e confira o histórico em Minha conta. Com contas de teste autorizadas, libere o pedido no painel da loja e marque-o como entregue no painel do entregador. Recarregar a confirmação apenas consulta o pedido existente.
