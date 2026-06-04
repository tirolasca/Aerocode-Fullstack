import { useState } from 'react';
import './index.css';
import { AppProvider, useApp } from './contexto/AppContext';
import PaginaLogin from './paginas/PaginaLogin';
import BarraLateral from './componentes/BarraLateral';
import PainelInicial from './paginas/PainelInicial';
import PaginaOrdens from './paginas/PaginaOrdens';
import { PaginaQualidade, PaginaComponentes, PaginaRelatorios, PaginaUsuarios, PaginaConfiguracoes, PaginaMetricas } from './paginas/OutrasPaginas';

const TITULOS = {
  painel:'Painel Inicial', ordens:'Ordens de Produção', componentes:'Componentes',
  qualidade:'Controle de Qualidade', relatorios:'Relatórios', usuarios:'Usuários',
  configuracoes:'Configurações', metricas:'Métricas de Qualidade',
};

function TelaCarregando() {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'100vh', gap:16, background:'#f8fafc' }}>
      <div style={{ fontSize:40, color:'#1a3a6b' }}><i className="fa-solid fa-plane"></i></div>
      <div style={{ fontSize:18, fontWeight:700, color:'#1a3a6b' }}>AEROCODE</div>
      <div style={{ display:'flex', gap:6 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width:10, height:10, borderRadius:'50%', background:'#3a86ff',
            animation:`pulse 1.2s ease-in-out ${i*0.2}s infinite` }}/>
        ))}
      </div>
      <p style={{ color:'#6b7280', fontSize:13 }}>Conectando ao servidor...</p>
      <style>{`@keyframes pulse{0%,80%,100%{opacity:.3}40%{opacity:1}}`}</style>
    </div>
  );
}

function TelaErroApi({ erro }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      height:'100vh', gap:16, background:'#f8fafc', padding:24, textAlign:'center' }}>
      <div style={{ fontSize:48, color:'#ef4444' }}><i className="fa-solid fa-triangle-exclamation"></i></div>
      <div style={{ fontSize:18, fontWeight:700, color:'#1a3a6b' }}>Servidor não encontrado</div>
      <p style={{ color:'#6b7280', fontSize:13, maxWidth:460, lineHeight:1.7 }}>
        Não foi possível conectar ao backend. Certifique-se de que o servidor está rodando.
      </p>
      <div style={{ background:'#1a2942', color:'#7dd3fc', borderRadius:10, padding:'14px 24px',
        fontFamily:'monospace', fontSize:12, textAlign:'left', lineHeight:2 }}>
        <div>cd aerocode-backend</div>
        <div>cp .env.example .env  <span style={{color:'#94a3b8'}}># configure DATABASE_URL</span></div>
        <div>npm install</div>
        <div>npm run prisma:generate</div>
        <div>npm run prisma:migrate</div>
        <div>npm run prisma:seed</div>
        <div>npm run dev</div>
      </div>
      <p style={{ color:'#ef4444', fontSize:12, maxWidth:460 }}>Erro: {erro}</p>
      <button style={{ marginTop:8, padding:'10px 24px', background:'#3a86ff', color:'#fff',
        border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}
        onClick={() => window.location.reload()}>
        <i className="fa-solid fa-rotate-right"></i> Tentar novamente
      </button>
    </div>
  );
}

function AplicacaoPrincipal({ aoSair }) {
  const { loading, apiError } = useApp();
  const [paginaAtiva, setPaginaAtiva] = useState('painel');
  const [menuAberto, setMenuAberto]   = useState(false);

  if (loading)   return <TelaCarregando />;
  if (apiError)  return <TelaErroApi erro={apiError} />;

  function renderizarPagina() {
    switch(paginaAtiva) {
      case 'painel':        return <PainelInicial />;
      case 'ordens':        return <PaginaOrdens />;
      case 'componentes':   return <PaginaComponentes />;
      case 'qualidade':     return <PaginaQualidade />;
      case 'relatorios':    return <PaginaRelatorios />;
      case 'usuarios':      return <PaginaUsuarios />;
      case 'configuracoes': return <PaginaConfiguracoes />;
      case 'metricas':      return <PaginaMetricas />;
      default:              return <PainelInicial />;
    }
  }

  return (
    <div className="layout-app">
      <div className={`overlay-mobile${menuAberto ? ' ativo' : ''}`} onClick={() => setMenuAberto(false)} />
      <BarraLateral paginaAtiva={paginaAtiva} setPaginaAtiva={setPaginaAtiva}
        aoSair={aoSair} aberta={menuAberto} fechar={() => setMenuAberto(false)} />
      <div className="conteudo-principal">
        <header className="cabecalho">
          <button className="btn-menu-mobile" onClick={() => setMenuAberto(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
          <span className="titulo-pagina">{TITULOS[paginaAtiva]}</span>
          <div className="cabecalho-direita">
            <button className="btn-icone tooltip-container" title="Ajuda">
              <i className="fa-regular fa-circle-question"></i>
              <span className="tooltip">Central de Ajuda</span>
            </button>
            <button className="btn-icone tooltip-container">
              <i className="fa-solid fa-bell"></i>
              <span className="notificacao-ponto"></span>
              <span className="tooltip">Notificações</span>
            </button>
            <div className="avatar-cabecalho">CS</div>
          </div>
        </header>
        <main className="area-pagina">{renderizarPagina()}</main>
      </div>
    </div>
  );
}

export default function App() {
  const [autenticado, setAutenticado] = useState(false);
  return (
    <AppProvider>
      {autenticado
        ? <AplicacaoPrincipal aoSair={() => setAutenticado(false)} />
        : <PaginaLogin aoEntrar={() => setAutenticado(true)} />
      }
    </AppProvider>
  );
}
