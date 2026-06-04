
export const TipoAeronave = {
  COMERCIAL: 'COMERCIAL',
  MILITAR:   'MILITAR',
};

export const TipoPeca = {
  NACIONAL:  'NACIONAL',
  IMPORTADA: 'IMPORTADA',
};

export const StatusPeca = {
  EM_PRODUCAO:  'EM_PRODUCAO',
  EM_TRANSPORTE:'EM_TRANSPORTE',
  PRONTA:       'PRONTA',
};

export const StatusEtapa = {
  PENDENTE:  'PENDENTE',
  ANDAMENTO: 'ANDAMENTO',
  CONCLUIDA: 'CONCLUIDA',
};

export const NivelPermissao = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  ENGENHEIRO:    'ENGENHEIRO',
  OPERADOR:      'OPERADOR',
};

export const TipoTeste = {
  ELETRICO:      'ELETRICO',
  HIDRAULICO:    'HIDRAULICO',
  AERODINAMICO:  'AERODINAMICO',
};

export const ResultadoTeste = {
  APROVADO:  'APROVADO',
  REPROVADO: 'REPROVADO',
};

export const labelTipoAeronave   = { COMERCIAL:'Comercial',     MILITAR:'Militar' };
export const labelTipoPeca       = { NACIONAL:'Nacional',       IMPORTADA:'Importada' };
export const labelStatusPeca     = { EM_PRODUCAO:'Em Produção', EM_TRANSPORTE:'Em Transporte', PRONTA:'Pronta' };
export const labelStatusEtapa    = { PENDENTE:'Pendente',       ANDAMENTO:'Em Andamento',       CONCLUIDA:'Concluída' };
export const labelNivelPermissao = { ADMINISTRADOR:'Administrador', ENGENHEIRO:'Engenheiro',    OPERADOR:'Operador' };
export const labelTipoTeste      = { ELETRICO:'Elétrico',       HIDRAULICO:'Hidráulico',        AERODINAMICO:'Aerodinâmico' };
export const labelResultadoTeste = { APROVADO:'Aprovado',       REPROVADO:'Reprovado' };

export const usuarioAtual = {
  id:              1,
  nome:            'Carlos Silva',
  nivelPermissao:  NivelPermissao.ENGENHEIRO,
  iniciais:        'CS',
  email:           'carlos.silva@aerocode.com',
  telefone:        '(12) 99123-4567',
  endereco:        'São José dos Campos, SP',
};

export const funcionarios = [
  { id:1, nome:'Carlos Silva',    telefone:'(12) 99123-4567', endereco:'São José dos Campos, SP', usuario:'carlos.silva',   nivelPermissao: NivelPermissao.ENGENHEIRO    },
  { id:2, nome:'Fernanda Torres', telefone:'(12) 98234-5678', endereco:'São José dos Campos, SP', usuario:'f.torres',       nivelPermissao: NivelPermissao.ENGENHEIRO    },
  { id:3, nome:'Ricardo Lima',    telefone:'(11) 97345-6789', endereco:'Guarulhos, SP',            usuario:'r.lima',         nivelPermissao: NivelPermissao.OPERADOR      },
  { id:4, nome:'Ana Souza',       telefone:'(12) 96456-7890', endereco:'São José dos Campos, SP', usuario:'a.souza',        nivelPermissao: NivelPermissao.ENGENHEIRO    },
  { id:5, nome:'Paulo Nunes',     telefone:'(21) 95567-8901', endereco:'Rio de Janeiro, RJ',       usuario:'p.nunes',        nivelPermissao: NivelPermissao.OPERADOR      },
  { id:6, nome:'Juliana Costa',   telefone:'(12) 94678-9012', endereco:'São José dos Campos, SP', usuario:'j.costa',        nivelPermissao: NivelPermissao.ADMINISTRADOR },
  { id:7, nome:'Marcos Oliveira', telefone:'(12) 93789-0123', endereco:'Taubaté, SP',              usuario:'m.oliveira',     nivelPermissao: NivelPermissao.ADMINISTRADOR },
];

