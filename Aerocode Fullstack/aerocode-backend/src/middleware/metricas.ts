/**
 * middleware/metricas.ts
 *
 * Mede três grandezas em cada requisição HTTP:
 *
 *  ┌──────────────────────────────────────────────────────────────────┐
 *  │  CLIENTE                REDE              SERVIDOR               │
 *  │  ───────               ──────             ────────               │
 *  │  [req enviada]──latência──►[req recebida]                        │
 *  │                            [processamento]◄──────────────────►   │
 *  │  [res recebida]◄─latência──[res enviada]                         │
 *  │  ◄────────────── tempo de resposta total ──────────────────────► │
 *  └──────────────────────────────────────────────────────────────────┘
 *
 *  - latenciaMs      : estimada no servidor via cabeçalho X-Request-Start
 *                      (milissegundos desde que o cliente enviou a requisição
 *                      até ela chegar ao processo Node).
 *  - processamentoMs : tempo entre o início do handler Express e o envio
 *                      do response (trabalho real do servidor).
 *  - respostaMs      : latência + processamento (tempo total percebido
 *                      pelo usuário, excluindo renderização do navegador).
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export function middlewareMetricas(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // ── 1. Latência de rede (estimada) ──────────────────────────────────────────
  // O cliente (ou proxy) pode inserir o cabeçalho X-Request-Start com o
  // timestamp Unix em milissegundos no momento em que a requisição saiu.
  // Se ausente, assumimos 0 ms (útil para testes locais / mesma máquina).
  const requestStartHeader = req.headers['x-request-start'];
  const clienteTimestamp = requestStartHeader
    ? parseFloat(String(requestStartHeader))
    : NaN;

  const chegadaNo = Date.now(); // momento em que chegou ao Node.js

  const latenciaMs = Number.isNaN(clienteTimestamp)
    ? 0
    : Math.max(0, chegadaNo - clienteTimestamp);

  // ── 2. Início do processamento ───────────────────────────────────────────────
  const inicioProcessamento = process.hrtime.bigint(); // resolução de nanosegundos

  // ── 3. Intercepta o fim do response ─────────────────────────────────────────
  res.on('finish', () => {
    const fimProcessamento = process.hrtime.bigint();
    const processamentoMs =
      Number(fimProcessamento - inicioProcessamento) / 1_000_000;

    const respostaMs = latenciaMs + processamentoMs;

    // As três linhas de res.setHeader foram removidas para evitar o erro 
    // "Cannot set headers after they are sent to the client".

    // Persiste no banco de forma assíncrona (não bloqueia a resposta)
    prisma.logMetrica
      .create({
        data: {
          rota:            req.route?.path ?? req.path,
          metodo:          req.method,
          statusHttp:      res.statusCode,
          latenciaMs:      latenciaMs,
          processamentoMs: processamentoMs,
          respostaMs:      respostaMs,
          usuariosConcorrentes: 1, // atualizado pelo teste de carga
        },
      })
      .catch(() => {
        // Silencia erros de persistência para não impactar o usuário
      });
  });

  next();
}