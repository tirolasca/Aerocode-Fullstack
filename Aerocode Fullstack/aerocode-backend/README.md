# Aerocode Backend

API REST para o sistema de gestão de produção de aeronaves.
Construída com **Node.js + TypeScript + Express + Prisma ORM + MySQL**.

## Pré-requisitos

| Ferramenta | Versão mínima |
|------------|---------------|
| Node.js    | 20 LTS        |
| npm        | 10+           |
| MySQL      | 8.0+          |

> Compatível com **Windows 10+** e **Linux Ubuntu 24.04.03+** (e derivados).

---

## Configuração do banco de dados (MySQL)

```sql
-- Execute no MySQL como root:
CREATE DATABASE aerocode_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'root'@'localhost';
GRANT ALL PRIVILEGES ON aerocode_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

---

## Instalação e execução

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Gerar o Prisma Client
npm run prisma:generate

# 4. Executar as migrations (cria as tabelas)
npm run prisma:migrate

# 5. Popular o banco com dados iniciais (opcional)
npm run prisma:seed

# 6. Iniciar em modo desenvolvimento
npm run dev

# 7. Build para produção
npm run build
npm start
```

O servidor inicia em: **http://localhost:3001**

---

## Rotas disponíveis

| Método | Rota                       | Descrição                              |
|--------|----------------------------|----------------------------------------|
| GET    | `/api/health`              | Health-check                           |
| GET    | `/api/ordens`              | Lista todas as ordens de produção      |
| GET    | `/api/ordens/:id`          | Detalhe de uma ordem                   |
| POST   | `/api/ordens`              | Cria nova ordem                        |
| PUT    | `/api/ordens/:id`          | Atualiza ordem                         |
| DELETE | `/api/ordens/:id`          | Remove ordem                           |
| GET    | `/api/funcionarios`        | Lista funcionários                     |
| GET    | `/api/pecas`               | Lista peças/componentes                |
| GET    | `/api/inspecoes`           | Lista inspeções de qualidade           |
| POST   | `/api/inspecoes`           | Cria nova inspeção                     |
| GET    | `/api/metricas/resumo`     | Médias de métricas por nº de usuários  |
| GET    | `/api/metricas/historico`  | Histórico dos últimos 200 registros    |

---

## Coleta de métricas de qualidade

O middleware `src/middleware/metricas.ts` mede automaticamente em cada requisição:

- **Latência** — estimada via cabeçalho `X-Request-Start`
- **Processamento** — `process.hrtime.bigint()` no handler Express
- **Tempo de resposta** — soma das duas grandezas acima

Para executar o teste de carga e gerar os dados dos gráficos:

```bash
# Com o servidor rodando em outro terminal:
npm run carga
```

O script simula **1, 5 e 10 usuários concorrentes** e imprime a tabela de resultados.

---

## Estrutura de arquivos

```
aerocode-backend/
├── prisma/
│   └── schema.prisma        # Modelos e configuração do banco
├── src/
│   ├── server.ts            # Ponto de entrada Express
│   ├── middleware/
│   │   └── metricas.ts      # Coleta latência / processamento / resposta
│   ├── routes/
│   │   ├── ordens.ts
│   │   ├── funcionarios.ts
│   │   ├── pecas.ts
│   │   ├── inspecoes.ts
│   │   └── metricas.ts
│   └── carga/
│       └── testeCarga.ts    # Script de teste de carga
├── .env
├── package.json
└── tsconfig.json
```