export const pecas = [
  { id:'CMP-001', nome:'Motor CFM56-5B',          tipo: TipoPeca.IMPORTADA, fornecedor:'CFM International', status: StatusPeca.PRONTA,        quantidade:12, disponivel:8   },
  { id:'CMP-002', nome:'Motor GE90-115B',          tipo: TipoPeca.IMPORTADA, fornecedor:'GE Aviation',       status: StatusPeca.EM_TRANSPORTE, quantidade:6,  disponivel:2   },
  { id:'CMP-003', nome:'Trem de Pouso Principal',  tipo: TipoPeca.IMPORTADA, fornecedor:'Safran Landing',    status: StatusPeca.PRONTA,        quantidade:20, disponivel:14  },
  { id:'CMP-004', nome:'Trem de Pouso Dianteiro',  tipo: TipoPeca.IMPORTADA, fornecedor:'Safran Landing',    status: StatusPeca.PRONTA,        quantidade:18, disponivel:12  },
  { id:'CMP-005', nome:'Sistema FMS Aviônica',     tipo: TipoPeca.IMPORTADA, fornecedor:'Honeywell',         status: StatusPeca.EM_TRANSPORTE, quantidade:8,  disponivel:1   },
  { id:'CMP-006', nome:'Aileron Composto',         tipo: TipoPeca.NACIONAL,  fornecedor:'Embraer SAS',       status: StatusPeca.PRONTA,        quantidade:30, disponivel:22  },
  { id:'CMP-007', nome:'APU GTCP131-9',            tipo: TipoPeca.IMPORTADA, fornecedor:'Honeywell',         status: StatusPeca.PRONTA,        quantidade:10, disponivel:7   },
  { id:'CMP-008', nome:'Assento Passageiro Econ.', tipo: TipoPeca.NACIONAL,  fornecedor:'Recaro Aircraft',   status: StatusPeca.EM_PRODUCAO,   quantidade:900,disponivel:350 },
  { id:'CMP-009', nome:'Painel de Controle FCC',   tipo: TipoPeca.IMPORTADA, fornecedor:'Collins Aerospace', status: StatusPeca.PRONTA,        quantidade:15, disponivel:11  },
  { id:'CMP-010', nome:'Revestimento Fuselagem',   tipo: TipoPeca.NACIONAL,  fornecedor:'Embraer Composites',status: StatusPeca.PRONTA,        quantidade:25, disponivel:18  },
];

