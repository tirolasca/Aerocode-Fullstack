/**
 * routes/metricas.ts
 * Expõe os dados de métricas coletados pelo middleware para o frontend.
 */
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/metricas/resumo
// Retorna médias de latência, processamento e resposta agrupadas por
// quantidade de usuários concorrentes (1, 5 e 10).
router.get('/resumo', async (_req, res) => {
  try {
    const grupos = await prisma.logMetrica.groupBy({
      by: ['usuariosConcorrentes'],
      _avg: {
        latenciaMs:      true,
        processamentoMs: true,
        respostaMs:      true,
      },
      _count: { id: true },
      orderBy: { usuariosConcorrentes: 'asc' },
    });
    res.json(grupos);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar métricas', detalhe: String(err) });
  }
});

// GET /api/metricas/historico
// Retorna os últimos 200 registros para exibição em gráfico de linha.
router.get('/historico', async (_req, res) => {
  try {
    const historico = await prisma.logMetrica.findMany({
      orderBy: { registradoEm: 'desc' },
      take: 200,
    });
    res.json(historico.reverse());
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar histórico', detalhe: String(err) });
  }
});

export default router;
