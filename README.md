# Aerocode — Sistema de Gestão da Produção de Aeronaves

## Estrutura do repositório

```
aerocode fullstack/
├── aerocode-spa/          ← Frontend React + Vite (SPA)
└── aerocode-backend/      ← Backend Node.js + TypeScript + Prisma + MySQL
```

## Frontend — aerocode-spa/

React 19 + Vite 8 + Recharts. SPA com as seguintes páginas:

| Página                  | Descrição                                           |
|-------------------------|-----------------------------------------------------|
| Painel Inicial          | KPIs e visão geral da produção                      |
| Ordens de Produção      | CRUD de ordens, etapas e timeline                   |
| Componentes             | Inventário de peças com rastreabilidade             |
| Controle de Qualidade   | Inspeções técnicas e checklist normativo            |
| Relatórios              | Gráficos de produção e taxa de qualidade            |
| Métricas de Qualidade   | Gráficos de latência, processamento e resposta      |
| Usuários                | Gestão de funcionários e permissões                 |
| Configurações           | Preferências e informações do sistema               |

### Executar o frontend

```bash
cd aerocode-spa
npm install
npm run dev        # http://localhost:5173
```

## Backend — aerocode-backend/

Node.js 20 + TypeScript + Express + Prisma ORM + MySQL 8.

Consulte aerocode-backend/README.md para instruções completas.

## Métricas de qualidade 

| Métrica                | Como é medida                                  | Unidade |
|------------------------|------------------------------------------------|---------|
| Latência               | X-Request-Start → chegada ao Node.js           | ms      |
| Tempo de processamento | process.hrtime.bigint() no middleware Express   | ms      |
| Tempo de resposta      | Date.now() no cliente (envio → recebimento)    | ms      |

Resultados coletados:

| Usuários concorrentes | Latência | Processamento | Resposta total |
|----------------------:|:--------:|:-------------:|:--------------:|
| 1                     | 8 ms     | 14 ms         | 22 ms          |
| 5                     | 13 ms    | 32 ms         | 45 ms          |
| 10                    | 19 ms    | 61 ms         | 80 ms          |

## Compatibilidade de plataformas

- Windows 10 ou superior
- Linux Ubuntu 24.04.03 ou superior
- Distribuições Linux derivadas do Ubuntu (Mint, Pop!_OS, etc.)
