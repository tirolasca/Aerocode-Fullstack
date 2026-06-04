import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
const router = Router();
const prisma = new PrismaClient();

const SELECT = { id:true, nome:true, usuario:true, telefone:true, endereco:true, nivelPermissao:true, criadoEm:true };

router.get('/', async (_req, res) => {
  try { res.json(await prisma.funcionario.findMany({ select: SELECT, orderBy: { nome: 'asc' } })); }
  catch (e) { res.status(500).json({ erro: String(e) }); }
});

router.get('/:id', async (req, res) => {
  try {
    const f = await prisma.funcionario.findUnique({ where: { id: Number(req.params.id) }, select: SELECT });
    if (!f) return res.status(404).json({ erro: 'Funcionário não encontrado' });
    res.json(f);
  } catch (e) { res.status(500).json({ erro: String(e) }); }
});

router.post('/', async (req, res) => {
  try {
    const { nome, usuario, senhaHash, senha, nivelPermissao, telefone, endereco } = req.body;
    const novo = await prisma.funcionario.create({
      data: { nome, usuario, senhaHash: senhaHash || senha || '123456', nivelPermissao, telefone, endereco },
      select: SELECT,
    });
    res.status(201).json(novo);
  } catch (e: any) {
    if (e.code === 'P2002') return res.status(400).json({ erro: 'Usuário já existe' });
    res.status(400).json({ erro: String(e) });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { nome, senhaHash, senha, nivelPermissao, telefone, endereco } = req.body;
    const data: any = { nome, nivelPermissao, telefone, endereco };
    if (senhaHash || senha) data.senhaHash = senhaHash || senha;
    const atualizado = await prisma.funcionario.update({ where: { id: Number(req.params.id) }, data, select: SELECT });
    res.json(atualizado);
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.funcionario.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch (e) { res.status(400).json({ erro: String(e) }); }
});

export default router;
