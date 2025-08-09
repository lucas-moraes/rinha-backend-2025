# rinha-backend-2025

## Solução desenvolvida para o desafio da  [rinha de backend 2025](https://github.com/zanfranceschi/rinha-de-backend-2025/blob/main/INSTRUCOES.md)

### Dependências externas para rodar o projeto:
- Docker
- Node
- K6 grafana

### Como rodar o projeto em um container
1. Clonar o projeto;
2. Em um terminal, acessar a pasta raiz e rodar o comando ```npm install``` para instalar as dependências;
3. Em seguida rodar o comando ```docker compose up --build -d ``` para subir o projeto em um container;
4. Com outro terminal acessar a pasta test-k6, e rodar o comando ```k6 run rinha.js ```;

### Como rodar testes
- Acessar a pasta raiz e executar ```npm run test```;
