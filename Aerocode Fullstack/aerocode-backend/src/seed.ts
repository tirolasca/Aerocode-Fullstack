/**
 * seed.ts — Popula o banco de dados com os dados iniciais do sistema.
 * Execute: npm run prisma:seed
 */
import { PrismaClient, TipoAeronave, TipoPeca, StatusPeca, StatusEtapa, NivelPermissao, TipoTeste, ResultadoTeste } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...\n');

  // ── Limpar dados anteriores (ordem inversa das FK) ─────────────────────────
  await prisma.logMetrica.deleteMany();
  await prisma.inspecaoQualidade.deleteMany();
  await prisma.teste.deleteMany();
  await prisma.etapaFuncionario.deleteMany();
  await prisma.etapa.deleteMany();
  await prisma.ordemPeca.deleteMany();
  await prisma.ordem.deleteMany();
  await prisma.peca.deleteMany();
  await prisma.funcionario.deleteMany();
  console.log('  ✓ Dados anteriores removidos');

  // ── Funcionários ───────────────────────────────────────────────────────────
  const funcs = await Promise.all([
    prisma.funcionario.create({ data: { id:1, nome:'Carlos Silva',    usuario:'carlos.silva', senhaHash:'123456', telefone:'(12) 99201-4523', endereco:'São José dos Campos, SP', nivelPermissao: NivelPermissao.ENGENHEIRO    } }),
    prisma.funcionario.create({ data: { id:2, nome:'Fernanda Torres', usuario:'f.torres',     senhaHash:'123456', telefone:'(12) 98734-2210', endereco:'São José dos Campos, SP', nivelPermissao: NivelPermissao.ENGENHEIRO    } }),
    prisma.funcionario.create({ data: { id:3, nome:'Ricardo Lima',    usuario:'r.lima',       senhaHash:'123456', telefone:'(11) 97823-0012', endereco:'Campinas, SP',            nivelPermissao: NivelPermissao.OPERADOR      } }),
    prisma.funcionario.create({ data: { id:4, nome:'Ana Souza',       usuario:'a.souza',      senhaHash:'123456', telefone:'(12) 98100-3345', endereco:'Taubaté, SP',             nivelPermissao: NivelPermissao.ENGENHEIRO    } }),
    prisma.funcionario.create({ data: { id:5, nome:'Paulo Nunes',     usuario:'p.nunes',      senhaHash:'123456', telefone:'(12) 97456-8890', endereco:'São José dos Campos, SP', nivelPermissao: NivelPermissao.OPERADOR      } }),
    prisma.funcionario.create({ data: { id:6, nome:'Juliana Costa',   usuario:'j.costa',      senhaHash:'123456', telefone:'(12) 99000-7712', endereco:'São Paulo, SP',           nivelPermissao: NivelPermissao.ADMINISTRADOR } }),
    prisma.funcionario.create({ data: { id:7, nome:'Marcos Oliveira', usuario:'m.oliveira',   senhaHash:'123456', telefone:'(11) 98200-1122', endereco:'São Paulo, SP',           nivelPermissao: NivelPermissao.ADMINISTRADOR } }),
  ]);
  console.log(`  ✓ ${funcs.length} funcionários criados`);

  // ── Peças ──────────────────────────────────────────────────────────────────
  const pecasData = [
    { id:'CMP-001', nome:'Motor CFM56-5B',              tipo: TipoPeca.IMPORTADA, fornecedor:'CFM International',   status: StatusPeca.PRONTA,       quantidade:8,  disponivel:3  },
    { id:'CMP-002', nome:'Motor GE90-115B',             tipo: TipoPeca.IMPORTADA, fornecedor:'GE Aviation',          status: StatusPeca.EM_TRANSPORTE, quantidade:4,  disponivel:0  },
    { id:'CMP-003', nome:'Trem de Pouso Principal',     tipo: TipoPeca.IMPORTADA, fornecedor:'Safran Landing Sys.',  status: StatusPeca.PRONTA,       quantidade:12, disponivel:5  },
    { id:'CMP-004', nome:'Trem de Pouso Dianteiro',     tipo: TipoPeca.IMPORTADA, fornecedor:'Safran Landing Sys.',  status: StatusPeca.PRONTA,       quantidade:10, disponivel:4  },
    { id:'CMP-005', nome:'Sistema FMS Aviônica',        tipo: TipoPeca.IMPORTADA, fornecedor:'Honeywell Aerospace',  status: StatusPeca.EM_TRANSPORTE, quantidade:6,  disponivel:0  },
    { id:'CMP-006', nome:'Aileron Composto',            tipo: TipoPeca.NACIONAL,  fornecedor:'Embraer SAS',          status: StatusPeca.PRONTA,       quantidade:20, disponivel:8  },
    { id:'CMP-007', nome:'APU GTCP131-9A',              tipo: TipoPeca.IMPORTADA, fornecedor:'Honeywell Aerospace',  status: StatusPeca.PRONTA,       quantidade:5,  disponivel:2  },
    { id:'CMP-008', nome:'Assento Econômico 18"',       tipo: TipoPeca.NACIONAL,  fornecedor:'Recaro Aircraft Seat', status: StatusPeca.EM_PRODUCAO,  quantidade:200,disponivel:0  },
    { id:'CMP-009', nome:'Painel de Controle FCC',      tipo: TipoPeca.IMPORTADA, fornecedor:'Collins Aerospace',    status: StatusPeca.PRONTA,       quantidade:7,  disponivel:2  },
    { id:'CMP-010', nome:'Revestimento Fuselagem CF',   tipo: TipoPeca.NACIONAL,  fornecedor:'Embraer Composites',   status: StatusPeca.PRONTA,       quantidade:30, disponivel:10 },
  ];
  await prisma.peca.createMany({ data: pecasData });
  console.log(`  ✓ ${pecasData.length} peças criadas`);

  // ── Helper para criar ordem completa ──────────────────────────────────────
  async function criarOrdem(dados: {
    id: string; codigo: string; modelo: string; tipo: TipoAeronave;
    capacidade?: number; alcance?: number; cliente: string;
    inicio: string; entrega: string; progresso: number; prioridade: string;
    etapas: { nome: string; prazo: string; status: StatusEtapa; funcionariosIds: number[] }[];
    testes: { tipo: TipoTeste; resultado: ResultadoTeste | null }[];
    pecasIds: string[];
  }) {
    // Cria a ordem
    const ordem = await prisma.ordem.create({
      data: {
        id: dados.id, codigo: dados.codigo, modelo: dados.modelo, tipo: dados.tipo,
        capacidade: dados.capacidade ?? null, alcance: dados.alcance ?? null,
        cliente: dados.cliente, inicio: dados.inicio, entrega: dados.entrega,
        progresso: dados.progresso, prioridade: dados.prioridade,
      },
    });

    // Cria etapas com funcionários
    for (const et of dados.etapas) {
      const etapa = await prisma.etapa.create({
        data: { ordemId: ordem.id, nome: et.nome, prazo: et.prazo, status: et.status },
      });
      if (et.funcionariosIds.length > 0) {
        await prisma.etapaFuncionario.createMany({
          data: et.funcionariosIds.map(fid => ({ etapaId: etapa.id, funcionarioId: fid })),
          skipDuplicates: true,
        });
      }
    }

    // Cria testes (apenas os que têm resultado)
    const testesComResultado = dados.testes.filter(t => t.resultado !== null);
    if (testesComResultado.length > 0) {
      await prisma.teste.createMany({
        data: testesComResultado.map(t => ({ ordemId: ordem.id, tipo: t.tipo, resultado: t.resultado as ResultadoTeste })),
      });
    }

    // Associa peças
    if (dados.pecasIds.length > 0) {
      await prisma.ordemPeca.createMany({
        data: dados.pecasIds.map(pid => ({ ordemId: ordem.id, pecaId: pid })),
        skipDuplicates: true,
      });
    }
  }

  // ── Ordens ─────────────────────────────────────────────────────────────────
  await criarOrdem({
    id:'AC-1041', codigo:'AC-1041', modelo:'Airbus A320', tipo: TipoAeronave.COMERCIAL,
    capacidade:180, alcance:6150, cliente:'Lufthansa AG',
    inicio:'02/01/2026', entrega:'30/06/2026', progresso:78, prioridade:'Alta',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'28/02/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[1,3] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/03/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[2,3] },
      { nome:'Eletricidade e Aviônica', prazo:'30/04/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[1,4] },
      { nome:'Acabamento Interior',     prazo:'31/05/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[3,5] },
      { nome:'Testes e Inspeções',      prazo:'20/06/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'30/06/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[1,6] },
    ],
    testes:[
      { tipo:TipoTeste.HIDRAULICO,   resultado:ResultadoTeste.APROVADO },
      { tipo:TipoTeste.ELETRICO,     resultado:ResultadoTeste.APROVADO },
    ],
    pecasIds:['CMP-001','CMP-003','CMP-006','CMP-005','CMP-008','CMP-007'],
  });

  await criarOrdem({
    id:'AC-1042', codigo:'AC-1042', modelo:'Boeing 737 MAX', tipo: TipoAeronave.COMERCIAL,
    capacidade:189, alcance:6570, cliente:'Ryanair Ltd',
    inicio:'15/01/2026', entrega:'15/08/2026', progresso:45, prioridade:'Alta',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'28/02/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[3,5] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/03/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[2,5] },
      { nome:'Eletricidade e Aviônica', prazo:'30/04/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[1,4] },
      { nome:'Acabamento Interior',     prazo:'31/05/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[3]   },
      { nome:'Testes e Inspeções',      prazo:'10/08/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'15/08/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes:[], pecasIds:['CMP-001','CMP-003','CMP-004','CMP-009'],
  });

  await criarOrdem({
    id:'AC-1043', codigo:'AC-1043', modelo:'Embraer E175', tipo: TipoAeronave.COMERCIAL,
    capacidade:76, alcance:3735, cliente:'LATAM Airlines',
    inicio:'20/11/2025', entrega:'28/02/2026', progresso:100, prioridade:'Normal',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'15/12/2025', status:StatusEtapa.CONCLUIDA, funcionariosIds:[1,3] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/12/2025', status:StatusEtapa.CONCLUIDA, funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'20/01/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[4]   },
      { nome:'Acabamento Interior',     prazo:'05/02/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[3,5] },
      { nome:'Testes e Inspeções',      prazo:'20/02/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'28/02/2026', status:StatusEtapa.CONCLUIDA, funcionariosIds:[1,6] },
    ],
    testes:[
      { tipo:TipoTeste.HIDRAULICO,   resultado:ResultadoTeste.APROVADO },
      { tipo:TipoTeste.ELETRICO,     resultado:ResultadoTeste.APROVADO },
      { tipo:TipoTeste.AERODINAMICO, resultado:ResultadoTeste.APROVADO },
    ],
    pecasIds:['CMP-006','CMP-003','CMP-007','CMP-010'],
  });

  await criarOrdem({
    id:'AC-1044', codigo:'AC-1044', modelo:'Gulfstream G550', tipo: TipoAeronave.COMERCIAL,
    capacidade:16, alcance:12501, cliente:'NetJets Inc.',
    inicio:'05/02/2026', entrega:'20/09/2026', progresso:15, prioridade:'Normal',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'31/03/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[5,3] },
      { nome:'Sistemas Hidráulicos',    prazo:'30/04/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'31/05/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[1]   },
      { nome:'Acabamento Interior',     prazo:'30/06/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[3]   },
      { nome:'Testes e Inspeções',      prazo:'15/09/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[4]   },
      { nome:'Certificação Final',      prazo:'20/09/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes:[], pecasIds:['CMP-002','CMP-003','CMP-009'],
  });

  await criarOrdem({
    id:'AC-1045', codigo:'AC-1045', modelo:'Dassault Falcon 7X', tipo: TipoAeronave.COMERCIAL,
    capacidade:14, alcance:11019, cliente:'Dassault Aviation',
    inicio:'10/02/2026', entrega:'10/10/2026', progresso:5, prioridade:'Alta',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'30/04/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[3]   },
      { nome:'Sistemas Hidráulicos',    prazo:'31/05/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'30/06/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[1]   },
      { nome:'Acabamento Interior',     prazo:'31/07/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[5]   },
      { nome:'Testes e Inspeções',      prazo:'30/09/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[4]   },
      { nome:'Certificação Final',      prazo:'10/10/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes:[], pecasIds:['CMP-007','CMP-004','CMP-009'],
  });

  await criarOrdem({
    id:'AC-1046', codigo:'AC-1046', modelo:'Boeing 787-9', tipo: TipoAeronave.COMERCIAL,
    capacidade:296, alcance:14140, cliente:'Emirates Airlines',
    inicio:'01/03/2026', entrega:'01/12/2026', progresso:8, prioridade:'Crítica',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'30/04/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[1,3,5] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/05/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2]     },
      { nome:'Eletricidade e Aviônica', prazo:'30/06/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[4]     },
      { nome:'Acabamento Interior',     prazo:'31/07/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[3,5]   },
      { nome:'Testes e Inspeções',      prazo:'20/11/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2,4]   },
      { nome:'Certificação Final',      prazo:'01/12/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[6]     },
    ],
    testes:[], pecasIds:['CMP-002','CMP-003','CMP-004','CMP-005','CMP-008'],
  });

  await criarOrdem({
    id:'AC-1047', codigo:'AC-1047', modelo:'Lockheed C-130J', tipo: TipoAeronave.MILITAR,
    capacidade:92, alcance:6852, cliente:'BAE Systems',
    inicio:'20/03/2026', entrega:'20/02/2027', progresso:12, prioridade:'Alta',
    etapas:[
      { nome:'Estrutura da Fuselagem',  prazo:'31/05/2026', status:StatusEtapa.ANDAMENTO, funcionariosIds:[3,5] },
      { nome:'Sistemas Hidráulicos',    prazo:'30/06/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'31/07/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[1,4] },
      { nome:'Acabamento Interior',     prazo:'30/09/2026', status:StatusEtapa.PENDENTE,  funcionariosIds:[5]   },
      { nome:'Testes e Inspeções',      prazo:'31/01/2027', status:StatusEtapa.PENDENTE,  funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'20/02/2027', status:StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes:[], pecasIds:['CMP-001','CMP-003','CMP-004','CMP-010'],
  });

  console.log('  ✓ 7 ordens criadas com etapas, testes e peças');

  // ── Inspeções de Qualidade ─────────────────────────────────────────────────
  const inspecoes = [
    { id:'INS-2041', ordemId:'AC-1041', aeronave:'A320 (Lufthansa)',       inspetor:'Eng. Carlos Silva',    fase:'Aviônica',        tipo:TipoTeste.ELETRICO,     data:'22/04/2026', resultado:ResultadoTeste.APROVADO  },
    { id:'INS-2042', ordemId:'AC-1041', aeronave:'A320 (Lufthansa)',       inspetor:'Eng. Fernanda Torres', fase:'Hidráulica',      tipo:TipoTeste.HIDRAULICO,   data:'18/04/2026', resultado:ResultadoTeste.APROVADO  },
    { id:'INS-2043', ordemId:'AC-1042', aeronave:'737 MAX (Ryanair)',      inspetor:'Eng. Fernanda Torres', fase:'Hidráulica',      tipo:TipoTeste.HIDRAULICO,   data:'15/04/2026', resultado:null                    },
    { id:'INS-2044', ordemId:'AC-1043', aeronave:'E175 (LATAM)',           inspetor:'Eng. Ana Souza',       fase:'Certificação',    tipo:TipoTeste.AERODINAMICO, data:'25/02/2026', resultado:ResultadoTeste.APROVADO  },
    { id:'INS-2045', ordemId:'AC-1044', aeronave:'G550 (NetJets)',         inspetor:'Eng. Carlos Silva',    fase:'Estrutura',       tipo:TipoTeste.ELETRICO,     data:'10/04/2026', resultado:null                    },
    { id:'INS-2046', ordemId:'AC-1046', aeronave:'787-9 (Emirates)',       inspetor:'Eng. Ana Souza',       fase:'Estrutura',       tipo:TipoTeste.HIDRAULICO,   data:'12/04/2026', resultado:null                    },
    { id:'INS-2047', ordemId:'AC-1047', aeronave:'C-130J (BAE Systems)',   inspetor:'Eng. Fernanda Torres', fase:'Estrutura',       tipo:TipoTeste.ELETRICO,     data:'05/04/2026', resultado:null                    },
    { id:'INS-2048', ordemId:'AC-1042', aeronave:'737 MAX (Ryanair)',      inspetor:'Eng. Carlos Silva',    fase:'Estrutura',       tipo:TipoTeste.AERODINAMICO, data:'08/04/2026', resultado:ResultadoTeste.REPROVADO },
  ];
  await prisma.inspecaoQualidade.createMany({ data: inspecoes });
  console.log(`  ✓ ${inspecoes.length} inspeções criadas`);

  console.log('\n✅ Seed concluído com sucesso!');
  console.log('   Usuário padrão: carlos.silva / 123456 (ENGENHEIRO)');
  console.log('   Admin padrão:   j.costa      / 123456 (ADMINISTRADOR)');
}

main()
  .catch(e => { console.error('❌ Erro no seed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
