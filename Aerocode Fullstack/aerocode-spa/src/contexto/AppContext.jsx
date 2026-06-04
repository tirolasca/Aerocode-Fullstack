import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { StatusEtapa, ResultadoTeste } from '../dados/dadosMock';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function req(url, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body !== null) opts.body = JSON.stringify(body);
  const res = await fetch(`${API}${url}`, opts);
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.erro || data.error || `Erro HTTP ${res.status}`);
  return data;
}

function calcProgresso(etapas) {
  if (!etapas || etapas.length === 0) return 0;
  return Math.round(etapas.filter(e => e.status === StatusEtapa.CONCLUIDA).length / etapas.length * 100);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ordens,       setOrdens]       = useState([]);
  const [pecas,        setPecas]        = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [inspecoes,    setInspecoes]    = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [apiError,     setApiError]     = useState(null);

  // ── Carregamento inicial ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [o, p, f, i] = await Promise.all([
          req('/ordens'), req('/pecas'), req('/funcionarios'), req('/inspecoes'),
        ]);
        setOrdens(o);
        setPecas(p);
        setFuncionarios(f.map(fn => ({ ...fn, telefone: fn.telefone || '', endereco: fn.endereco || '' })));
        setInspecoes(i);
      } catch (e) {
        setApiError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── ORDENS ─────────────────────────────────────────────────────────────────
  const addOrdem = useCallback(async (dados) => {
    const nova = await req('/ordens', 'POST', dados);
    setOrdens(prev => [...prev, nova]);
    return nova.id;
  }, []);

  const updateOrdem = useCallback(async (id, dados) => {
    const atualizada = await req(`/ordens/${id}`, 'PUT', dados);
    setOrdens(prev => prev.map(o => o.id === id ? atualizada : o));
  }, []);

  const deleteOrdem = useCallback(async (id) => {
    await req(`/ordens/${id}`, 'DELETE');
    setOrdens(prev => prev.filter(o => o.id !== id));
  }, []);

  // ── ETAPAS ─────────────────────────────────────────────────────────────────
  const addEtapa = useCallback(async (ordemId, etapaData) => {
    const nova = await req(`/ordens/${ordemId}/etapas`, 'POST', etapaData);
    setOrdens(prev => prev.map(o => {
      if (o.id !== ordemId) return o;
      const etapas = [...o.etapas, { id: nova.id, nome: nova.nome, prazo: nova.prazo, status: nova.status, funcionariosIds: [] }];
      return { ...o, etapas, progresso: calcProgresso(etapas) };
    }));
  }, []);

  const deleteEtapa = useCallback(async (ordemId, idx) => {
    const ordem = ordens.find(o => o.id === ordemId);
    const etapaId = ordem?.etapas[idx]?.id;
    if (!etapaId) return;
    await req(`/etapas/${etapaId}`, 'DELETE');
    setOrdens(prev => prev.map(o => {
      if (o.id !== ordemId) return o;
      const etapas = o.etapas.filter((_, i) => i !== idx);
      return { ...o, etapas, progresso: calcProgresso(etapas) };
    }));
  }, [ordens]);

  const iniciarEtapa = useCallback(async (ordemId, idx) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if (!ordem) return;
    // Verificação sequencial no frontend
    for (let i = 0; i < idx; i++) {
      if (ordem.etapas[i].status !== StatusEtapa.CONCLUIDA) {
        throw new Error(`Conclua a etapa "${ordem.etapas[i].nome}" antes de iniciar esta.`);
      }
    }
    const etapaId = ordem.etapas[idx]?.id;
    await req(`/etapas/${etapaId}/iniciar`, 'PATCH');
    setOrdens(prev => prev.map(o => {
      if (o.id !== ordemId) return o;
      const etapas = o.etapas.map((e, i) => i === idx ? { ...e, status: StatusEtapa.ANDAMENTO } : e);
      return { ...o, etapas, progresso: calcProgresso(etapas) };
    }));
  }, [ordens]);

  const concluirEtapa = useCallback(async (ordemId, idx) => {
    const ordem = ordens.find(o => o.id === ordemId);
    const etapaId = ordem?.etapas[idx]?.id;
    await req(`/etapas/${etapaId}/concluir`, 'PATCH');
    setOrdens(prev => prev.map(o => {
      if (o.id !== ordemId) return o;
      const etapas = o.etapas.map((e, i) => i === idx ? { ...e, status: StatusEtapa.CONCLUIDA } : e);
      return { ...o, etapas, progresso: calcProgresso(etapas) };
    }));
  }, [ordens]);

  const addFuncEtapa = useCallback(async (ordemId, etapaIdx, funcId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if (ordem?.etapas[etapaIdx]?.funcionariosIds.includes(funcId))
      throw new Error('Funcionário já associado.');
    const etapaId = ordem?.etapas[etapaIdx]?.id;
    await req(`/etapas/${etapaId}/funcionarios`, 'POST', { funcId });
    setOrdens(prev => prev.map(o => {
      if (o.id !== ordemId) return o;
      const etapas = o.etapas.map((e, i) =>
        i === etapaIdx ? { ...e, funcionariosIds: [...e.funcionariosIds, funcId] } : e);
      return { ...o, etapas };
    }));
  }, [ordens]);

  const removeFuncEtapa = useCallback(async (ordemId, etapaIdx, funcId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    const etapaId = ordem?.etapas[etapaIdx]?.id;
    await req(`/etapas/${etapaId}/funcionarios/${funcId}`, 'DELETE');
    setOrdens(prev => prev.map(o => {
      if (o.id !== ordemId) return o;
      const etapas = o.etapas.map((e, i) =>
        i === etapaIdx ? { ...e, funcionariosIds: e.funcionariosIds.filter(id => id !== funcId) } : e);
      return { ...o, etapas };
    }));
  }, [ordens]);

  // ── TESTES ─────────────────────────────────────────────────────────────────
  const addTeste = useCallback(async (ordemId, testeData) => {
    const novo = await req(`/ordens/${ordemId}/testes`, 'POST', testeData);
    setOrdens(prev => prev.map(o =>
      o.id === ordemId ? { ...o, testes: [...o.testes, { id: novo.id, tipo: novo.tipo, resultado: novo.resultado }] } : o
    ));
  }, []);

  const deleteTeste = useCallback(async (ordemId, idx) => {
    const ordem = ordens.find(o => o.id === ordemId);
    const testeId = ordem?.testes[idx]?.id;
    await req(`/testes/${testeId}`, 'DELETE');
    setOrdens(prev => prev.map(o =>
      o.id === ordemId ? { ...o, testes: o.testes.filter((_, i) => i !== idx) } : o
    ));
  }, [ordens]);

  // ── PEÇAS ↔ ORDEM ──────────────────────────────────────────────────────────
  const addPecaOrdem = useCallback(async (ordemId, pecaId) => {
    const ordem = ordens.find(o => o.id === ordemId);
    if ((ordem?.pecasIds || []).includes(pecaId)) throw new Error('Peça já associada a esta ordem.');
    await req(`/ordens/${ordemId}/pecas/${pecaId}`, 'POST');
    setOrdens(prev => prev.map(o =>
      o.id === ordemId ? { ...o, pecasIds: [...(o.pecasIds || []), pecaId] } : o
    ));
  }, [ordens]);

  const removePecaOrdem = useCallback(async (ordemId, pecaId) => {
    await req(`/ordens/${ordemId}/pecas/${pecaId}`, 'DELETE');
    setOrdens(prev => prev.map(o =>
      o.id === ordemId ? { ...o, pecasIds: (o.pecasIds || []).filter(id => id !== pecaId) } : o
    ));
  }, []);

  // ── PEÇAS ──────────────────────────────────────────────────────────────────
  const addPeca = useCallback(async (dados) => {
    const nova = await req('/pecas', 'POST', dados);
    setPecas(prev => [...prev, nova]);
  }, []);

  const updatePeca = useCallback(async (id, dados) => {
    const atualizada = await req(`/pecas/${id}`, 'PUT', dados);
    setPecas(prev => prev.map(p => p.id === id ? atualizada : p));
  }, []);

  const deletePeca = useCallback(async (id) => {
    await req(`/pecas/${id}`, 'DELETE');
    setPecas(prev => prev.filter(p => p.id !== id));
    setOrdens(prev => prev.map(o => ({ ...o, pecasIds: (o.pecasIds || []).filter(pid => pid !== id) })));
  }, []);

  // ── FUNCIONÁRIOS ───────────────────────────────────────────────────────────
  const addFuncionario = useCallback(async (dados) => {
    const novo = await req('/funcionarios', 'POST', { ...dados, senhaHash: dados.senha || '123456' });
    setFuncionarios(prev => [...prev, { ...novo, telefone: novo.telefone || '', endereco: novo.endereco || '' }]);
    return novo.id;
  }, []);

  const updateFuncionario = useCallback(async (id, dados) => {
    const payload = { ...dados };
    if (dados.senha) payload.senhaHash = dados.senha;
    const atualizado = await req(`/funcionarios/${id}`, 'PUT', payload);
    setFuncionarios(prev => prev.map(f =>
      f.id === id ? { ...f, ...atualizado, telefone: atualizado.telefone || '', endereco: atualizado.endereco || '' } : f
    ));
  }, []);

  const deleteFuncionario = useCallback(async (id) => {
    await req(`/funcionarios/${id}`, 'DELETE');
    setFuncionarios(prev => prev.filter(f => f.id !== id));
  }, []);

  // ── INSPEÇÕES ──────────────────────────────────────────────────────────────
  const addInspecao = useCallback(async (dados) => {
    const nova = await req('/inspecoes', 'POST', dados);
    setInspecoes(prev => [...prev, nova]);
    return nova.id;
  }, []);

  const updateInspecao = useCallback(async (id, dados) => {
    const atualizada = await req(`/inspecoes/${id}`, 'PUT', dados);
    setInspecoes(prev => prev.map(i => i.id === id ? { ...i, ...atualizada } : i));
  }, []);

  const deleteInspecao = useCallback(async (id) => {
    await req(`/inspecoes/${id}`, 'DELETE');
    setInspecoes(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── RELATÓRIO (download .txt, sem chamar API) ──────────────────────────────
  const gerarRelatorio = useCallback((ordemId) => {
    const o = ordens.find(x => x.id === ordemId);
    if (!o) return;
    const buscarPeca = id => pecas.find(p => p.id === id);
    const buscarFunc = id => funcionarios.find(f => f.id === id);
    const sep = '═'.repeat(56);
    const lin = [''];
    const L = s => lin.push(s);
    L(sep); L('  RELATÓRIO FINAL DE AERONAVE — AEROCODE'); L(sep); L('');
    L('── AERONAVE ─────────────────────────────────────────');
    L(`  Código     : ${o.codigo || o.id}`);
    L(`  Modelo     : ${o.modelo}`);
    L(`  Tipo       : ${o.tipo === 'MILITAR' ? 'Militar' : 'Comercial'}`);
    L(`  Capacidade : ${o.capacidade ?? '—'} passageiros`);
    L(`  Alcance    : ${o.alcance ?? '—'} km`);
    L(`  Cliente    : ${o.cliente}`);
    L(`  Início     : ${o.inicio}`);
    L(`  Entrega    : ${o.entrega}`);
    L(`  Prioridade : ${o.prioridade}`);
    L(`  Progresso  : ${o.progresso}%`);
    L(''); L('── ETAPAS DE PRODUÇÃO ───────────────────────────────');
    if (o.etapas.length === 0) { L('  (nenhuma etapa cadastrada)'); }
    else o.etapas.forEach((e, i) => {
      const funcs = (e.funcionariosIds || []).map(id => buscarFunc(id)?.nome ?? `#${id}`).join(', ');
      L(`  ${i+1}. ${e.nome}`);
      L(`     Prazo: ${e.prazo}  |  Status: ${e.status}`);
      if (funcs) L(`     Responsáveis: ${funcs}`);
    });
    L(''); L('── PEÇAS UTILIZADAS ─────────────────────────────────');
    const pecasOrdem = (o.pecasIds || []).map(buscarPeca).filter(Boolean);
    if (pecasOrdem.length === 0) { L('  (nenhuma peça associada)'); }
    else pecasOrdem.forEach(p => L(`  • [${p.id}] ${p.nome} — ${p.tipo} — ${p.fornecedor} — ${p.status}`));
    L(''); L('── TESTES REALIZADOS ────────────────────────────────');
    if (o.testes.length === 0) { L('  (nenhum teste registrado)'); }
    else o.testes.forEach(t => L(`  • ${t.tipo.padEnd(14)}: ${t.resultado ?? 'PENDENTE'}`));
    L(''); L('── RESUMO DE QUALIDADE ──────────────────────────────');
    const aprov = o.testes.filter(t => t.resultado === ResultadoTeste.APROVADO).length;
    const reprov = o.testes.filter(t => t.resultado === ResultadoTeste.REPROVADO).length;
    L(`  Aprovados  : ${aprov}`);
    L(`  Reprovados : ${reprov}`);
    L(`  Pendentes  : ${o.testes.filter(t => !t.resultado).length}`);
    L(''); L(`  Gerado em  : ${new Date().toLocaleString('pt-BR')}`); L(sep);
    const blob = new Blob([lin.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `relatorio_${o.id}_${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  }, [ordens, pecas, funcionarios]);

  const value = {
    ordens, pecas, funcionarios, inspecoes, loading, apiError,
    addOrdem, updateOrdem, deleteOrdem,
    addEtapa, deleteEtapa, iniciarEtapa, concluirEtapa, addFuncEtapa, removeFuncEtapa,
    addTeste, deleteTeste,
    addPecaOrdem, removePecaOrdem,
    addPeca, updatePeca, deletePeca,
    addFuncionario, updateFuncionario, deleteFuncionario,
    addInspecao, updateInspecao, deleteInspecao,
    gerarRelatorio,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp fora do AppProvider');
  return ctx;
}
