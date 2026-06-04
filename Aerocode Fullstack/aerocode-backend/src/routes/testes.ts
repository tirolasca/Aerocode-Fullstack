import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// DELETE /api/testes/:id
router.delete('/:id', async (req, res) => {
  try {
    await prisma.teste.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

export default router;
