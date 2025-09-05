'use client';

import { useState, useEffect } from 'react';
import { HistoricoSimulacao, SimulacaoINSS, SimulacaoPrevidencia, RescisaoTrabalhista } from '@/types';

const STORAGE_KEY = 'meu-futuro-financeiro-simulacoes';

export function useSimulations() {
  const [historico, setHistorico] = useState<HistoricoSimulacao>({
    inss: [],
    previdencia: [],
    rescisao: []
  });

  // Carregar do localStorage na inicialização
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Converter strings de data de volta para Date objects
        const convertedHistorico: HistoricoSimulacao = {
          inss: parsed.inss?.map((sim: any) => ({
            ...sim,
            dataAposentadoria: new Date(sim.dataAposentadoria),
            criadoEm: new Date(sim.criadoEm)
          })) || [],
          previdencia: parsed.previdencia?.map((sim: any) => ({
            ...sim,
            criadoEm: new Date(sim.criadoEm)
          })) || [],
          rescisao: parsed.rescisao?.map((sim: any) => ({
            ...sim,
            ultimoReajuste: new Date(sim.ultimoReajuste),
            criadoEm: new Date(sim.criadoEm)
          })) || []
        };
        setHistorico(convertedHistorico);
      }
    } catch (error) {
      console.error('Erro ao carregar simulações salvas:', error);
    }
  }, []);

  // Salvar no localStorage sempre que o histórico mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
    } catch (error) {
      console.error('Erro ao salvar simulações:', error);
    }
  }, [historico]);

  // Adicionar simulação INSS
  const adicionarSimulacaoINSS = (simulacao: SimulacaoINSS) => {
    setHistorico(prev => ({
      ...prev,
      inss: [simulacao, ...prev.inss].slice(0, 10) // Manter apenas as 10 mais recentes
    }));
  };

  // Adicionar simulação Previdência
  const adicionarSimulacaoPrevidencia = (simulacao: SimulacaoPrevidencia) => {
    setHistorico(prev => ({
      ...prev,
      previdencia: [simulacao, ...prev.previdencia].slice(0, 10)
    }));
  };

  // Adicionar simulação Rescisão
  const adicionarSimulacaoRescisao = (simulacao: RescisaoTrabalhista) => {
    setHistorico(prev => ({
      ...prev,
      rescisao: [simulacao, ...prev.rescisao].slice(0, 10)
    }));
  };

  // Remover simulação
  const removerSimulacao = (tipo: keyof HistoricoSimulacao, id: string) => {
    setHistorico(prev => ({
      ...prev,
      [tipo]: prev[tipo].filter(sim => sim.id !== id)
    }));
  };

  // Limpar todo o histórico
  const limparHistorico = () => {
    setHistorico({
      inss: [],
      previdencia: [],
      rescisao: []
    });
  };

  // Buscar simulação por ID
  const buscarSimulacao = (tipo: keyof HistoricoSimulacao, id: string) => {
    return historico[tipo].find(sim => sim.id === id);
  };

  // Estatísticas do histórico
  const estatisticas = {
    totalSimulacoes: historico.inss.length + historico.previdencia.length + historico.rescisao.length,
    ultimaSimulacao: (() => {
      const todasSimulacoes = [
        ...historico.inss,
        ...historico.previdencia,
        ...historico.rescisao
      ].sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
      
      return todasSimulacoes[0]?.criadoEm;
    })()
  };

  return {
    historico,
    adicionarSimulacaoINSS,
    adicionarSimulacaoPrevidencia,
    adicionarSimulacaoRescisao,
    removerSimulacao,
    limparHistorico,
    buscarSimulacao,
    estatisticas
  };
}