import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

function nextId(list: {id:string}[]) {
  const nums = list.map(i => parseInt(i.id.replace('INS-',''),10)).filter(n=>!isNaN(n));
  return `INS-${Math.max(...nums, 2048) + 1}`;
}

router.get('/', async (_req, res) => {
  try { res.json(await prisma.inspecaoQualidade.findMany({ orderBy: { criadoEm: 'desc' } })); }
  catch (e) { res.status(500).json({ erro: String(e) }); }
});

router.post('/', async (req, res) => {
  try {
    const existing = await prisma.inspecaoQualidade.findMany({ select: { id: true } });
    const id = nextId(existing);
    const { ordemId, aeronave, inspetor, fase, tipo, data, resultado } = req.body;
    const nova = await prisma.inspecaoQualidade.create({
      data: { id, ordemId, aeronave: aeronave||'', inspetor: inspetor||'',
              fase: fase||'', tipo, data: data||'', resultado: resultado||null },
    });
    res.status(201).json(nova);
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { aeronave, inspetor, fase, tipo, data, resultado } = req.body;
    const atualizada = await prisma.inspecaoQualidade.update({
      where: { id: req.params.id },
      data: { aeronave, inspetor, fase, tipo, data, resultado: resultado||null },
    });
    res.json(atualizada);
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.inspecaoQualidade.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

export default router;
