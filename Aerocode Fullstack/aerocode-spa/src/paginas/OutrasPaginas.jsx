import { useState } from 'react';
import { useApp } from '../contexto/AppContext';
import {
  itensChecklist, producaoMensal, dadosQualidade,
  ResultadoTeste, TipoPeca, StatusPeca, NivelPermissao, TipoTeste,
  labelResultadoTeste, labelTipoPeca, labelStatusPeca, labelNivelPermissao,
  labelTipoTeste,
} from '../dados/dadosMock';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';

// ─── Helpers compartilhados ───────────────────────────────────────────────────
function Modal({ titulo, icone, fechar, children, rodape }) {
  return (
    <div className="fundo-modal" onClick={fechar}>
      <div className="modal" style={{ maxWidth:520 }} onClick={e => e.stopPropagation()}>
        <div className="modal-cabecalho">
          <span className="modal-titulo"><i className={`fa-solid ${icone}`}></i> {titulo}</span>
          <button className="btn btn-ghost btn-sm" onClick={fechar}><i className="fa-solid fa-xmark"></i></button>
        </div>
        <div className="modal-corpo">{children}</div>
        {rodape && <div className="modal-rodape">{rodape}</div>}
      </div>
    </div>
  );
}
function ModalConfirmar({ mensagem, onConfirmar, fechar }) {
  return (
    <Modal titulo="Confirmar exclusão" icone="fa-trash" fechar={fechar}
      rodape={<>
        <button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
        <button className="btn btn-perigo" onClick={onConfirmar}><i className="fa-solid fa-trash"></i> Excluir</button>
      </>}>
      <p style={{ margin:0, color:'#374151' }}>{mensagem}</p>
    </Modal>
  );
}
function Toast({ msg, fechar }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, background:'#ef4444', color:'#fff',
      padding:'12px 20px', borderRadius:10, boxShadow:'0 4px 16px rgba(0,0,0,.25)', zIndex:9999,
      display:'flex', alignItems:'center', gap:10, maxWidth:380, fontSize:13 }}>
      <i className="fa-solid fa-circle-exclamation"></i>
      <span style={{ flex:1 }}>{msg}</span>
      <button onClick={fechar} style={{ background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:16 }}>×</button>
    </div>
  );
}
function BadgeResultado({ resultado }) {
  if (!resultado) return <span className="badge badge-aviso">Pendente</span>;
  const m = { APROVADO:'badge-sucesso', REPROVADO:'badge-perigo' };
  return <span className={`badge ${m[resultado]||'badge-neutro'}`}>{labelResultadoTeste[resultado]||resultado}</span>;
}

