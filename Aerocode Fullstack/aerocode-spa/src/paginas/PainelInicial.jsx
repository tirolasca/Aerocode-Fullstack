import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { producaoMensal, StatusEtapa, dadosQualidade } from '../dados/dadosMock';
import { useApp } from '../contexto/AppContext';

function statusOrdem(ordem) {
  const etapas = ordem.etapas || [];
  if (etapas.length === 0) return 'Planejado';
  if (etapas.every(e => e.status === StatusEtapa.CONCLUIDA)) return 'Concluído';
  if (etapas.some(e => e.status === StatusEtapa.ANDAMENTO)) return 'Em Produção';
  return 'Planejado';
}

function BadgeStatus({ status }) {
  const mapa = {
    'Em Produção': 'badge badge-info',
    'Concluído':   'badge badge-sucesso',
    'Planejado':   'badge badge-neutro',
  };
  return <span className={mapa[status] || 'badge badge-neutro'}>{status}</span>;
}

function BarraProgresso({ valor }) {
  return (
    <div className="barra-progresso-fundo barra-progresso-sm barra-inline-flex">
      <div className="barra-progresso-fill" style={{ width: `${valor}%` }} />
    </div>
  );
}

const dadosGraficoQual = producaoMensal.map((m, i) => ({
  ...m,
  taxa: dadosQualidade[i]?.taxa ?? 98,
}));

