import { useState } from 'react';

export default function PaginaLogin({ aoEntrar }) {
  const [email, setEmail] = useState('carlos.silva@aerocode.com');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!email || !senha) { setErro('Preencha todos os campos para continuar.'); return; }
    setCarregando(true);
    setErro('');
    setTimeout(() => { setCarregando(false); aoEntrar(); }, 900);
  }

  return (
    <div className="login-fundo">
      {[200, 340, 480, 620, 760, 900].map((tamanho, i) => (
        <div
          key={i}
          className="login-anel"
          style={{ width: tamanho, height: tamanho, animationDelay: `${i * 0.6}s` }}
        />
      ))}

      <div className="login-aviao-bg">
        <i className="fa-solid fa-plane"></i>
      </div>

      <div className="login-caixa">
 
        <div className="login-logo-area">
          <div className="login-icone-aviao">
            <i className="fa-solid fa-plane-departure"></i>
          </div>
          <h1 className="login-titulo">AEROCODE</h1>
          <p className="login-subtitulo">Aircraft Production Management System</p>
        </div>

        <div className="login-card">
          <h2 className="login-card-titulo">Acesso ao Sistema</h2>
          <p className="login-card-desc">Credenciais corporativas Aerocode</p>

          {erro && (
            <div className="login-erro">
              <i className="fa-solid fa-circle-exclamation"></i>
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grupo-campo">
              <label className="rotulo" htmlFor="login-email">
                <i className="fa-solid fa-envelope"></i> E-mail corporativo
              </label>
              <input
                id="login-email"
                className="campo-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="email@aerocode.com"
                autoComplete="email"
              />
            </div>

            <div className="grupo-campo">
              <label className="rotulo" htmlFor="login-senha">
                <i className="fa-solid fa-lock"></i> Senha
              </label>
              <input
                id="login-senha"
                className="campo-input"
                type="password"
                value={senha}
                onChange={e => setSenha(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <span className="login-recuperar">
              <i className="fa-solid fa-key"></i> Esqueci minha senha
            </span>

            <button
              type="submit"
              className="btn btn-primario login-btn-entrar"
              disabled={carregando}
            >
              {carregando ? (
                <>
                  <span className="login-spinner spinner-branco"></span>
                  Autenticando...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-right-to-bracket"></i>
                  Entrar no Sistema
                </>
              )}
            </button>
          </form>
        </div>

        <p className="login-rodape">
          <i className="fa-solid fa-shield-halved"></i> Aerocode © 2026 — Sistema restrito a usuários autorizados
        </p>
      </div>
    </div>
  );
}
