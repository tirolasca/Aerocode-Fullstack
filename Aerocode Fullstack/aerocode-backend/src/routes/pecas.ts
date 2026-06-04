import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req, res) => {
  try { res.json(await prisma.peca.findMany({ orderBy: { nome: 'asc' } })); }
  catch (e) { res.status(500).json({ erro: String(e) }); }
});

router.get('/:id', async (req, res) => {
  try {
    const p = await prisma.peca.findUnique({ where: { id: req.params.id } });
    if (!p) return res.status(404).json({ erro: 'Peça não encontrada' });
    res.json(p);
  } catch (e) { res.status(500).json({ erro: String(e) }); }
});

router.post('/', async (req, res) => {
  try {
    const nova = await prisma.peca.create({ data: req.body });
    res.status(201).json(nova);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ erro: 'ID já cadastrado' });
    res.status(400).json({ erro: String(e) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const atualizada = await prisma.peca.update({ where: { id: req.params.id }, data: req.body });
    res.json(atualizada);
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.peca.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

export default router;
