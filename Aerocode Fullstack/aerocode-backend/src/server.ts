import express from 'express';
import cors    from 'cors';
import { middlewareMetricas } from './middleware/metricas';

import rotaOrdens       from './routes/ordens';
import rotaEtapas       from './routes/etapas';
import rotaTestes       from './routes/testes';
import rotaFuncionarios from './routes/funcionarios';
import rotaPecas        from './routes/pecas';
import rotaInspecoes    from './routes/inspecoes';
import rotaMetricas     from './routes/metricas';

const app  = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(middlewareMetricas);

app.use('/api/ordens',       rotaOrdens);
app.use('/api/etapas',       rotaEtapas);
app.use('/api/testes',       rotaTestes);
app.use('/api/funcionarios', rotaFuncionarios);
app.use('/api/pecas',        rotaPecas);
app.use('/api/inspecoes',    rotaInspecoes);
app.use('/api/metricas',     rotaMetricas);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

app.listen(PORT, () => {
  console.log(`✈  Aerocode Backend rodando em http://localhost:${PORT}`);
});

export default app;
