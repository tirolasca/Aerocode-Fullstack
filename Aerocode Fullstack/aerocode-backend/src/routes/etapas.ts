import { Router } from 'express';
import { PrismaClient, StatusEtapa } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

async function recalcProgresso(ordemId: string) {
  const etapas = await prisma.etapa.findMany({ where: { ordemId } });
  const prog = etapas.length === 0 ? 0 :
    Math.round(etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length / etapas.length * 100);
  await prisma.ordem.update({ where: { id: ordemId }, data: { progresso: prog } });
  return prog;
}

// PATCH /api/etapas/:id/iniciar
router.patch('/:id/iniciar', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const etapa = await prisma.etapa.findUnique({ where: { id } });
    if (!etapa) return res.status(404).json({ erro: 'Etapa não encontrada' });
    if (etapa.status !== StatusEtapa.PENDENTE)
      return res.status(400).json({ erro: 'Apenas etapas PENDENTE podem ser iniciadas' });
    const atualizada = await prisma.etapa.update({ where: { id }, data: { status: StatusEtapa.ANDAMENTO } });
    await recalcProgresso(etapa.ordemId);
    res.json(atualizada);
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

// PATCH /api/etapas/:id/concluir
router.patch('/:id/concluir', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const etapa = await prisma.etapa.findUnique({ where: { id } });
    if (!etapa) return res.status(404).json({ erro: 'Etapa não encontrada' });
    if (etapa.status !== StatusEtapa.ANDAMENTO)
      return res.status(400).json({ erro: 'Apenas etapas ANDAMENTO podem ser concluídas' });
    const atualizada = await prisma.etapa.update({ where: { id }, data: { status: StatusEtapa.CONCLUIDA } });
    const progresso = await recalcProgresso(etapa.ordemId);
    res.json({ ...atualizada, progresso });
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

// DELETE /api/etapas/:id
router.delete('/:id', async (req, res) => {
  try {
    const etapa = await prisma.etapa.findUnique({ where: { id: Number(req.params.id) } });
    if (etapa) {
      await prisma.etapa.delete({ where: { id: Number(req.params.id) } });
      await recalcProgresso(etapa.ordemId);
    }
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

// POST /api/etapas/:id/funcionarios  — body: { funcId }
router.post('/:id/funcionarios', async (req, res) => {
  try {
    await prisma.etapaFuncionario.create({
      data: { etapaId: Number(req.params.id), funcionarioId: Number(req.body.funcId) },
    });
    res.status(201).json({ ok: true });
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ erro: 'Funcionário já associado' });
    res.status(400).json({ erro: String(e) });
  }
});

// DELETE /api/etapas/:etapaId/funcionarios/:funcId
router.delete('/:etapaId/funcionarios/:funcId', async (req, res) => {
  try {
    await prisma.etapaFuncionario.delete({
      where: {
        etapaId_funcionarioId: {
          etapaId: Number(req.params.etapaId),
          funcionarioId: Number(req.params.funcId),
        },
      },
    });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

export default router;