export const ordens = [
  {
    id:         'AC-1041',
    codigo:     'AC-1041',
    modelo:     'Airbus A320',
    tipo:       TipoAeronave.COMERCIAL,
    capacidade: 180,
    alcance:    6150,
    cliente:    'Lufthansa AG',
    inicio:     '02/01/2026',
    entrega:    '30/06/2026',
    progresso:  78,
    prioridade: 'Alta',

    etapas: [
      { nome:'Estrutura da Fuselagem',   prazo:'28/02/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[1,3] },
      { nome:'Sistemas Hidráulicos',     prazo:'31/03/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[2,3] },
      { nome:'Eletricidade e Aviônica',  prazo:'30/04/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[1,4] },
      { nome:'Acabamento Interior',      prazo:'31/05/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[3,5] },
      { nome:'Testes e Inspeções',       prazo:'20/06/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2,4] },
      { nome:'Certificação Final',       prazo:'30/06/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[1,6] },
    ],

    testes: [
      { tipo: TipoTeste.HIDRAULICO,    resultado: ResultadoTeste.APROVADO  },
      { tipo: TipoTeste.ELETRICO,      resultado: ResultadoTeste.APROVADO  },
      { tipo: TipoTeste.AERODINAMICO,  resultado: null }, // ainda não realizado
    ],

    pecasIds: ['CMP-001','CMP-003','CMP-006','CMP-005','CMP-008','CMP-007'],

    historico: [
      { data:'12/04/2026', autorId:1, texto:'Inspeção parcial concluída. Aviônica aguardando entrega Honeywell prevista para 20/04.' },
      { data:'05/04/2026', autorId:2, texto:'Sistema hidráulico validado conforme AS9100. Aprovado para fase elétrica.' },
      { data:'28/03/2026', autorId:3, texto:'Estrutura da fuselagem finalizada. Raio-X sem anomalias. Documentação arquivada.' },
    ],
  },
  {
    id:'AC-1042', codigo:'AC-1042', modelo:'Boeing 737 MAX', tipo: TipoAeronave.COMERCIAL,
    capacidade:189, alcance:6570, cliente:'Ryanair Ltd',
    inicio:'15/01/2026', entrega:'15/08/2026', progresso:45, prioridade:'Alta',
    etapas: [
      { nome:'Estrutura da Fuselagem',  prazo:'28/02/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[3,5] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/03/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[2,5] },
      { nome:'Eletricidade e Aviônica', prazo:'30/04/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[1,4] },
      { nome:'Acabamento Interior',     prazo:'31/05/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[3]   },
      { nome:'Testes e Inspeções',      prazo:'10/08/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'15/08/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes: [
      { tipo: TipoTeste.HIDRAULICO,   resultado: null },
      { tipo: TipoTeste.ELETRICO,     resultado: null },
      { tipo: TipoTeste.AERODINAMICO, resultado: null },
    ],
    pecasIds: ['CMP-001','CMP-003','CMP-004','CMP-009'],
    historico: [
      { data:'14/04/2026', autorId:3, texto:'Inspeção estrutural em andamento. Hidráulica 75% completa.' },
    ],
  },
  {
    id:'AC-1043', codigo:'AC-1043', modelo:'Embraer E175', tipo: TipoAeronave.COMERCIAL,
    capacidade:76, alcance:3735, cliente:'LATAM Airlines',
    inicio:'20/11/2025', entrega:'28/02/2026', progresso:100, prioridade:'Normal',
    etapas: [
      { nome:'Estrutura da Fuselagem',  prazo:'15/12/2025', status: StatusEtapa.CONCLUIDA, funcionariosIds:[1,3] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/12/2025', status: StatusEtapa.CONCLUIDA, funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'20/01/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[4]   },
      { nome:'Acabamento Interior',     prazo:'05/02/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[3,5] },
      { nome:'Testes e Inspeções',      prazo:'20/02/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'28/02/2026', status: StatusEtapa.CONCLUIDA, funcionariosIds:[1,6] },
    ],
    testes: [
      { tipo: TipoTeste.HIDRAULICO,   resultado: ResultadoTeste.APROVADO },
      { tipo: TipoTeste.ELETRICO,     resultado: ResultadoTeste.APROVADO },
      { tipo: TipoTeste.AERODINAMICO, resultado: ResultadoTeste.APROVADO },
    ],
    pecasIds: ['CMP-006','CMP-003','CMP-007','CMP-010'],
    historico: [
      { data:'25/02/2026', autorId:1, texto:'Certificação concluída. Aeronave aprovada para entrega ao cliente LATAM.' },
    ],
  },
  {
    id:'AC-1044', codigo:'AC-1044', modelo:'Gulfstream G550', tipo: TipoAeronave.COMERCIAL,
    capacidade:16, alcance:12501, cliente:'NetJets Inc.',
    inicio:'05/02/2026', entrega:'20/09/2026', progresso:15, prioridade:'Normal',
    etapas: [
      { nome:'Estrutura da Fuselagem',  prazo:'31/03/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[5,3] },
      { nome:'Sistemas Hidráulicos',    prazo:'30/04/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'31/05/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[1]   },
      { nome:'Acabamento Interior',     prazo:'30/06/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[3]   },
      { nome:'Testes e Inspeções',      prazo:'15/09/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[4]   },
      { nome:'Certificação Final',      prazo:'20/09/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes: [
      { tipo: TipoTeste.HIDRAULICO,   resultado: null },
      { tipo: TipoTeste.ELETRICO,     resultado: null },
      { tipo: TipoTeste.AERODINAMICO, resultado: null },
    ],
    pecasIds: ['CMP-002','CMP-003','CMP-009'],
    historico: [],
  },
  {
    id:'AC-1045', codigo:'AC-1045', modelo:'Dassault Falcon 7X', tipo: TipoAeronave.COMERCIAL,
    capacidade:14, alcance:11019, cliente:'Dassault Aviation',
    inicio:'10/02/2026', entrega:'10/10/2026', progresso:5, prioridade:'Alta',
    etapas: [
      { nome:'Estrutura da Fuselagem',  prazo:'30/04/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[3]   },
      { nome:'Sistemas Hidráulicos',    prazo:'31/05/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'30/06/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[1]   },
      { nome:'Acabamento Interior',     prazo:'31/07/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[5]   },
      { nome:'Testes e Inspeções',      prazo:'30/09/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[4]   },
      { nome:'Certificação Final',      prazo:'10/10/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes: [
      { tipo: TipoTeste.HIDRAULICO,   resultado: null },
      { tipo: TipoTeste.ELETRICO,     resultado: null },
      { tipo: TipoTeste.AERODINAMICO, resultado: null },
    ],
    pecasIds: ['CMP-007','CMP-004','CMP-009'],
    historico: [],
  },
  {
    id:'AC-1046', codigo:'AC-1046', modelo:'Boeing 787-9', tipo: TipoAeronave.COMERCIAL,
    capacidade:296, alcance:14140, cliente:'Emirates Airlines',
    inicio:'01/03/2026', entrega:'01/12/2026', progresso:8, prioridade:'Crítica',
    etapas: [
      { nome:'Estrutura da Fuselagem',  prazo:'30/04/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[1,3,5] },
      { nome:'Sistemas Hidráulicos',    prazo:'31/05/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2]     },
      { nome:'Eletricidade e Aviônica', prazo:'30/06/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[4]     },
      { nome:'Acabamento Interior',     prazo:'31/07/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[3,5]   },
      { nome:'Testes e Inspeções',      prazo:'20/11/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2,4]   },
      { nome:'Certificação Final',      prazo:'01/12/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[6]     },
    ],
    testes: [
      { tipo: TipoTeste.HIDRAULICO,   resultado: null },
      { tipo: TipoTeste.ELETRICO,     resultado: null },
      { tipo: TipoTeste.AERODINAMICO, resultado: null },
    ],
    pecasIds: ['CMP-002','CMP-003','CMP-004','CMP-005','CMP-008'],
    historico: [],
  },
  {
    id:'AC-1047', codigo:'AC-1047', modelo:'Lockheed C-130J', tipo: TipoAeronave.MILITAR,
    capacidade:92, alcance:6852, cliente:'BAE Systems',
    inicio:'20/03/2026', entrega:'20/02/2027', progresso:12, prioridade:'Alta',
    etapas: [
      { nome:'Estrutura da Fuselagem',  prazo:'31/05/2026', status: StatusEtapa.ANDAMENTO, funcionariosIds:[3,5] },
      { nome:'Sistemas Hidráulicos',    prazo:'30/06/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[2]   },
      { nome:'Eletricidade e Aviônica', prazo:'31/07/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[1,4] },
      { nome:'Acabamento Interior',     prazo:'30/09/2026', status: StatusEtapa.PENDENTE,  funcionariosIds:[5]   },
      { nome:'Testes e Inspeções',      prazo:'31/01/2027', status: StatusEtapa.PENDENTE,  funcionariosIds:[2,4] },
      { nome:'Certificação Final',      prazo:'20/02/2027', status: StatusEtapa.PENDENTE,  funcionariosIds:[6]   },
    ],
    testes: [
      { tipo: TipoTeste.HIDRAULICO,   resultado: null },
      { tipo: TipoTeste.ELETRICO,     resultado: null },
      { tipo: TipoTeste.AERODINAMICO, resultado: null },
    ],
    pecasIds: ['CMP-001','CMP-003','CMP-004','CMP-010'],
    historico: [],
  },
];

export const inspecoesQualidade = [
  { id:'INS-2041', ordemId:'AC-1041', aeronave:'A320 (Lufthansa)',  inspetor:'Eng. Carlos Silva',    data:'12/04/2026', fase:'Estrutura', tipo: TipoTeste.AERODINAMICO, resultado: ResultadoTeste.APROVADO  },
  { id:'INS-2042', ordemId:'AC-1041', aeronave:'A320 (Lufthansa)',  inspetor:'Eng. Fernanda Torres', data:'13/04/2026', fase:'Hidráulica', tipo: TipoTeste.HIDRAULICO,   resultado: ResultadoTeste.APROVADO  },
  { id:'INS-2043', ordemId:'AC-1042', aeronave:'B737 MAX (Ryanair)',inspetor:'Eng. Ricardo Lima',    data:'14/04/2026', fase:'Estrutura', tipo: TipoTeste.AERODINAMICO, resultado: null                     },
  { id:'INS-2044', ordemId:'AC-1043', aeronave:'E175 (LATAM)',      inspetor:'Eng. Ana Souza',       data:'14/04/2026', fase:'Certif.',   tipo: TipoTeste.ELETRICO,     resultado: ResultadoTeste.REPROVADO },
  { id:'INS-2045', ordemId:'AC-1044', aeronave:'G550 (NetJets)',    inspetor:'Eng. Paulo Nunes',     data:'15/04/2026', fase:'Estrutura', tipo: TipoTeste.AERODINAMICO, resultado: null                     },
  { id:'INS-2046', ordemId:'AC-1041', aeronave:'A320 (Lufthansa)',  inspetor:'Eng. Carlos Silva',    data:'15/04/2026', fase:'Elétrica',  tipo: TipoTeste.ELETRICO,     resultado: ResultadoTeste.APROVADO  },
  { id:'INS-2047', ordemId:'AC-1046', aeronave:'B787-9 (Emirates)', inspetor:'Eng. Torres',          data:'15/04/2026', fase:'Estrutura', tipo: TipoTeste.AERODINAMICO, resultado: null                     },
];

export const itensChecklist = [
  'Inspeção visual da estrutura principal',
  'Verificação de torque dos parafusos críticos',
  'Teste de pressão do sistema hidráulico',
  'Verificação de sistemas elétricos e aviônica',
  'Inspeção de componentes de segurança',
  'Conformidade com normas AS9100 / ISO 9001',
  'Documentação técnica completa e assinada',
  'Assinatura do engenheiro responsável',
];

export const producaoMensal = [
  { mes:'Jan', concluidas:8,  planejadas:10 },
  { mes:'Fev', concluidas:11, planejadas:12 },
  { mes:'Mar', concluidas:9,  planejadas:11 },
  { mes:'Abr', concluidas:14, planejadas:13 },
  { mes:'Mai', concluidas:12, planejadas:14 },
  { mes:'Jun', concluidas:15, planejadas:14 },
  { mes:'Jul', concluidas:13, planejadas:15 },
  { mes:'Ago', concluidas:16, planejadas:16 },
  { mes:'Set', concluidas:13, planejadas:14 },
  { mes:'Out', concluidas:17, planejadas:16 },
  { mes:'Nov', concluidas:18, planejadas:17 },
  { mes:'Dez', concluidas:15, planejadas:16 },
];

export const dadosQualidade = [
  { mes:'Jan', taxa:97.2 }, { mes:'Fev', taxa:98.1 }, { mes:'Mar', taxa:97.8 },
  { mes:'Abr', taxa:98.5 }, { mes:'Mai', taxa:98.2 }, { mes:'Jun', taxa:99.0 },
  { mes:'Jul', taxa:98.7 }, { mes:'Ago', taxa:99.1 }, { mes:'Set', taxa:98.9 },
  { mes:'Out', taxa:99.3 }, { mes:'Nov', taxa:98.8 }, { mes:'Dez', taxa:99.2 },
];

export function statusOrdem(ordem) {
  const etapas = ordem.etapas || [];
  if (etapas.every(e => e.status === StatusEtapa.CONCLUIDA))  return StatusEtapa.CONCLUIDA;
  if (etapas.some (e => e.status === StatusEtapa.ANDAMENTO))  return StatusEtapa.ANDAMENTO;
  return StatusEtapa.PENDENTE;
}
