# iPobre - Sistema de Delivery de Comida

Sistema web de delivery de comida similar ao iFood, com suporte a múltiplos usuários, lojas e entregadores.

## Funcionalidades

### Para Usuários
- Cadastro e login de usuários
- Busca de restaurantes e produtos
- Realização de pedidos
- Pagamento via PIX (integração com API do Inter)
- Acompanhamento de pedidos

### Para Lojistas
- Cadastro e gerenciamento de loja
- Criação e edição de cardápio
- Upload de fotos dos produtos
- Gerenciamento de pedidos
- Controle de preços e disponibilidade

### Para Entregadores
- Cadastro de entregadores
- Visualização de entregas disponíveis
- Atualização de status de entrega
- Histórico de entregas

## Requisitos

- Node.js
- MongoDB
- Conta no Inter para integração PIX

## Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```
3. Configure as variáveis de ambiente no arquivo .env
4. Inicie o servidor:
```bash
npm start
```

## Tecnologias Utilizadas

- Backend: Node.js com Express
- Frontend: HTML5, CSS3, JavaScript
- Banco de Dados: MongoDB
- Autenticação: JWT
- Pagamentos: API PIX do Inter