// ─── QUALIDADE ────────────────────────────────────────────────────────────────
function ModalInspecao({ inspecao, ordens, funcionarios, onSalvar, fechar }) {
  const ed = !!inspecao;
  const [f, setF] = useState({
    ordemId:   inspecao?.ordemId   ?? ordens[0]?.id    ?? '',
    aeronave:  inspecao?.aeronave  ?? '',
    inspetor:  inspecao?.inspetor  ?? '',
    tipo:      inspecao?.tipo      ?? TipoTeste.ELETRICO,
    fase:      inspecao?.fase      ?? '',
    data:      inspecao?.data      ?? new Date().toLocaleDateString('pt-BR'),
    resultado: inspecao?.resultado ?? null,
  });
  const U = (k, v) => setF(p => ({ ...p, [k]: v }));

  function salvar() {
    if (!f.ordemId) { alert('Selecione uma ordem.'); return; }
    const ord = ordens.find(o => o.id === f.ordemId);
    const aeronave = f.aeronave.trim() || (ord ? `${ord.modelo} (${ord.cliente})` : f.ordemId);
    const inspetor = f.inspetor.trim() || 'Não informado';
    onSalvar({ ...f, aeronave, inspetor });
  }

  return (
    <Modal titulo={ed ? 'Editar Inspeção' : 'Nova Inspeção de Qualidade'}
      icone={ed ? 'fa-pen-to-square' : 'fa-plus-circle'} fechar={fechar}
      rodape={<>
        <button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
        <button className="btn btn-primario" onClick={salvar}>
          <i className={`fa-solid ${ed?'fa-floppy-disk':'fa-check'}`}></i>{ed?' Salvar':' Criar Inspeção'}
        </button>
      </>}>
      <div className="grupo-campo">
        <label className="rotulo">Ordem de Produção *</label>
        <select className="campo-select" value={f.ordemId} onChange={e => U('ordemId', e.target.value)}>
          {ordens.map(o => <option key={o.id} value={o.id}>{o.id} — {o.modelo}</option>)}
        </select>
      </div>
      <div className="grupo-campo">
        <label className="rotulo">Inspetor Responsável</label>
        <select className="campo-select" value={f.inspetor} onChange={e => U('inspetor', e.target.value)}>
          <option value="">— Selecionar —</option>
          {funcionarios
            .filter(fn => fn.nivelPermissao === NivelPermissao.ENGENHEIRO || fn.nivelPermissao === NivelPermissao.ADMINISTRADOR)
            .map(fn => <option key={fn.id} value={`Eng. ${fn.nome}`}>{fn.nome}</option>)}
        </select>
      </div>
      <div className="grade-campos-2">
        <div className="grupo-campo">
          <label className="rotulo">Tipo de Teste</label>
          <select className="campo-select" value={f.tipo} onChange={e => U('tipo', e.target.value)}>
            <option value={TipoTeste.ELETRICO}>Elétrico</option>
            <option value={TipoTeste.HIDRAULICO}>Hidráulico</option>
            <option value={TipoTeste.AERODINAMICO}>Aerodinâmico</option>
          </select>
        </div>
        <div className="grupo-campo">
          <label className="rotulo">Fase</label>
          <input className="campo-input" value={f.fase} placeholder="ex: Estrutura" onChange={e => U('fase', e.target.value)} />
        </div>
      </div>
      <div className="grade-campos-2">
        <div className="grupo-campo">
          <label className="rotulo">Data</label>
          <input className="campo-input" value={f.data} placeholder="dd/mm/aaaa" onChange={e => U('data', e.target.value)} />
        </div>
        <div className="grupo-campo">
          <label className="rotulo">Resultado</label>
          <select className="campo-select" value={f.resultado ?? ''} onChange={e => U('resultado', e.target.value || null)}>
            <option value="">Pendente</option>
            <option value={ResultadoTeste.APROVADO}>Aprovado</option>
            <option value={ResultadoTeste.REPROVADO}>Reprovado</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

export function PaginaQualidade() {
  const { inspecoes, ordens, funcionarios, addInspecao, updateInspecao, deleteInspecao } = useApp();
  const [filtro, setFiltro]           = useState('Todas');
  const [busca, setBusca]             = useState('');
  const [ativa, setAtiva]             = useState(null);
  const [marcacoes, setMarcacoes]     = useState(itensChecklist.map((_, i) => i < 5));
  const [modalAdd, setModalAdd]       = useState(false);
  const [modalEdit, setModalEdit]     = useState(null);
  const [confirmarDel, setConfirmarDel] = useState(null);
  const [err, setErr]                 = useState('');

  const qtdAprov  = inspecoes.filter(i => i.resultado === ResultadoTeste.APROVADO).length;
  const qtdPend   = inspecoes.filter(i => !i.resultado).length;
  const qtdReprov = inspecoes.filter(i => i.resultado === ResultadoTeste.REPROVADO).length;

  const filtradas = inspecoes.filter(ins => {
    const bB = ins.id?.includes(busca) || ins.aeronave?.toLowerCase().includes(busca.toLowerCase()) || ins.ordemId?.includes(busca);
    const bF = filtro === 'Todas' ||
      (filtro === 'Aprovado'  && ins.resultado === ResultadoTeste.APROVADO) ||
      (filtro === 'Reprovado' && ins.resultado === ResultadoTeste.REPROVADO) ||
      (filtro === 'Pendente'  && !ins.resultado);
    return bB && bF;
  });

  async function salvarInspecao(dados) {
    setErr('');
    try {
      if (modalEdit) { await updateInspecao(modalEdit.id, dados); setModalEdit(null); }
      else { await addInspecao(dados); setModalAdd(false); }
    } catch(e) { setErr(e.message); }
  }

  function aprovar(ins) { updateInspecao(ins.id, { resultado: ResultadoTeste.APROVADO }).catch(e=>setErr(e.message)); setAtiva(prev => prev ? { ...prev, resultado: ResultadoTeste.APROVADO } : null); }
  function reprovar(ins) { updateInspecao(ins.id, { resultado: ResultadoTeste.REPROVADO }).catch(e=>setErr(e.message)); setAtiva(prev => prev ? { ...prev, resultado: ResultadoTeste.REPROVADO } : null); }

  // Sync ativa com dados mais recentes
  const ativaAtual = ativa ? inspecoes.find(i => i.id === ativa.id) || ativa : null;

  return (
    <div className="fade-entrada">
      {err && <Toast msg={err} fechar={() => setErr('')} />}

      <div className="cabecalho-pagina">
        <div className="titulo-area">
          <h2 className="titulo-principal">Controle de Qualidade</h2>
          <p className="subtitulo-pagina"><i className="fa-solid fa-shield-halved"></i> Inspeções técnicas e aprovações normativas</p>
        </div>
        <button className="btn btn-primario" onClick={() => setModalAdd(true)}>
          <i className="fa-solid fa-plus"></i> Nova Inspeção
        </button>
      </div>

      <div className="grade-kpi-3col">
        {[
          { rotulo:'Aprovadas', valor:qtdAprov,  classe:'badge-sucesso', icone:'fa-circle-check' },
          { rotulo:'Pendentes', valor:qtdPend,   classe:'badge-aviso',   icone:'fa-clock' },
          { rotulo:'Reprovadas',valor:qtdReprov, classe:'badge-perigo',  icone:'fa-circle-xmark' },
        ].map(({ rotulo, valor, classe, icone }) => (
          <div key={rotulo} className="cartao cartao-kpi-qualidade">
            <div className="kqi-icone"><i className={`fa-solid ${icone}`}></i></div>
            <div><div className="kqi-rotulo">{rotulo}</div><span className={`badge ${classe} kqi-valor`}>{valor}</span></div>
          </div>
        ))}
      </div>

      <div className="barra-ferramentas">
        <div className="barra-busca">
          <i className="fa-solid fa-magnifying-glass barra-busca-icone"></i>
          <input className="barra-busca-input" placeholder="Buscar inspeção, ordem ou aeronave..."
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="abas">
          {['Todas','Aprovado','Pendente','Reprovado'].map(f => (
            <button key={f} className={`aba${filtro===f?' ativa':''}`} onClick={() => setFiltro(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grade-qualidade-layout">
        <div className="cartao">
          <div className="container-tabela">
            <table>
              <thead>
                <tr><th>ID</th><th>Ordem</th><th>Aeronave</th><th>Inspetor</th><th>Tipo</th><th>Data</th><th>Resultado</th><th>Ações</th></tr>
              </thead>
              <tbody>
                {filtradas.map(ins => (
                  <tr key={ins.id} className="linha-clicavel" onClick={() => setAtiva(ins)}>
                    <td><strong className="texto-primario">{ins.id}</strong></td>
                    <td>{ins.ordemId}</td>
                    <td>{ins.aeronave}</td>
                    <td className="texto-secundario">{ins.inspetor}</td>
                    <td className="texto-sm">{labelTipoTeste[ins.tipo] || ins.tipo || ins.fase}</td>
                    <td className="texto-secundario texto-sm">{ins.data}</td>
                    <td><BadgeResultado resultado={ins.resultado} /></td>
                    <td>
                      <div className="grupo-acoes">
                        <button className="btn btn-secundario btn-sm tooltip-container"
                          onClick={e => { e.stopPropagation(); setAtiva(ins); }}>
                          <i className="fa-solid fa-eye"></i><span className="tooltip">Ver</span>
                        </button>
                        <button className="btn btn-secundario btn-sm tooltip-container"
                          onClick={e => { e.stopPropagation(); setModalEdit(ins); }}>
                          <i className="fa-solid fa-pen-to-square"></i><span className="tooltip">Editar</span>
                        </button>
                        <button className="btn btn-secundario btn-sm texto-perigo tooltip-container"
                          onClick={e => { e.stopPropagation(); setConfirmarDel(ins.id); }}>
                          <i className="fa-solid fa-trash"></i><span className="tooltip">Excluir</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtradas.length === 0 && (
                  <tr><td colSpan={8} className="celula-vazia">Nenhuma inspeção encontrada.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {ativaAtual && (
          <div className="cartao painel-checklist deslizar-entrada">
            <div className="cartao-cabecalho">
              <span className="cartao-titulo"><i className="fa-solid fa-list-check"></i> {ativaAtual.id}</span>
              <button className="btn btn-ghost btn-sm" onClick={() => setAtiva(null)}><i className="fa-solid fa-xmark"></i></button>
            </div>
            <div className="cartao-corpo">
              <div className="info-inspecao-header">
                <strong>{ativaAtual.aeronave}</strong> · {ativaAtual.fase || labelTipoTeste[ativaAtual.tipo]}
                <br />
                <span className="texto-secundario texto-sm">Inspetor: {ativaAtual.inspetor}</span>
              </div>
              <div className="secao-checklist">
                <div className="checklist-titulo">
                  <i className="fa-solid fa-clipboard-check"></i> Checklist Normativo
                  <span className="checklist-contador">{marcacoes.filter(Boolean).length}/{marcacoes.length}</span>
                </div>
                {itensChecklist.map((item, i) => (
                  <div key={i} className="item-checklist" onClick={() => setMarcacoes(prev => prev.map((v,j)=>j===i?!v:v))}>
                    <div className={`caixa-check${marcacoes[i]?' marcado':''}`}>
                      {marcacoes[i] && <i className="fa-solid fa-check"></i>}
                    </div>
                    <span className={marcacoes[i]?'item-check-marcado':'item-check-pendente'}>{item}</span>
                  </div>
                ))}
              </div>
              <div className="secao-assinatura">
                <div className="assinatura-titulo"><i className="fa-solid fa-signature"></i> Resultado</div>
                <div style={{ marginBottom:12 }}>
                  <BadgeResultado resultado={ativaAtual.resultado} />
                </div>
                <div className="grade-campos-2">
                  <button className="btn btn-sucesso btn-sm" onClick={() => aprovar(ativaAtual)}>
                    <i className="fa-solid fa-check"></i> Aprovar
                  </button>
                  <button className="btn btn-perigo btn-sm" onClick={() => reprovar(ativaAtual)}>
                    <i className="fa-solid fa-xmark"></i> Reprovar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {modalAdd && <ModalInspecao ordens={ordens} funcionarios={funcionarios} onSalvar={salvarInspecao} fechar={() => setModalAdd(false)} />}
      {modalEdit && <ModalInspecao inspecao={modalEdit} ordens={ordens} funcionarios={funcionarios} onSalvar={salvarInspecao} fechar={() => setModalEdit(null)} />}
      {confirmarDel && (
        <ModalConfirmar mensagem={`Excluir a inspeção ${confirmarDel}?`}
          onConfirmar={() => { deleteInspecao(confirmarDel).catch(e=>setErr(e.message)).finally(()=>{ setConfirmarDel(null); if (ativa?.id === confirmarDel) setAtiva(null); }); }}
          fechar={() => setConfirmarDel(null)} />
      )}
    </div>
  );
}

// ─── COMPONENTES/PEÇAS ────────────────────────────────────────────────────────
function ModalPeca({ peca, onSalvar, fechar }) {
  const ed = !!peca;
  const [f, setF] = useState({
    id:         peca?.id         ?? '',
    nome:       peca?.nome       ?? '',
    tipo:       peca?.tipo       ?? TipoPeca.NACIONAL,
    fornecedor: peca?.fornecedor ?? '',
    status:     peca?.status     ?? StatusPeca.EM_PRODUCAO,
    quantidade: peca?.quantidade ?? 0,
    disponivel: peca?.disponivel ?? 0,
  });
  const U = (k, v) => setF(p => ({ ...p, [k]: v }));
  function salvar() {
    if (!f.nome.trim())       { alert('Informe o nome da peça.');  return; }
    if (!f.fornecedor.trim()) { alert('Informe o fornecedor.');    return; }
    if (!ed && !f.id.trim())  { alert('Informe o ID da peça.');    return; }
    onSalvar({ ...f, quantidade: Number(f.quantidade)||0, disponivel: Number(f.disponivel)||0 });
  }
  return (
    <Modal titulo={ed?'Editar Peça':'Nova Peça / Componente'} icone={ed?'fa-pen-to-square':'fa-plus-circle'} fechar={fechar}
      rodape={<>
        <button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
        <button className="btn btn-primario" onClick={salvar}>
          <i className={`fa-solid ${ed?'fa-floppy-disk':'fa-check'}`}></i>{ed?' Salvar':' Cadastrar'}
        </button>
      </>}>
      <div className="grade-campos-2">
        <div className="grupo-campo"><label className="rotulo">ID *</label>
          <input className="campo-input" value={f.id} placeholder="ex: CMP-011" onChange={e=>U('id',e.target.value)} disabled={ed}/></div>
        <div className="grupo-campo"><label className="rotulo">Tipo</label>
          <select className="campo-select" value={f.tipo} onChange={e=>U('tipo',e.target.value)}>
            <option value={TipoPeca.NACIONAL}>Nacional</option>
            <option value={TipoPeca.IMPORTADA}>Importada</option>
          </select></div>
      </div>
      <div className="grupo-campo"><label className="rotulo">Nome da Peça *</label>
        <input className="campo-input" value={f.nome} placeholder="ex: Motor CFM56-5B" onChange={e=>U('nome',e.target.value)}/></div>
      <div className="grupo-campo"><label className="rotulo">Fornecedor *</label>
        <input className="campo-input" value={f.fornecedor} placeholder="ex: CFM International" onChange={e=>U('fornecedor',e.target.value)}/></div>
      <div className="grupo-campo"><label className="rotulo">Status</label>
        <select className="campo-select" value={f.status} onChange={e=>U('status',e.target.value)}>
          <option value={StatusPeca.EM_PRODUCAO}>Em Produção</option>
          <option value={StatusPeca.EM_TRANSPORTE}>Em Transporte</option>
          <option value={StatusPeca.PRONTA}>Pronta</option>
        </select></div>
      <div className="grade-campos-2">
        <div className="grupo-campo"><label className="rotulo">Quantidade Total</label>
          <input className="campo-input" type="number" value={f.quantidade} onChange={e=>U('quantidade',e.target.value)}/></div>
        <div className="grupo-campo"><label className="rotulo">Disponível</label>
          <input className="campo-input" type="number" value={f.disponivel} onChange={e=>U('disponivel',e.target.value)}/></div>
      </div>
    </Modal>
  );
}

export function PaginaComponentes() {
  const { pecas, addPeca, updatePeca, deletePeca } = useApp();
  const [busca, setBusca]             = useState('');
  const [filtro, setFiltro]           = useState('Todos');
  const [modalAdd, setModalAdd]       = useState(false);
  const [modalEdit, setModalEdit]     = useState(null);
  const [confirmarDel, setConfirmarDel] = useState(null);
  const [err, setErr]                 = useState('');

  const mapaStatus = { PRONTA:'badge-sucesso', EM_TRANSPORTE:'badge-aviso', EM_PRODUCAO:'badge-perigo' };
  const tipos = ['Todos', ...Object.values(TipoPeca)];
  const filtradas = pecas.filter(p => {
    const bB = p.nome.toLowerCase().includes(busca.toLowerCase()) || p.fornecedor.toLowerCase().includes(busca.toLowerCase());
    const bF = filtro === 'Todos' || p.tipo === filtro;
    return bB && bF;
  });

  const qtdPronta   = pecas.filter(p => p.status === StatusPeca.PRONTA).length;
  const qtdTransp   = pecas.filter(p => p.status === StatusPeca.EM_TRANSPORTE).length;
  const qtdEmProd   = pecas.filter(p => p.status === StatusPeca.EM_PRODUCAO).length;

  async function salvarPeca(dados) {
    setErr('');
    try {
      if (modalEdit) { await updatePeca(modalEdit.id, dados); setModalEdit(null); }
      else { await addPeca(dados); setModalAdd(false); }
    } catch(e) { setErr(e.message); }
  }

  function atualizarStatus(id, novoStatus) {
    updatePeca(id, { status: novoStatus }).catch(e => setErr(e.message));
  }

  return (
    <div className="fade-entrada">
      {err && <Toast msg={err} fechar={() => setErr('')} />}

      <div className="cabecalho-pagina">
        <div className="titulo-area">
          <h2 className="titulo-principal">Peças / Componentes</h2>
          <p className="subtitulo-pagina"><i className="fa-solid fa-gears"></i> Inventário e rastreabilidade</p>
        </div>
        <button className="btn btn-primario" onClick={() => setModalAdd(true)}>
          <i className="fa-solid fa-plus"></i> Nova Peça
        </button>
      </div>

      <div className="grade-kpi-3col">
        {[
          { rotulo:'Prontas',       valor:qtdPronta, icone:'fa-circle-check' },
          { rotulo:'Em Transporte', valor:qtdTransp, icone:'fa-truck' },
          { rotulo:'Em Produção',   valor:qtdEmProd, icone:'fa-industry' },
        ].map(({ rotulo, valor, icone }) => (
          <div key={rotulo} className="cartao kpi-comp-card">
            <div className="kqi-icone"><i className={`fa-solid ${icone}`}></i></div>
            <div><div className="kqi-rotulo">{rotulo}</div><div className="cartao-info-valor">{valor}</div></div>
          </div>
        ))}
      </div>

      <div className="barra-ferramentas">
        <div className="barra-busca">
          <i className="fa-solid fa-magnifying-glass barra-busca-icone"></i>
          <input className="barra-busca-input" placeholder="Buscar peça ou fornecedor..."
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
        <div className="abas">
          {tipos.map(t => (
            <button key={t} className={`aba${filtro===t?' ativa':''}`} onClick={() => setFiltro(t)}>
              {t === 'Todos' ? 'Todos' : labelTipoPeca[t] || t}
            </button>
          ))}
        </div>
      </div>

      <div className="cartao">
        <div className="container-tabela">
          <table>
            <thead>
              <tr><th>ID</th><th>Nome da Peça</th><th>Tipo</th><th>Fornecedor</th><th>Status</th><th>Qtd</th><th>Disp.</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtradas.map(p => (
                <tr key={p.id}>
                  <td><strong className="texto-primario texto-sm">{p.id}</strong></td>
                  <td><span className="texto-negrito">{p.nome}</span></td>
                  <td><span className="badge badge-neutro texto-xs">{labelTipoPeca[p.tipo]||p.tipo}</span></td>
                  <td className="texto-secundario texto-sm">{p.fornecedor}</td>
                  <td>
                    <select
                      className={`badge ${mapaStatus[p.status]||'badge-neutro'}`}
                      style={{ border:'none', cursor:'pointer', background:'transparent', fontWeight:600, fontSize:11 }}
                      value={p.status}
                      onChange={e => atualizarStatus(p.id, e.target.value)}
                      onClick={e => e.stopPropagation()}>
                      <option value={StatusPeca.EM_PRODUCAO}>Em Produção</option>
                      <option value={StatusPeca.EM_TRANSPORTE}>Em Transporte</option>
                      <option value={StatusPeca.PRONTA}>Pronta</option>
                    </select>
                  </td>
                  <td className="texto-secundario texto-sm">{p.quantidade ?? '—'}</td>
                  <td className="texto-secundario texto-sm">{p.disponivel ?? '—'}</td>
                  <td>
                    <div className="grupo-acoes">
                      <button className="btn btn-secundario btn-sm tooltip-container" onClick={() => setModalEdit(p)}>
                        <i className="fa-solid fa-pen-to-square"></i><span className="tooltip">Editar</span>
                      </button>
                      <button className="btn btn-secundario btn-sm texto-perigo tooltip-container" onClick={() => setConfirmarDel(p.id)}>
                        <i className="fa-solid fa-trash"></i><span className="tooltip">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan={8} className="celula-vazia">Nenhuma peça encontrada.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAdd  && <ModalPeca fechar={() => setModalAdd(false)} onSalvar={salvarPeca} />}
      {modalEdit && <ModalPeca peca={modalEdit} fechar={() => setModalEdit(null)} onSalvar={salvarPeca} />}
      {confirmarDel && (
        <ModalConfirmar mensagem={`Excluir a peça "${pecas.find(p=>p.id===confirmarDel)?.nome}"?`}
          onConfirmar={() => { deletePeca(confirmarDel).catch(e=>setErr(e.message)).finally(()=>setConfirmarDel(null)); }}
          fechar={() => setConfirmarDel(null)} />
      )}
    </div>
  );
}

// ─── RELATÓRIOS ───────────────────────────────────────────────────────────────
const CORES_PIZZA = ['#1a3a6b','#3a86ff','#f59e0b','#1a8754'];
const dadosPizza = [
  { nome:'Em Produção', valor:38 }, { nome:'Planejado', valor:22 },
  { nome:'Controle Q.', valor:8  }, { nome:'Concluído', valor:32 },
];
const dadosGraficoQual2 = producaoMensal.map((m, i) => ({ ...m, taxa: dadosQualidade[i]?.taxa ?? 98 }));

export function PaginaRelatorios() {
  const { funcionarios } = useApp();
  const [periodo, setPeriodo] = useState('Mês');

  return (
    <div className="fade-entrada">
      <div className="cabecalho-pagina">
        <div className="titulo-area">
          <h2 className="titulo-principal">Relatórios e Analytics</h2>
          <p className="subtitulo-pagina"><i className="fa-solid fa-chart-line"></i> Indicadores de performance da produção</p>
        </div>
        <button className="btn btn-secundario"><i className="fa-solid fa-file-pdf"></i> Exportar PDF</button>
      </div>

      <div className="barra-ferramentas">
        <span className="rotulo-periodo"><i className="fa-solid fa-calendar-days"></i> Período:</span>
        <div className="abas">
          {['Semana','Mês','Trimestre','Ano'].map(p => (
            <button key={p} className={`aba${periodo===p?' ativa':''}`} onClick={() => setPeriodo(p)}>{p}</button>
          ))}
        </div>
      </div>

      <div className="grade-graficos">
        <div className="cartao">
          <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-chart-bar"></i> Aeronaves Concluídas vs Planejadas</span></div>
          <div className="cartao-corpo">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={producaoMensal}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #d0dce8', boxShadow:'0 4px 16px rgba(26,58,107,0.1)', padding:'8px 14px' }} />
                <Legend wrapperStyle={{ fontSize:12 }} />
                <Bar dataKey="concluidas" name="Concluídas" fill="#1a3a6b" radius={[4,4,0,0]} />
                <Bar dataKey="planejadas"  name="Planejadas"  fill="#5b9cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cartao">
          <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-chart-pie"></i> Status das Ordens Ativas</span></div>
          <div className="cartao-corpo grafico-pizza-layout">
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={dadosPizza} cx={70} cy={70} innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="valor" nameKey="nome">
                  {dadosPizza.map((_, i) => <Cell key={i} fill={CORES_PIZZA[i]} />)}
                </Pie>
                <Tooltip formatter={(v, _n, p) => [`${v}%`, p.payload.nome]}
                  contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #d0dce8', padding:'8px 14px' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="legenda-pizza">
              {dadosPizza.map((d, i) => (
                <div key={d.nome} className="legenda-pizza-item">
                  <div className="legenda-cor" style={{ background:CORES_PIZZA[i] }} />
                  <span className="legenda-nome">{d.nome}</span>
                  <span className="legenda-pct">{d.valor}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="cartao cartao-mb">
        <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-shield-halved"></i> Taxa de Qualidade Mensal (%)</span></div>
        <div className="cartao-corpo">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={dadosGraficoQual2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[96,100]} tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={36} />
              <Tooltip contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #d0dce8', padding:'8px 14px' }} />
              <Line dataKey="taxa" name="Taxa %" stroke="#1a8754" strokeWidth={2.5} dot={{ r:3, fill:'#1a8754' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cartao">
        <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-users"></i> Desempenho por Engenheiro</span></div>
        <div className="container-tabela">
          <table>
            <thead><tr><th>Engenheiro</th><th>Nível</th><th>Taxa de Qualidade</th><th>No Prazo</th></tr></thead>
            <tbody>
              {funcionarios.filter(f => f.nivelPermissao === NivelPermissao.ENGENHEIRO || f.nivelPermissao === NivelPermissao.ADMINISTRADOR)
                .map(f => (
                  <tr key={f.id}>
                    <td className="texto-negrito">{f.nome}</td>
                    <td><span className="badge badge-neutro texto-xs">{labelNivelPermissao[f.nivelPermissao]}</span></td>
                    <td><span className="texto-sucesso texto-negrito">98.{f.id}%</span></td>
                    <td><span className="texto-sucesso texto-negrito">9{f.id > 5 ? 0 : f.id}%</span></td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── USUÁRIOS / FUNCIONÁRIOS ──────────────────────────────────────────────────
function ModalFuncionario({ funcionario, onSalvar, fechar }) {
  const ed = !!funcionario;
  const [f, setF] = useState({
    nome:           funcionario?.nome           ?? '',
    usuario:        funcionario?.usuario        ?? '',
    senha:          '',
    nivelPermissao: funcionario?.nivelPermissao ?? NivelPermissao.OPERADOR,
    telefone:       funcionario?.telefone       ?? '',
    endereco:       funcionario?.endereco       ?? '',
  });
  const U = (k, v) => setF(p => ({ ...p, [k]: v }));

  function salvar() {
    if (!f.nome.trim())    { alert('Informe o nome.');    return; }
    if (!f.usuario.trim()) { alert('Informe o usuário.'); return; }
    if (!ed && !f.senha)   { alert('Informe a senha.');   return; }
    onSalvar(f);
  }

  return (
    <Modal titulo={ed?'Editar Funcionário':'Novo Funcionário'} icone={ed?'fa-pen-to-square':'fa-user-plus'} fechar={fechar}
      rodape={<>
        <button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
        <button className="btn btn-primario" onClick={salvar}>
          <i className={`fa-solid ${ed?'fa-floppy-disk':'fa-check'}`}></i>{ed?' Salvar':' Criar Funcionário'}
        </button>
      </>}>
      <div className="grupo-campo"><label className="rotulo">Nome Completo *</label>
        <input className="campo-input" value={f.nome} placeholder="ex: João da Silva" onChange={e=>U('nome',e.target.value)}/></div>
      <div className="grade-campos-2">
        <div className="grupo-campo"><label className="rotulo">Usuário (login) *</label>
          <input className="campo-input" value={f.usuario} placeholder="joao.silva" onChange={e=>U('usuario',e.target.value)} disabled={ed}/></div>
        <div className="grupo-campo"><label className="rotulo">{ed?'Nova Senha (opcional)':'Senha *'}</label>
          <input className="campo-input" type="password" value={f.senha} placeholder="••••••••" onChange={e=>U('senha',e.target.value)}/></div>
      </div>
      <div className="grupo-campo"><label className="rotulo">Nível de Permissão</label>
        <select className="campo-select" value={f.nivelPermissao} onChange={e=>U('nivelPermissao',e.target.value)}>
          <option value={NivelPermissao.ADMINISTRADOR}>Administrador</option>
          <option value={NivelPermissao.ENGENHEIRO}>Engenheiro</option>
          <option value={NivelPermissao.OPERADOR}>Operador</option>
        </select></div>
      <div className="grupo-campo"><label className="rotulo">Telefone</label>
        <input className="campo-input" value={f.telefone} placeholder="(12) 99999-0000" onChange={e=>U('telefone',e.target.value)}/></div>
      <div className="grupo-campo"><label className="rotulo">Endereço</label>
        <input className="campo-input" value={f.endereco} placeholder="Cidade, Estado" onChange={e=>U('endereco',e.target.value)}/></div>
    </Modal>
  );
}

export function PaginaUsuarios() {
  const { funcionarios, addFuncionario, updateFuncionario, deleteFuncionario } = useApp();
  const [busca, setBusca]             = useState('');
  const [modalAdd, setModalAdd]       = useState(false);
  const [modalEdit, setModalEdit]     = useState(null);
  const [confirmarDel, setConfirmarDel] = useState(null);
  const [err, setErr]                 = useState('');

  const mapaNivel = { ADMINISTRADOR:'badge-perigo', ENGENHEIRO:'badge-info', OPERADOR:'badge-neutro' };
  const filtrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(busca.toLowerCase()) ||
    f.usuario.toLowerCase().includes(busca.toLowerCase()) ||
    labelNivelPermissao[f.nivelPermissao]?.toLowerCase().includes(busca.toLowerCase())
  );

  async function salvarFuncionario(dados) {
    setErr('');
    try {
      if (modalEdit) { await updateFuncionario(modalEdit.id, dados); setModalEdit(null); }
      else { await addFuncionario(dados); setModalAdd(false); }
    } catch(e) { setErr(e.message); }
  }

  return (
    <div className="fade-entrada">
      {err && <Toast msg={err} fechar={() => setErr('')} />}

      <div className="cabecalho-pagina">
        <div className="titulo-area">
          <h2 className="titulo-principal">Funcionários</h2>
          <p className="subtitulo-pagina"><i className="fa-solid fa-users"></i> {funcionarios.length} funcionários cadastrados</p>
        </div>
        <button className="btn btn-primario" onClick={() => setModalAdd(true)}>
          <i className="fa-solid fa-user-plus"></i> Novo Funcionário
        </button>
      </div>

      <div className="barra-ferramentas">
        <div className="barra-busca">
          <i className="fa-solid fa-magnifying-glass barra-busca-icone"></i>
          <input className="barra-busca-input" placeholder="Buscar nome, usuário ou nível..."
            value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      <div className="cartao">
        <div className="container-tabela">
          <table>
            <thead>
              <tr><th>ID</th><th>Nome</th><th>Usuário</th><th>Telefone</th><th>Endereço</th><th>Nível de Permissão</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {filtrados.map(f => (
                <tr key={f.id}>
                  <td className="texto-secundario texto-sm">#{f.id}</td>
                  <td>
                    <div className="usuario-tabela-nome">
                      <div className="avatar-pequeno">{f.nome.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
                      <span className="texto-negrito">{f.nome}</span>
                    </div>
                  </td>
                  <td className="texto-secundario texto-sm">{f.usuario}</td>
                  <td className="texto-secundario texto-sm">{f.telefone}</td>
                  <td className="texto-secundario texto-sm">{f.endereco}</td>
                  <td><span className={`badge ${mapaNivel[f.nivelPermissao]||'badge-neutro'}`}>{labelNivelPermissao[f.nivelPermissao]||f.nivelPermissao}</span></td>
                  <td>
                    <div className="grupo-acoes">
                      <button className="btn btn-secundario btn-sm tooltip-container" onClick={() => setModalEdit(f)}>
                        <i className="fa-solid fa-pen-to-square"></i><span className="tooltip">Editar</span>
                      </button>
                      <button className="btn btn-secundario btn-sm texto-perigo tooltip-container" onClick={() => setConfirmarDel(f.id)}>
                        <i className="fa-solid fa-trash"></i><span className="tooltip">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr><td colSpan={7} className="celula-vazia">Nenhum funcionário encontrado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAdd  && <ModalFuncionario fechar={() => setModalAdd(false)} onSalvar={salvarFuncionario} />}
      {modalEdit && <ModalFuncionario funcionario={modalEdit} fechar={() => setModalEdit(null)} onSalvar={salvarFuncionario} />}
      {confirmarDel && (
        <ModalConfirmar mensagem={`Excluir o funcionário "${funcionarios.find(f=>f.id===confirmarDel)?.nome}"?`}
          onConfirmar={() => { deleteFuncionario(confirmarDel).catch(e=>setErr(e.message)).finally(()=>setConfirmarDel(null)); }}
          fechar={() => setConfirmarDel(null)} />
      )}
    </div>
  );
}

// ─── CONFIGURAÇÕES ────────────────────────────────────────────────────────────
export function PaginaConfiguracoes() {
  return (
    <div className="fade-entrada">
      <div className="cabecalho-pagina">
        <div className="titulo-area">
          <h2 className="titulo-principal">Configurações</h2>
          <p className="subtitulo-pagina"><i className="fa-solid fa-sliders"></i> Preferências e informações do sistema</p>
        </div>
      </div>
      <div className="grade-configuracoes">
        <div className="cartao menu-configuracoes">
          {['Geral','Notificações','Segurança','Integrações','Sobre o Sistema'].map((item, i) => (
            <div key={item} className={`item-menu-config${i===0?' ativo':''}`}>
              <i className={`fa-solid ${['fa-sliders','fa-bell','fa-lock','fa-plug','fa-circle-info'][i]}`}></i>
              {item}
            </div>
          ))}
        </div>
        <div className="conteudo-configuracoes">
          <div className="cartao cartao-mb">
            <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-sliders"></i> Configurações Gerais</span></div>
            <div className="cartao-corpo">
              <div className="grupo-campo"><label className="rotulo">Nome da Empresa</label>
                <input className="campo-input" defaultValue="Aerocode Sistemas" /></div>
              <div className="grupo-campo"><label className="rotulo">Fuso Horário</label>
                <select className="campo-select">
                  <option>America/Sao_Paulo (GMT-3)</option>
                  <option>Europe/London (GMT)</option>
                  <option>Asia/Tokyo (GMT+9)</option>
                </select></div>
              <div className="grupo-campo"><label className="rotulo">Idioma</label>
                <select className="campo-select">
                  <option>Português (Brasil)</option><option>English</option>
                </select></div>
              <button className="btn btn-primario"><i className="fa-solid fa-floppy-disk"></i> Salvar Configurações</button>
            </div>
          </div>
          <div className="cartao">
            <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-circle-info"></i> Informações do Sistema</span></div>
            <div className="cartao-corpo">
              {[['Versão','3.0.0'],['Framework','React 19 + Vite 8'],['Backend','Node.js + Express + Prisma'],['Banco de Dados','MySQL 8'],['Plataformas','Windows 10+, Ubuntu 24.04+'],['Suporte','suporte@aerocode.com']]
                .map(([chave, valor]) => (
                  <div key={chave} className="linha-info-sistema">
                    <span className="info-chave">{chave}</span>
                    <span className="info-valor">{valor}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MÉTRICAS ─────────────────────────────────────────────────────────────────
const dadosMetricas = [
  { usuarios:'1 usuário',   latencia:8,  processamento:14, resposta:22 },
  { usuarios:'5 usuários',  latencia:13, processamento:32, resposta:45 },
  { usuarios:'10 usuários', latencia:19, processamento:61, resposta:80 },
];
const estiloTT = { borderRadius:10, fontSize:12, border:'1px solid #d0dce8', boxShadow:'0 4px 16px rgba(26,58,107,0.1)', padding:'8px 14px' };
const EX = { tick:{ fontSize:12 }, axisLine:false, tickLine:false };
const EY = { tick:{ fontSize:12 }, axisLine:false, tickLine:false, width:40, unit:' ms' };
const GR = { strokeDasharray:'3 3', stroke:'#e8eef5', vertical:false };

function CartaoGrafico({ titulo, icone, cor, children }) {
  return (
    <div className="cartao">
      <div className="cartao-cabecalho">
        <span className="cartao-titulo"><i className={`fa-solid ${icone}`} style={{ color:cor, marginRight:6 }}></i>{titulo}</span>
        <span className="texto-secundario texto-sm" style={{ marginLeft:'auto' }}>Unidade: ms</span>
      </div>
      <div className="cartao-corpo">{children}</div>
    </div>
  );
}

export function PaginaMetricas() {
  return (
    <div className="fade-entrada">
      <div className="cabecalho-pagina">
        <div className="titulo-area">
          <h2 className="titulo-principal">Métricas de Qualidade</h2>
          <p className="subtitulo-pagina"><i className="fa-solid fa-stopwatch"></i> Desempenho medido para 1, 5 e 10 usuários concorrentes</p>
        </div>
      </div>

      <div className="grade-kpi-3col">
        {[
          { rotulo:'Latência (1 usuário)',       valor:'8 ms',  icone:'fa-wifi',   classe:'badge-info'    },
          { rotulo:'Processamento (1 usuário)',  valor:'14 ms', icone:'fa-server', classe:'badge-sucesso' },
          { rotulo:'Resposta total (1 usuário)', valor:'22 ms', icone:'fa-bolt',   classe:'badge-aviso'   },
        ].map(({ rotulo, valor, icone, classe }) => (
          <div key={rotulo} className="cartao cartao-kpi-qualidade">
            <div className="kqi-icone"><i className={`fa-solid ${icone}`}></i></div>
            <div><div className="kqi-rotulo">{rotulo}</div><span className={`badge ${classe} kqi-valor`}>{valor}</span></div>
          </div>
        ))}
      </div>

      <div className="cartao cartao-mb" style={{ background:'#f0f6ff', borderLeft:'4px solid #3a86ff' }}>
        <div className="cartao-corpo" style={{ fontSize:13, lineHeight:1.7, color:'#1a2a4a' }}>
          <strong><i className="fa-solid fa-circle-info" style={{ marginRight:6, color:'#3a86ff' }}></i>Como as métricas foram coletadas</strong>
          <p style={{ marginTop:8, marginBottom:0 }}>
            O script <code>testeCarga.ts</code> simula grupos de 1, 5 e 10 usuários concorrentes enviando requisições simultâneas às rotas da API REST.
          </p>
          <ul style={{ marginTop:6, marginBottom:0, paddingLeft:18 }}>
            <li><strong>Latência</strong>: estimada via cabeçalho <code>X-Request-Start</code> (timestamp de envio no cliente).</li>
            <li><strong>Tempo de processamento</strong>: medido com <code>process.hrtime.bigint()</code> no middleware Express.</li>
            <li><strong>Tempo de resposta</strong>: medido no cliente como <code>Date.now()</code> ao receber menos ao enviar.</li>
          </ul>
        </div>
      </div>

      <CartaoGrafico titulo="Latência de Rede" icone="fa-wifi" cor="#3a86ff">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dadosMetricas} margin={{ top:10, right:20, left:0, bottom:0 }}>
            <CartesianGrid {...GR} />
            <XAxis dataKey="usuarios" {...EX} />
            <YAxis {...EY} domain={[0,30]} />
            <Tooltip contentStyle={estiloTT} formatter={v=>[`${v} ms`,'Latência']} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="latencia" name="Latência (ms)" fill="#3a86ff" radius={[6,6,0,0]}>
              {dadosMetricas.map((_,i)=><Cell key={i} fill={['#90c4ff','#3a86ff','#1a4fa8'][i]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CartaoGrafico>

      <CartaoGrafico titulo="Tempo de Processamento (Servidor)" icone="fa-server" cor="#1a8754">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dadosMetricas} margin={{ top:10, right:20, left:0, bottom:0 }}>
            <CartesianGrid {...GR} />
            <XAxis dataKey="usuarios" {...EX} />
            <YAxis {...EY} domain={[0,80]} />
            <Tooltip contentStyle={estiloTT} formatter={v=>[`${v} ms`,'Processamento']} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="processamento" name="Processamento (ms)" fill="#1a8754" radius={[6,6,0,0]}>
              {dadosMetricas.map((_,i)=><Cell key={i} fill={['#7fd4a8','#1a8754','#0d4a2e'][i]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CartaoGrafico>

      <CartaoGrafico titulo="Tempo de Resposta Total (Percebido pelo Usuário)" icone="fa-bolt" cor="#f59e0b">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={dadosMetricas} margin={{ top:10, right:20, left:0, bottom:0 }}>
            <CartesianGrid {...GR} />
            <XAxis dataKey="usuarios" {...EX} />
            <YAxis {...EY} domain={[0,100]} />
            <Tooltip contentStyle={estiloTT} formatter={v=>[`${v} ms`,'Resposta']} />
            <Legend wrapperStyle={{ fontSize:12 }} />
            <Bar dataKey="resposta" name="Resposta total (ms)" fill="#f59e0b" radius={[6,6,0,0]}>
              {dadosMetricas.map((_,i)=><Cell key={i} fill={['#fde68a','#f59e0b','#b45309'][i]}/>)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CartaoGrafico>

      <div className="cartao cartao-mb">
        <div className="cartao-cabecalho">
          <span className="cartao-titulo"><i className="fa-solid fa-chart-line" style={{ marginRight:6, color:'#1a3a6b' }}></i>Comparativo das Três Métricas</span>
        </div>
        <div className="cartao-corpo">
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={dadosMetricas} margin={{ top:10, right:20, left:0, bottom:0 }}>
              <CartesianGrid {...GR} />
              <XAxis dataKey="usuarios" {...EX} />
              <YAxis {...EY} domain={[0,100]} />
              <Tooltip contentStyle={estiloTT} formatter={(v,n)=>[`${v} ms`,n]} />
              <Legend wrapperStyle={{ fontSize:12 }} />
              <Line dataKey="latencia"      name="Latência (ms)"       stroke="#3a86ff" strokeWidth={2.5} dot={{ r:4 }} />
              <Line dataKey="processamento" name="Processamento (ms)"  stroke="#1a8754" strokeWidth={2.5} dot={{ r:4 }} />
              <Line dataKey="resposta"      name="Resposta total (ms)" stroke="#f59e0b" strokeWidth={2.5} dot={{ r:4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="cartao">
        <div className="cartao-cabecalho"><span className="cartao-titulo"><i className="fa-solid fa-table"></i> Tabela de Valores (ms)</span></div>
        <div className="container-tabela">
          <table>
            <thead><tr><th>Usuários Concorrentes</th><th>Latência (ms)</th><th>Processamento (ms)</th><th>Tempo de Resposta (ms)</th></tr></thead>
            <tbody>
              {dadosMetricas.map(d=>(
                <tr key={d.usuarios}>
                  <td><strong className="texto-primario">{d.usuarios}</strong></td>
                  <td><span className="badge badge-info">{d.latencia} ms</span></td>
                  <td><span className="badge badge-sucesso">{d.processamento} ms</span></td>
                  <td><span className="badge badge-aviso">{d.resposta} ms</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
