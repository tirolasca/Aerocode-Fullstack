import { useState, useCallback } from 'react';
import { useApp } from '../contexto/AppContext';
import {
  TipoAeronave, TipoTeste, ResultadoTeste, StatusEtapa,
  labelStatusEtapa, labelStatusPeca, labelTipoTeste, labelResultadoTeste, labelTipoAeronave,
} from '../dados/dadosMock';

function BadgeStatus({ status }) {
  const m = { CONCLUIDA:'badge-sucesso', ANDAMENTO:'badge-info', PENDENTE:'badge-neutro' };
  const l = { CONCLUIDA:'Concluído', ANDAMENTO:'Em Produção', PENDENTE:'Planejado' };
  return <span className={`badge ${m[status]||'badge-neutro'}`}>{l[status]||status}</span>;
}
function BadgePrioridade({ p }) {
  const m = { 'Crítica':'badge-perigo','Alta':'badge-aviso','Normal':'badge-neutro' };
  return <span className={`badge ${m[p]||'badge-neutro'}`}>{p}</span>;
}
function BadgeFase({ status }) {
  const m = { CONCLUIDA:'badge-sucesso', ANDAMENTO:'badge-info', PENDENTE:'badge-neutro' };
  return <span className={`badge ${m[status]||'badge-neutro'}`} style={{fontSize:'10.5px',padding:'2px 8px'}}>
    {labelStatusEtapa[status]||status}</span>;
}
function BadgePeca({ status }) {
  const m = { PRONTA:'badge-sucesso', EM_TRANSPORTE:'badge-aviso', EM_PRODUCAO:'badge-perigo' };
  return <span className={`badge ${m[status]||'badge-neutro'}`} style={{fontSize:'10.5px',padding:'2px 8px'}}>
    {labelStatusPeca[status]||status}</span>;
}
function BadgeTeste({ resultado }) {
  if (!resultado) return <span className="badge badge-aviso" style={{fontSize:'10.5px',padding:'2px 8px'}}>Pendente</span>;
  const m = { APROVADO:'badge-sucesso', REPROVADO:'badge-perigo' };
  return <span className={`badge ${m[resultado]||'badge-neutro'}`} style={{fontSize:'10.5px',padding:'2px 8px'}}>
    {labelResultadoTeste[resultado]||resultado}</span>;
}
function calcStatus(o) {
  const et = o.etapas||[];
  if (et.length===0) return 'PENDENTE';
  if (et.every(e=>e.status===StatusEtapa.CONCLUIDA)) return 'CONCLUIDA';
  if (et.some(e=>e.status===StatusEtapa.ANDAMENTO)) return 'ANDAMENTO';
  return 'PENDENTE';
}
function pEtapa(s){ if(s===StatusEtapa.CONCLUIDA)return 100; if(s===StatusEtapa.ANDAMENTO)return 50; return 0; }