export default function PainelInicial() {
  const { ordens } = useApp();
  
  const [cliquesTitulo, setCliquesTitulo] = useState(0);
  const easterEggAtivo = cliquesTitulo >= 5;

  const lidarComCliqueTitulo = () => {
    setCliquesTitulo(prev => {
      const novoValor = prev + 1;
      if (novoValor === 5) {
        console.log("👽 TRANSMISSÃO INTERCEPTADA: Produção de tecnologia não identificada em andamento.");
      }
      return novoValor;
    });
  };

  const ordemSecreta = {
    id: 'UFO-51',
    modelo: 'Disco Voador',
    cliente: 'Setor Oculto (Área 51)',
    progresso: 100,
    entrega: 'Classificado',
    etapas: [{ status: StatusEtapa.CONCLUIDA }]
  };

  const ordensAtivas   = ordens.filter(o => statusOrdem(o) === 'Em Produção').length;
  const ordensRecentes = ordens.slice(0, 6);
  
  const ordensExibidas = easterEggAtivo 
    ? [ordemSecreta, ...ordensRecentes.slice(0, 5)] 
    : ordensRecentes;

  return (
    <div className="fade-entrada">
      <div className="cabecalho-pagina">
        <div className="titulo-area">
          {/* Adicionando o evento de clique e estilo para indicar interatividade sutil */}
          <h2 
            className="titulo-principal" 
            onClick={lidarComCliqueTitulo}
            style={{ cursor: 'default', userSelect: 'none' }}
            title="Dê 5 cliques rápidos para uma surpresa..."
          >
            Painel Inicial {easterEggAtivo && "👽"}
          </h2>
          <p className="subtitulo-pagina">
            <i className="fa-solid fa-calendar-day"></i>{' '}
            Visão geral da produção —{' '}
            {new Date().toLocaleDateString('pt-BR', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>
      </div>

      <div className="grade-kpi">
        <div className="kpi kpi-azul">
          <i className="fa-solid fa-clipboard-list kpi-icone-bg"></i>
          <div className="kpi-rotulo">Ordens Ativas</div>
          <div className="kpi-valor">{ordensAtivas}</div>
          <div className="kpi-sub">em produção agora</div>
          <div className="kpi-tendencia alta">
            <i className="fa-solid fa-arrow-trend-up"></i> +5 vs mês ant.
          </div>
        </div>

        <div className="kpi kpi-verde">
          <i className="fa-solid fa-circle-check kpi-icone-bg"></i>
          <div className="kpi-rotulo">Taxa de Qualidade</div>
          <div className="kpi-valor">98.2%</div>
          <div className="kpi-sub">peças aprovadas</div>
          <div className="kpi-tendencia alta">
            <i className="fa-solid fa-arrow-trend-up"></i> +0.4% mês
          </div>
        </div>

        <div className="kpi kpi-amarelo">
          <i className="fa-solid fa-triangle-exclamation kpi-icone-bg"></i>
          <div className="kpi-rotulo">Prazos em Risco</div>
          <div className="kpi-valor">3</div>
          <div className="kpi-sub">ordens críticas</div>
          <div className="kpi-tendencia aviso">
            <i className="fa-solid fa-triangle-exclamation"></i> Requer atenção
          </div>
        </div>

        <div className="kpi kpi-indigo">
          <i className="fa-solid fa-plane-arrival kpi-icone-bg"></i>
          <div className="kpi-rotulo">Aeronaves Concluídas</div>
          <div className="kpi-valor">
            {ordens.filter(o => statusOrdem(o) === 'Concluído').length}
          </div>
          <div className="kpi-sub">neste mês</div>
          <div className="kpi-tendencia alta">
            <i className="fa-solid fa-bullseye"></i> Meta: 14
          </div>
        </div>
      </div>
      
      <div className="grade-graficos">
        <div className="cartao">
          <div className="cartao-cabecalho">
            <span className="cartao-titulo">
              <i className="fa-solid fa-chart-bar"></i> Produção Mensal
            </span>
            <span>2026</span>
          </div>
          <div className="cartao-corpo">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={producaoMensal} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={28} />
                <Tooltip contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #d0dce8', boxShadow:'0 4px 16px rgba(26,58,107,0.1)', padding:'8px 14px' }} />
                <Bar dataKey="concluidas" name="Concluídas" fill="#1a3a6b" radius={[4,4,0,0]} />
                <Bar dataKey="planejadas" name="Planejadas" fill="#5b9cf6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="cartao">
          <div className="cartao-cabecalho">
            <span className="cartao-titulo">
              <i className="fa-solid fa-chart-line"></i> Taxa de Qualidade (%)
            </span>
            <span>12 meses</span>
          </div>
          <div className="cartao-corpo">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={dadosGraficoQual}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef5" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis domain={[96,100]} tick={{ fontSize:11 }} axisLine={false} tickLine={false} width={36} />
                <Tooltip contentStyle={{ borderRadius:10, fontSize:12, border:'1px solid #d0dce8', boxShadow:'0 4px 16px rgba(26,58,107,0.1)', padding:'8px 14px' }} />
                <Line dataKey="taxa" name="Taxa %" stroke="#1a8754" strokeWidth={2.5} dot={{ r:3, fill:'#1a8754' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      <div className="cartao">
        <div className="cartao-cabecalho">
          <span className="cartao-titulo">
            <i className="fa-solid fa-clock-rotate-left"></i> Ordens Recentes
          </span>
          <span><i className="fa-solid fa-arrow-right"></i> Ver todas</span>
        </div>
        <div className="container-tabela">
          <table>
            <thead>
              <tr>
                <th>Nº Ordem</th>
                <th>Aeronave</th>
                <th>Cliente</th>
                <th>Progresso</th>
                <th>Entrega</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {/* Mapeando o novo array "ordensExibidas" que contém o easter egg quando ativo */}
              {ordensExibidas.map(ordem => (
                <tr key={ordem.id} style={ordem.id === 'UFO-51' ? { backgroundColor: '#eef8eb', fontWeight: 'bold' } : {}}>
                  <td><span className="num-ordem">{ordem.id}</span></td>
                  <td>{ordem.id === 'UFO-51' ? '🛸 ' : ''}{ordem.modelo}</td>
                  <td>{ordem.cliente}</td>
                  <td>
                    <div className="barra-progresso-container-inline">
                      <BarraProgresso valor={ordem.progresso} />
                      <span className="barra-progresso-texto">{ordem.progresso}%</span>
                    </div>
                  </td>
                  <td>{ordem.entrega}</td>
                  <td><BadgeStatus status={statusOrdem(ordem)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}