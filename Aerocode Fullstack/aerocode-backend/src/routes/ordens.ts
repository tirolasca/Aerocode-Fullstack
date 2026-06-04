import { Router } from 'express';
import { PrismaClient, StatusEtapa } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const INCLUDE = {
  etapas:    { include: { funcionarios: true }, orderBy: { id: 'asc' as const } },
  testes:    { orderBy: { id: 'asc' as const } },
  pecas:     true,
} as const;

/** Converte registro Prisma para o formato esperado pelo frontend */
function serial(o: any) {
  return {
    id: o.id, codigo: o.codigo, modelo: o.modelo, tipo: o.tipo,
    capacidade: o.capacidade, alcance: o.alcance, cliente: o.cliente,
    inicio: o.inicio, entrega: o.entrega, progresso: o.progresso, prioridade: o.prioridade,
    etapas: (o.etapas || []).map((e: any) => ({
      id: e.id, nome: e.nome, prazo: e.prazo, status: e.status,
      funcionariosIds: (e.funcionarios || []).map((ef: any) => ef.funcionarioId),
    })),
    testes:   (o.testes || []).map((t: any) => ({ id: t.id, tipo: t.tipo, resultado: t.resultado })),
    pecasIds: (o.pecas  || []).map((op: any) => op.pecaId),
  };
}

async function recalcProgresso(ordemId: string) {
  const etapas = await prisma.etapa.findMany({ where: { ordemId } });
  const prog = etapas.length === 0 ? 0 :
    Math.round(etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length / etapas.length * 100);
  await prisma.ordem.update({ where: { id: ordemId }, data: { progresso: prog } });
  return prog;
}

// ── GET /api/ordens ──────────────────────────────────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const list = await prisma.ordem.findMany({ include: INCLUDE, orderBy: { criadoEm: 'desc' } });
    res.json(list.map(serial));
  } catch (e) { res.status(500).json({ erro: 'Erro ao listar ordens', detalhe: String(e) }); }
});

// ── GET /api/ordens/:id ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const o = await prisma.ordem.findUnique({ where: { id: req.params.id }, include: INCLUDE });
    if (!o) return res.status(404).json({ erro: 'Ordem não encontrada' });
    res.json(serial(o));
  } catch (e) { res.status(500).json({ erro: String(e) }); }
});

// ── POST /api/ordens ─────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { codigo, modelo, tipo, capacidade, alcance, cliente, inicio, entrega, prioridade } = req.body;
    const existing = await prisma.ordem.findMany({ select: { id: true } });
    const next = Math.max(...existing.map(o => parseInt(o.id.replace('AC-',''),10)).filter(n=>!isNaN(n)), 1040) + 1;
    const id = `AC-${next}`;
    const nova = await prisma.ordem.create({
      data: { id, codigo: codigo || id, modelo, tipo, capacidade: capacidade||null,
              alcance: alcance||null, cliente, inicio: inicio||'', entrega: entrega||'',
              prioridade: prioridade||'Normal', progresso: 0 },
      include: INCLUDE,
    });
    res.status(201).json(serial(nova));
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ erro: 'Código já cadastrado' });
    res.status(400).json({ erro: 'Dados inválidos', detalhe: String(e) });
  }
});

// ── PUT /api/ordens/:id ──────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const { modelo, tipo, capacidade, alcance, cliente, inicio, entrega, prioridade } = req.body;
    const atualizada = await prisma.ordem.update({
      where: { id: req.params.id },
      data:  { modelo, tipo, capacidade: capacidade||null, alcance: alcance||null,
               cliente, inicio, entrega, prioridade },
      include: INCLUDE,
    });
    res.json(serial(atualizada));
  } catch (e) { res.status(400).json({ erro: 'Erro ao atualizar', detalhe: String(e) }); }
});

// ── DELETE /api/ordens/:id ───────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await prisma.ordem.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: 'Erro ao excluir', detalhe: String(e) }); }
});

// ── POST /api/ordens/:id/etapas ──────────────────────────────────────────────
router.post('/:id/etapas', async (req, res) => {
  try {
    const nova = await prisma.etapa.create({
      data: { ordemId: req.params.id, nome: req.body.nome, prazo: req.body.prazo||'', status: 'PENDENTE' },
    });
    res.status(201).json({ ...nova, funcionariosIds: [] });
  } catch (e) { res.status(400).json({ erro: 'Erro ao criar etapa', detalhe: String(e) }); }
});

// ── POST /api/ordens/:id/testes ──────────────────────────────────────────────
router.post('/:id/testes', async (req, res) => {
  try {
    const novo = await prisma.teste.create({
      data: { ordemId: req.params.id, tipo: req.body.tipo, resultado: req.body.resultado },
    });
    res.status(201).json(novo);
  } catch (e) { res.status(400).json({ erro: 'Erro ao criar teste', detalhe: String(e) }); }
});

// ── POST /api/ordens/:id/pecas/:pecaId ──────────────────────────────────────
router.post('/:id/pecas/:pecaId', async (req, res) => {
  try {
    await prisma.ordemPeca.create({ data: { ordemId: req.params.id, pecaId: req.params.pecaId } });
    res.status(201).json({ ok: true });
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ erro: 'Peça já associada' });
    res.status(400).json({ erro: String(e) });
  }
});

// ── DELETE /api/ordens/:id/pecas/:pecaId ─────────────────────────────────────
router.delete('/:id/pecas/:pecaId', async (req, res) => {
  try {
    await prisma.ordemPeca.delete({
      where: { ordemId_pecaId: { ordemId: req.params.id, pecaId: req.params.pecaId } },
    });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

export { recalcProgresso };
export default router;
