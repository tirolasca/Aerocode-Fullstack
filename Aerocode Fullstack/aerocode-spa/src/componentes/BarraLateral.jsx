import { usuarioAtual } from '../dados/dadosMock';

const itensNav = [
  { id:'painel',        rotulo:'Painel Inicial',          icone:'fa-solid fa-gauge-high',    secao:'Principal' },
  { id:'ordens',        rotulo:'Ordens de Produção',       icone:'fa-solid fa-clipboard-list', badge:47, secao:'Principal' },
  { id:'componentes',   rotulo:'Componentes',              icone:'fa-solid fa-gears',          secao:'Principal' },
  { id:'qualidade',     rotulo:'Controle de Qualidade',    icone:'fa-solid fa-shield-halved',  badge:3, secao:'Principal' },
  { id:'relatorios',    rotulo:'Relatórios',               icone:'fa-solid fa-chart-line',     secao:'Análise' },
  { id:'metricas',      rotulo:'Métricas de Qualidade',    icone:'fa-solid fa-stopwatch',      secao:'Análise' },
  { id:'usuarios',      rotulo:'Usuários',                 icone:'fa-solid fa-users',          secao:'Administração' },
  { id:'configuracoes', rotulo:'Configurações',            icone:'fa-solid fa-sliders',        secao:'Administração' },
];

export default function BarraLateral({ paginaAtiva, setPaginaAtiva, aoSair, aberta, fechar }) {
  let secaoAtual = '';

  return (
    <aside className={`barra-lateral${aberta ? ' aberta' : ''}`}>
      {/* Logo */}
      <div className="barra-lateral-logo">
        <span className="barra-lateral-logo-icone">
          <i className="fa-solid fa-plane"></i>
        </span>
        <div>
          <div className="barra-lateral-logo-texto">AEROCODE</div>
          <div className="barra-lateral-logo-sub">Production Management</div>
        </div>
        <button className="btn-fechar-lateral" onClick={fechar} aria-label="Fechar menu">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>

      {/* Navegação */}
      <nav className="barra-lateral-nav">
        {itensNav.map(item => {
          const mostrarSecao = item.secao !== secaoAtual;
          // eslint-disable-next-line react-hooks/immutability
          secaoAtual = item.secao;
          return (
            <div key={item.id}>
              {mostrarSecao && (
                <div className="nav-secao">
                  <span className="nav-secao-label">{item.secao}</span>
                </div>
              )}
              <div
                className={`nav-item${paginaAtiva === item.id ? ' ativo' : ''}`}
                onClick={() => { setPaginaAtiva(item.id); fechar(); }}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && (setPaginaAtiva(item.id), fechar())}
              >
                <span className="nav-item-icone">
                  <i className={item.icone}></i>
                </span>
                <span>{item.rotulo}</span>
                {item.badge && (
                  <span className="nav-badge">{item.badge}</span>
                )}
              </div>
            </div>
          );
        })}

        <div className="nav-secao">
          <span className="nav-secao-label">Sessão</span>
        </div>
        <div className="nav-item" onClick={aoSair} role="button" tabIndex={0}>
          <span className="nav-item-icone">
            <i className="fa-solid fa-right-from-bracket"></i>
          </span>
          <span>Sair do Sistema</span>
        </div>
      </nav>

      {/* Rodapé com usuário */}
      <div className="barra-lateral-rodape">
        <div className="cartao-usuario">
          <div className="avatar">{usuarioAtual.iniciais}</div>
          <div>
            <div className="usuario-nome">{usuarioAtual.nome}</div>
            <div className="usuario-cargo">{usuarioAtual.cargo}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
