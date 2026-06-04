/**
 * carga/testeCarga.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Script de teste de carga para medir as três métricas de qualidade
 * exigidas no Relatório de Qualidade da Aerocode:
 *
 *   • Latência        — tempo de transmissão de rede (cliente → servidor)
 *   • Tempo de        — trabalho do servidor (receber req → enviar res)
 *     processamento
 *   • Tempo de        — total percebido pelo usuário (latência + processamento)
 *     resposta
 *
 * Execução:
 *   npx ts-node src/carga/testeCarga.ts
 *
 * Pré-requisito: o servidor deve estar rodando em http://localhost:3001
 * ─────────────────────────────────────────────────────────────────────────────
 */

const BASE_URL   = 'http://localhost:3001';
const ROTAS_ALVO = [
  '/api/ordens',
  '/api/funcionarios',
  '/api/pecas',
  '/api/inspecoes',
];
const REPETICOES_POR_USUARIO = 10; // requisições por usuário virtual

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface ResultadoRequisicao {
  latenciaMs:      number;
  processamentoMs: number;
  respostaMs:      number;
}

interface ResumoGrupo {
  usuarios:          number;
  latenciaMediaMs:   number;
  processMediaMs:    number;
  respostaMediaMs:   number;
  totalRequisicoes:  number;
}

// ── Utilitários ───────────────────────────────────────────────────────────────
function media(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function aguardar(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ── Executa uma única requisição e coleta as métricas ────────────────────────
async function fazerRequisicao(rota: string): Promise<ResultadoRequisicao> {
  const tsEnvio = Date.now();

  const resp = await fetch(`${BASE_URL}${rota}`, {
    headers: {
      // Informa ao middleware o timestamp de envio para cálculo de latência
      'X-Request-Start': String(tsEnvio),
      'Accept':          'application/json',
    },
  });

  const tsRecebimento = Date.now();

  // Lê as métricas retornadas pelo middleware nos cabeçalhos de resposta
  const processamentoMs = parseFloat(resp.headers.get('X-Processamento-Ms') ?? '0');
  const respostaMs      = tsRecebimento - tsEnvio;           // medido no cliente
  const latenciaMs      = Math.max(0, respostaMs - processamentoMs);

  return { latenciaMs, processamentoMs, respostaMs };
}

// ── Simula N usuários concorrentes ─────────────────────────────────────────────
async function simularUsuarios(n: number): Promise<ResultadoRequisicao[]> {
  const tarefasUsuario = Array.from({ length: n }, async () => {
    const resultados: ResultadoRequisicao[] = [];
    for (let i = 0; i < REPETICOES_POR_USUARIO; i++) {
      const rota = ROTAS_ALVO[i % ROTAS_ALVO.length];
      try {
        const r = await fazerRequisicao(rota);
        resultados.push(r);
      } catch {
        // ignora erros pontuais de rede
      }
      await aguardar(50); // pequena pausa entre requisições do mesmo usuário
    }
    return resultados;
  });

  // Executa todos os usuários em paralelo
  const todos = await Promise.all(tarefasUsuario);
  return todos.flat();
}

// ── Ponto de entrada ──────────────────────────────────────────────────────────
async function main(): Promise<void> {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  AEROCODE — Teste de Carga / Relatório de Métricas de Qualidade');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const resultados: ResumoGrupo[] = [];

  for (const n of [1, 5, 10]) {
    console.log(`▶  Simulando ${n} usuário(s) concorrente(s)...`);
    const dados = await simularUsuarios(n);

    const resumo: ResumoGrupo = {
      usuarios:         n,
      latenciaMediaMs:  parseFloat(media(dados.map(d => d.latenciaMs)).toFixed(2)),
      processMediaMs:   parseFloat(media(dados.map(d => d.processamentoMs)).toFixed(2)),
      respostaMediaMs:  parseFloat(media(dados.map(d => d.respostaMs)).toFixed(2)),
      totalRequisicoes: dados.length,
    };

    resultados.push(resumo);

    console.log(`   • Latência média:           ${resumo.latenciaMediaMs} ms`);
    console.log(`   • Processamento médio:      ${resumo.processMediaMs} ms`);
    console.log(`   • Tempo de resposta médio:  ${resumo.respostaMediaMs} ms`);
    console.log(`   • Total de requisições:     ${resumo.totalRequisicoes}\n`);

    await aguardar(500); // pausa entre grupos de carga
  }

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  TABELA RESUMO (valores em milissegundos)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  Usuários │ Latência (ms) │ Processamento (ms) │ Resposta (ms)');
  console.log('  ─────────┼───────────────┼────────────────────┼───────────────');
  for (const r of resultados) {
    console.log(
      `  ${String(r.usuarios).padEnd(8)} │ ${String(r.latenciaMediaMs).padEnd(13)} │ ${String(r.processMediaMs).padEnd(18)} │ ${r.respostaMediaMs}`
    );
  }
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Persiste o resumo no banco para exibição no dashboard
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    for (const r of resultados) {
      await prisma.logMetrica.createMany({
        data: Array.from({ length: 5 }, () => ({
          rota:                '/carga/teste',
          metodo:              'GET',
          statusHttp:          200,
          latenciaMs:          r.latenciaMediaMs,
          processamentoMs:     r.processMediaMs,
          respostaMs:          r.respostaMediaMs,
          usuariosConcorrentes: r.usuarios,
        })),
      });
    }
    await prisma.$disconnect();
    console.log('✔  Métricas salvas no banco de dados.');
  } catch {
    console.log('⚠  Não foi possível salvar no banco (servidor pode estar offline).');
  }
}

main().catch(console.error);