function Toast({ msg, fechar }) {
  return <div style={{position:'fixed',bottom:24,right:24,background:'#ef4444',color:'#fff',
    padding:'12px 20px',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,.25)',zIndex:9999,
    display:'flex',alignItems:'center',gap:10,maxWidth:380,fontSize:13}}>
    <i className="fa-solid fa-circle-exclamation"></i>
    <span style={{flex:1}}>{msg}</span>
    <button onClick={fechar} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:16}}>×</button>
  </div>;
}
function Modal({ titulo, icone, fechar, children, rodape }) {
  return <div className="fundo-modal" onClick={fechar}>
    <div className="modal" style={{maxWidth:560}} onClick={e=>e.stopPropagation()}>
      <div className="modal-cabecalho">
        <span className="modal-titulo"><i className={`fa-solid ${icone}`}></i> {titulo}</span>
        <button className="btn btn-ghost btn-sm" onClick={fechar}><i className="fa-solid fa-xmark"></i></button>
      </div>
      <div className="modal-corpo">{children}</div>
      {rodape && <div className="modal-rodape">{rodape}</div>}
    </div>
  </div>;
}
function ModalConfirmar({ mensagem, onConfirmar, fechar }) {
  return <Modal titulo="Confirmar exclusão" icone="fa-trash" fechar={fechar}
    rodape={<>
      <button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
      <button className="btn btn-perigo" onClick={onConfirmar}><i className="fa-solid fa-trash"></i> Excluir</button>
    </>}>
    <p style={{margin:0,color:'#374151'}}>{mensagem}</p>
  </Modal>;
}
function ModalOrdem({ ordem, onSalvar, fechar }) {
  const ed = !!ordem;
  const [f, setF] = useState({
    codigo:ordem?.codigo??'', modelo:ordem?.modelo??'', tipo:ordem?.tipo??TipoAeronave.COMERCIAL,
    capacidade:ordem?.capacidade??'', alcance:ordem?.alcance??'', cliente:ordem?.cliente??'',
    inicio:ordem?.inicio??'', entrega:ordem?.entrega??'', prioridade:ordem?.prioridade??'Normal',
  });
  const U = (k,v) => setF(p=>({...p,[k]:v}));
  function salvar() {
    if(!f.modelo.trim()){alert('Informe o modelo.');return;}
    if(!f.cliente.trim()){alert('Informe o cliente.');return;}
    if(!ed&&!f.codigo.trim()){alert('Informe o código.');return;}
    onSalvar({...f,capacidade:Number(f.capacidade)||0,alcance:Number(f.alcance)||0});
  }
  return <Modal titulo={ed?'Editar Ordem':'Nova Ordem de Produção'} icone={ed?'fa-pen-to-square':'fa-plus-circle'} fechar={fechar}
    rodape={<>
      <button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
      <button className="btn btn-primario" onClick={salvar}>
        <i className={`fa-solid ${ed?'fa-floppy-disk':'fa-check'}`}></i>{ed?' Salvar':' Criar Ordem'}
      </button>
    </>}>
    <div className="grade-campos-2">
      <div className="grupo-campo"><label className="rotulo">Código *</label>
        <input className="campo-input" value={f.codigo} placeholder="ex: AC-1048" onChange={e=>U('codigo',e.target.value)} disabled={ed}/></div>
      <div className="grupo-campo"><label className="rotulo">Tipo</label>
        <select className="campo-select" value={f.tipo} onChange={e=>U('tipo',e.target.value)}>
          <option value={TipoAeronave.COMERCIAL}>Comercial</option>
          <option value={TipoAeronave.MILITAR}>Militar</option>
        </select></div>
    </div>
    <div className="grupo-campo"><label className="rotulo">Modelo *</label>
      <input className="campo-input" value={f.modelo} placeholder="ex: Airbus A320" onChange={e=>U('modelo',e.target.value)}/></div>
    <div className="grupo-campo"><label className="rotulo">Cliente *</label>
      <input className="campo-input" value={f.cliente} placeholder="ex: Lufthansa AG" onChange={e=>U('cliente',e.target.value)}/></div>
    <div className="grade-campos-2">
      <div className="grupo-campo"><label className="rotulo">Capacidade (pass.)</label>
        <input className="campo-input" type="number" value={f.capacidade} placeholder="ex: 180" onChange={e=>U('capacidade',e.target.value)}/></div>
      <div className="grupo-campo"><label className="rotulo">Alcance (km)</label>
        <input className="campo-input" type="number" value={f.alcance} placeholder="ex: 6150" onChange={e=>U('alcance',e.target.value)}/></div>
    </div>
    <div className="grade-campos-2">
      <div className="grupo-campo"><label className="rotulo">Data de Início</label>
        <input className="campo-input" value={f.inicio} placeholder="dd/mm/aaaa" onChange={e=>U('inicio',e.target.value)}/></div>
      <div className="grupo-campo"><label className="rotulo">Entrega Prevista</label>
        <input className="campo-input" value={f.entrega} placeholder="dd/mm/aaaa" onChange={e=>U('entrega',e.target.value)}/></div>
    </div>
    <div className="grupo-campo"><label className="rotulo">Prioridade</label>
      <select className="campo-select" value={f.prioridade} onChange={e=>U('prioridade',e.target.value)}>
        <option>Normal</option><option>Alta</option><option>Crítica</option>
      </select></div>
  </Modal>;
}
function ModalEtapa({ onSalvar, fechar }) {
  const [nome,setNome]=useState(''); const [prazo,setPrazo]=useState('');
  function salvar(){if(!nome.trim()){alert('Informe o nome da etapa.');return;}onSalvar({nome,prazo});}
  return <Modal titulo="Adicionar Etapa" icone="fa-list-check" fechar={fechar}
    rodape={<><button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
    <button className="btn btn-primario" onClick={salvar}><i className="fa-solid fa-check"></i> Adicionar</button></>}>
    <div className="grupo-campo"><label className="rotulo">Nome da Etapa *</label>
      <input className="campo-input" value={nome} placeholder="ex: Montagem trem de pouso" onChange={e=>setNome(e.target.value)}/></div>
    <div className="grupo-campo"><label className="rotulo">Prazo</label>
      <input className="campo-input" value={prazo} placeholder="dd/mm/aaaa" onChange={e=>setPrazo(e.target.value)}/></div>
  </Modal>;
}
function ModalTeste({ onSalvar, fechar }) {
  const [tipo,setTipo]=useState(TipoTeste.ELETRICO);
  const [res,setRes]=useState(ResultadoTeste.APROVADO);
  return <Modal titulo="Registrar Teste" icone="fa-flask" fechar={fechar}
    rodape={<><button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
    <button className="btn btn-primario" onClick={()=>onSalvar({tipo,resultado:res})}><i className="fa-solid fa-check"></i> Registrar</button></>}>
    <div className="grupo-campo"><label className="rotulo">Tipo de Teste</label>
      <select className="campo-select" value={tipo} onChange={e=>setTipo(e.target.value)}>
        <option value={TipoTeste.ELETRICO}>Elétrico</option>
        <option value={TipoTeste.HIDRAULICO}>Hidráulico</option>
        <option value={TipoTeste.AERODINAMICO}>Aerodinâmico</option>
      </select></div>
    <div className="grupo-campo"><label className="rotulo">Resultado</label>
      <select className="campo-select" value={res} onChange={e=>setRes(e.target.value)}>
        <option value={ResultadoTeste.APROVADO}>Aprovado</option>
        <option value={ResultadoTeste.REPROVADO}>Reprovado</option>
      </select></div>
  </Modal>;
}
function ModalAssociarPeca({ pecasDisp, onSalvar, fechar }) {
  const [sel,setSel]=useState(pecasDisp[0]?.id||'');
  if(pecasDisp.length===0) return <Modal titulo="Associar Peça" icone="fa-gears" fechar={fechar}>
    <p style={{margin:0,color:'#6b7280'}}>Todas as peças já estão associadas a esta ordem.</p></Modal>;
  return <Modal titulo="Associar Peça" icone="fa-gears" fechar={fechar}
    rodape={<><button className="btn btn-secundario" onClick={fechar}>Cancelar</button>
    <button className="btn btn-primario" onClick={()=>sel&&onSalvar(sel)}><i className="fa-solid fa-link"></i> Associar</button></>}>
    <div className="grupo-campo"><label className="rotulo">Peça</label>
      <select className="campo-select" value={sel} onChange={e=>setSel(e.target.value)}>
        {pecasDisp.map(p=><option key={p.id} value={p.id}>[{p.id}] {p.nome}</option>)}
      </select></div>
  </Modal>;
}
function ModalFuncionarios({ funcionarios, etapa, etapaIdx, ordemId, fechar }) {
  const { addFuncEtapa, removeFuncEtapa } = useApp();
  const [err,setErr]=useState('');
  const assoc = etapa.funcionariosIds||[];
  function add(id){ setErr(''); try{addFuncEtapa(ordemId,etapaIdx,id);}catch(e){setErr(e.message);} }
  function rem(id){ removeFuncEtapa(ordemId,etapaIdx,id); }
  return <Modal titulo={`Funcionários — ${etapa.nome}`} icone="fa-users" fechar={fechar}
    rodape={<button className="btn btn-secundario" onClick={fechar}>Fechar</button>}>
    {err&&<p style={{color:'#ef4444',margin:'0 0 10px',fontSize:12}}>{err}</p>}
    <p className="rotulo" style={{marginBottom:6}}>Responsáveis:</p>
    {assoc.length===0?<p style={{color:'#6b7280',fontSize:13,marginBottom:12}}>Nenhum associado.</p>
      :assoc.map(id=>{ const f=funcionarios.find(x=>x.id===id); return(
        <div key={id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <div className="avatar-pequeno" style={{fontSize:10}}>{f?f.nome.split(' ').map(x=>x[0]).slice(0,2).join(''):'?'}</div>
          <span style={{flex:1,fontSize:13}}>{f?.nome??`#${id}`}</span>
          <button className="btn btn-perigo btn-sm" onClick={()=>rem(id)}><i className="fa-solid fa-trash"></i></button>
        </div>);})
    }
    <p className="rotulo" style={{margin:'16px 0 6px'}}>Adicionar:</p>
    {funcionarios.filter(f=>!assoc.includes(f.id)).length===0
      ?<p style={{color:'#6b7280',fontSize:13}}>Todos os funcionários já estão associados.</p>
      :funcionarios.filter(f=>!assoc.includes(f.id)).map(f=>(
        <div key={f.id} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
          <div className="avatar-pequeno" style={{fontSize:10}}>{f.nome.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
          <span style={{flex:1,fontSize:13}}>{f.nome}</span>
          <button className="btn btn-primario btn-sm" onClick={()=>add(f.id)}><i className="fa-solid fa-plus"></i></button>
        </div>))
    }
  </Modal>;
}

function DetalheOrdem({ ordemId, aoVoltar }) {
  const { ordens, pecas, funcionarios, addEtapa, deleteEtapa, iniciarEtapa, concluirEtapa,
    addTeste, deleteTeste, addPecaOrdem, removePecaOrdem, updateOrdem, deleteOrdem, gerarRelatorio } = useApp();
  const ordem = ordens.find(o=>o.id===ordemId);
  const [aba,setAba]=useState('etapas');
  const [modOrdem,setModOrdem]=useState(false);
  const [confDel,setConfDel]=useState(false);
  const [modEtapa,setModEtapa]=useState(false);
  const [modTeste,setModTeste]=useState(false);
  const [modPeca,setModPeca]=useState(false);
  const [modFuncs,setModFuncs]=useState(null);
  const [confEtapa,setConfEtapa]=useState(null);
  const [confTeste,setConfTeste]=useState(null);
  const [err,setErr]=useState('');
  const safe=useCallback((fn)=>{setErr('');Promise.resolve(fn()).catch(e=>setErr(e.message));},[]);

  if(!ordem) return null;
  const st=calcStatus(ordem);
  const pecasOrdem=(ordem.pecasIds||[]).map(id=>pecas.find(p=>p.id===id)).filter(Boolean);
  const pecasDisp=pecas.filter(p=>!(ordem.pecasIds||[]).includes(p.id));

  return <div className="deslizar-entrada">
    {err&&<Toast msg={err} fechar={()=>setErr('')}/>}
    <div className="cabecalho-pagina">
      <div className="titulo-area">
        <div className="migalhas">
          <span className="migalhas-link" onClick={aoVoltar}><i className="fa-solid fa-clipboard-list"></i> Ordens</span>
          <i className="fa-solid fa-chevron-right" style={{fontSize:'10px'}}></i>
          <span>{ordem.id}</span>
        </div>
        <h2 className="titulo-principal">{ordem.id} — {ordem.modelo}</h2>
        <p className="subtitulo-pagina">{ordem.cliente} · {labelTipoAeronave[ordem.tipo]}</p>
      </div>
      <div className="cabecalho-acoes">
        <button className="btn btn-ghost btn-sm" onClick={()=>gerarRelatorio(ordemId)}>
          <i className="fa-solid fa-file-arrow-down"></i> Relatório (.txt)
        </button>
        <button className="btn btn-secundario btn-sm" onClick={()=>setModOrdem(true)}>
          <i className="fa-solid fa-pen-to-square"></i> Editar
        </button>
        <button className="btn btn-perigo btn-sm" onClick={()=>setConfDel(true)}>
          <i className="fa-solid fa-trash"></i>
        </button>
      </div>
    </div>

    <div className="grade-info-ordem">
      {[
        ['fa-plane','Modelo',ordem.modelo],
        ['fa-tag','Tipo',labelTipoAeronave[ordem.tipo]],
        ['fa-users','Capacidade',ordem.capacidade?`${ordem.capacidade} pass.`:'—'],
        ['fa-route','Alcance',ordem.alcance?`${ordem.alcance} km`:'—'],
        ['fa-calendar-plus','Início',ordem.inicio||'—'],
        ['fa-calendar-check','Entrega',ordem.entrega||'—'],
        ['fa-flag','Prioridade',ordem.prioridade],
        ['fa-circle-info','Status',st==='CONCLUIDA'?'Concluído':st==='ANDAMENTO'?'Em Produção':'Planejado'],
      ].map(([ic,r,v])=>(
        <div key={r} className="cartao cartao-info-ordem">
          <div className="cartao-info-icone"><i className={`fa-solid ${ic}`}></i></div>
          <div><div className="cartao-info-rotulo">{r}</div><div className="cartao-info-valor">{v}</div></div>
        </div>
      ))}
    </div>

    <div className="cartao cartao-progresso-geral">
      <div className="progresso-geral-cabecalho">
        <span className="progresso-geral-rotulo"><i className="fa-solid fa-circle-half-stroke"></i> Progresso Geral</span>
        <span className="progresso-geral-valor">{ordem.progresso}%</span>
      </div>
      <div className="barra-progresso-fundo barra-progresso-lg">
        <div className="barra-progresso-fill" style={{width:`${ordem.progresso}%`}}/>
      </div>
    </div>

    <div className="abas" style={{marginBottom:16}}>
      {[['etapas','fa-list-check','Etapas'],['pecas','fa-gears','Peças'],['testes','fa-flask','Testes']].map(([k,ic,l])=>(
        <button key={k} className={`aba${aba===k?' ativa':''}`} onClick={()=>setAba(k)}>
          <i className={`fa-solid ${ic}`} style={{marginRight:5}}></i>{l}
        </button>
      ))}
    </div>

    {aba==='etapas'&&<div className="cartao">
      <div className="cartao-cabecalho">
        <span className="cartao-titulo"><i className="fa-solid fa-list-check"></i> Etapas de Produção</span>
        <button className="btn btn-primario btn-sm" onClick={()=>setModEtapa(true)}><i className="fa-solid fa-plus"></i> Adicionar</button>
      </div>
      <div className="cartao-corpo">
        {ordem.etapas.length===0&&<div className="estado-vazio">
          <div className="estado-vazio-icone"><i className="fa-solid fa-list-check"></i></div>
          <p>Nenhuma etapa. Clique em "Adicionar" para criar.</p>
        </div>}
        {ordem.etapas.map((e,i)=>(
          <div key={i} style={{padding:'10px 0',borderBottom:'1px solid #e8eef5',display:'flex',gap:12,alignItems:'flex-start'}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                <span style={{fontWeight:600,fontSize:13}}>{i+1}. {e.nome}</span>
                <BadgeFase status={e.status}/>
              </div>
              <div style={{fontSize:11,color:'#6b7280',display:'flex',gap:16,marginBottom:4}}>
                {e.prazo&&<span><i className="fa-regular fa-calendar"></i> {e.prazo}</span>}
                <span><i className="fa-solid fa-users"></i>{' '}
                  {(e.funcionariosIds||[]).length===0?'Sem responsável'
                    :(e.funcionariosIds||[]).map(id=>funcionarios.find(f=>f.id===id)?.nome??`#${id}`).join(', ')}
                </span>
              </div>
              <div className="barra-progresso-fundo barra-progresso-sm">
                <div className="barra-progresso-fill" style={{width:`${pEtapa(e.status)}%`}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              {e.status===StatusEtapa.PENDENTE&&
                <button className="btn btn-primario btn-sm" onClick={()=>safe(()=>iniciarEtapa(ordemId,i))}>
                  <i className="fa-solid fa-play"></i> Iniciar</button>}
              {e.status===StatusEtapa.ANDAMENTO&&
                <button className="btn btn-sucesso btn-sm" onClick={()=>safe(()=>concluirEtapa(ordemId,i))}>
                  <i className="fa-solid fa-check"></i> Concluir</button>}
              {e.status===StatusEtapa.CONCLUIDA&&
                <button className="btn btn-secundario btn-sm" disabled style={{opacity:.5}}>
                  <i className="fa-solid fa-check-double"></i></button>}
              <button className="btn btn-secundario btn-sm" title="Gerenciar funcionários"
                onClick={()=>setModFuncs({etapaIdx:i})}><i className="fa-solid fa-users"></i></button>
              <button className="btn btn-secundario btn-sm texto-perigo" onClick={()=>setConfEtapa(i)}>
                <i className="fa-solid fa-trash"></i></button>
            </div>
          </div>
        ))}
      </div>
    </div>}

    {aba==='pecas'&&<div className="cartao">
      <div className="cartao-cabecalho">
        <span className="cartao-titulo"><i className="fa-solid fa-gears"></i> Peças Associadas</span>
        <button className="btn btn-primario btn-sm" onClick={()=>setModPeca(true)}><i className="fa-solid fa-plus"></i> Associar</button>
      </div>
      <div className="container-tabela">
        <table>
          <thead><tr><th>ID</th><th>Nome</th><th>Tipo</th><th>Fornecedor</th><th>Status</th><th>Ação</th></tr></thead>
          <tbody>
            {pecasOrdem.length===0?<tr><td colSpan={6} className="celula-vazia">Nenhuma peça associada.</td></tr>
              :pecasOrdem.map(p=><tr key={p.id}>
                <td><strong className="texto-primario texto-sm">{p.id}</strong></td>
                <td>{p.nome}</td>
                <td><span className="badge badge-neutro texto-xs">{p.tipo}</span></td>
                <td className="texto-secundario texto-sm">{p.fornecedor}</td>
                <td><BadgePeca status={p.status}/></td>
                <td><button className="btn btn-secundario btn-sm texto-perigo" onClick={()=>removePecaOrdem(ordemId,p.id)}>
                  <i className="fa-solid fa-unlink"></i></button></td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </div>}

    {aba==='testes'&&<div className="cartao">
      <div className="cartao-cabecalho">
        <span className="cartao-titulo"><i className="fa-solid fa-flask"></i> Testes Realizados</span>
        <button className="btn btn-primario btn-sm" onClick={()=>setModTeste(true)}><i className="fa-solid fa-plus"></i> Registrar</button>
      </div>
      <div className="container-tabela">
        <table>
          <thead><tr><th>#</th><th>Tipo</th><th>Resultado</th><th>Ação</th></tr></thead>
          <tbody>
            {(ordem.testes||[]).length===0?<tr><td colSpan={4} className="celula-vazia">Nenhum teste.</td></tr>
              :(ordem.testes||[]).map((t,i)=><tr key={i}>
                <td className="texto-secundario texto-sm">{i+1}</td>
                <td>{labelTipoTeste[t.tipo]||t.tipo}</td>
                <td><BadgeTeste resultado={t.resultado}/></td>
                <td><button className="btn btn-secundario btn-sm texto-perigo" onClick={()=>setConfTeste(i)}>
                  <i className="fa-solid fa-trash"></i></button></td>
              </tr>)
            }
          </tbody>
        </table>
      </div>
    </div>}

    {modOrdem&&<ModalOrdem ordem={ordem} fechar={()=>setModOrdem(false)}
      onSalvar={async d=>{try{await updateOrdem(ordemId,d);setModOrdem(false);}catch(e){setErr(e.message);}}}/>}
    {confDel&&<ModalConfirmar mensagem={`Excluir a ordem ${ordemId} — ${ordem.modelo}?`}
      onConfirmar={()=>{deleteOrdem(ordemId).then(()=>aoVoltar()).catch(e=>setErr(e.message));}} fechar={()=>setConfDel(false)}/>}
    {modEtapa&&<ModalEtapa fechar={()=>setModEtapa(false)}
      onSalvar={d=>{safe(()=>addEtapa(ordemId,d)).then?undefined:undefined;setModEtapa(false);}}/>}
    {confEtapa!==null&&<ModalConfirmar mensagem={`Excluir a etapa "${ordem.etapas[confEtapa]?.nome}"?`}
      onConfirmar={()=>{Promise.resolve(deleteEtapa(ordemId,confEtapa)).catch(e=>setErr(e.message)).finally(()=>setConfEtapa(null));}}
      fechar={()=>setConfEtapa(null)}/>}
    {modTeste&&<ModalTeste fechar={()=>setModTeste(false)}
      onSalvar={async d=>{try{await addTeste(ordemId,d);setModTeste(false);}catch(e){setErr(e.message);}}}/>}
    {confTeste!==null&&<ModalConfirmar mensagem="Excluir este teste?"
      onConfirmar={()=>{Promise.resolve(deleteTeste(ordemId,confTeste)).catch(e=>setErr(e.message)).finally(()=>setConfTeste(null));}}
      fechar={()=>setConfTeste(null)}/>}
    {modPeca&&<ModalAssociarPeca pecasDisp={pecasDisp} fechar={()=>setModPeca(false)}
      onSalvar={async id=>{try{await addPecaOrdem(ordemId,id);setModPeca(false);}catch(e){setErr(e.message);}}}/>}
    {modFuncs&&<ModalFuncionarios funcionarios={funcionarios} etapa={ordem.etapas[modFuncs.etapaIdx]}
      etapaIdx={modFuncs.etapaIdx} ordemId={ordemId} fechar={()=>setModFuncs(null)}/>}
  </div>;
}

export default function PaginaOrdens() {
  const { ordens, addOrdem } = useApp();
  const [busca,setBusca]=useState('');
  const [filtro,setFiltro]=useState('Todos');
  const [detalhe,setDetalhe]=useState(null);
  const [modalNova,setModalNova]=useState(false);
  const [err,setErr]=useState('');

  if(detalhe) return <DetalheOrdem ordemId={detalhe} aoVoltar={()=>setDetalhe(null)}/>;

  const stL={CONCLUIDA:'Concluído',ANDAMENTO:'Em Produção',PENDENTE:'Planejado'};
  const filt=ordens.filter(o=>{
    const l=stL[calcStatus(o)]||'Planejado';
    return (filtro==='Todos'||l===filtro)&&
      (o.id.toLowerCase().includes(busca.toLowerCase())||
       o.modelo.toLowerCase().includes(busca.toLowerCase())||
       o.cliente.toLowerCase().includes(busca.toLowerCase()));
  });

  async function criar(dados){ setErr(''); try{const id=await addOrdem(dados);setDetalhe(id);setModalNova(false);}catch(e){setErr(e.message);} }

  return <div className="fade-entrada">
    {err&&<Toast msg={err} fechar={()=>setErr('')}/>}
    <div className="cabecalho-pagina">
      <div className="titulo-area">
        <h2 className="titulo-principal">Ordens de Produção</h2>
        <p className="subtitulo-pagina"><i className="fa-solid fa-database"></i> {ordens.length} ordens no sistema</p>
      </div>
      <button className="btn btn-primario" onClick={()=>setModalNova(true)}>
        <i className="fa-solid fa-plus"></i> Nova Ordem
      </button>
    </div>
    <div className="barra-ferramentas">
      <div className="barra-busca">
        <i className="fa-solid fa-magnifying-glass barra-busca-icone"></i>
        <input className="barra-busca-input" placeholder="Buscar por número, modelo ou cliente..."
          value={busca} onChange={e=>setBusca(e.target.value)}/>
      </div>
      <div className="abas">
        {['Todos','Em Produção','Planejado','Concluído'].map(f=>(
          <button key={f} className={`aba${filtro===f?' ativa':''}`} onClick={()=>setFiltro(f)}>{f}</button>
        ))}
      </div>
    </div>
    <div className="cartao">
      <div className="container-tabela">
        <table>
          <thead><tr>
            <th>Nº Ordem</th><th>Modelo</th><th>Tipo</th><th>Cliente</th>
            <th>Cap.</th><th>Alcance</th><th>Início</th><th>Entrega</th>
            <th>Progresso</th><th>Prioridade</th><th>Status</th><th>Ações</th>
          </tr></thead>
          <tbody>
            {filt.map(o=>{
              const st=calcStatus(o);
              return <tr key={o.id}>
                <td><strong className="texto-primario">{o.id}</strong></td>
                <td><span className="texto-negrito">{o.modelo}</span></td>
                <td><span className="badge badge-neutro" style={{fontSize:'10.5px'}}>{labelTipoAeronave[o.tipo]||o.tipo}</span></td>
                <td className="texto-secundario">{o.cliente}</td>
                <td className="texto-secundario texto-sm">{o.capacidade?`${o.capacidade}p`:'—'}</td>
                <td className="texto-secundario texto-sm">{o.alcance?`${o.alcance}km`:'—'}</td>
                <td className="texto-secundario texto-sm">{o.inicio}</td>
                <td className="texto-secundario texto-sm">{o.entrega}</td>
                <td className="coluna-progresso">
                  <div className="barra-progresso-container-inline">
                    <div className="barra-progresso-fundo barra-progresso-sm" style={{flex:1}}>
                      <div className="barra-progresso-fill" style={{width:`${o.progresso}%`}}/>
                    </div>
                    <span className="barra-progresso-texto">{o.progresso}%</span>
                  </div>
                </td>
                <td><BadgePrioridade p={o.prioridade}/></td>
                <td><BadgeStatus status={st}/></td>
                <td><div className="grupo-acoes">
                  <button className="btn btn-secundario btn-sm tooltip-container" onClick={()=>setDetalhe(o.id)}>
                    <i className="fa-solid fa-eye"></i><span className="tooltip">Ver detalhes</span>
                  </button>
                </div></td>
              </tr>;
            })}
            {filt.length===0&&<tr><td colSpan={12} className="celula-vazia">
              <i className="fa-solid fa-magnifying-glass"></i> Nenhuma ordem encontrada.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
    {modalNova&&<ModalOrdem fechar={()=>setModalNova(false)} onSalvar={criar}/>}
  </div>;
}
