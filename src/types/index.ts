// Tipos principais do aplicativo Meu Futuro Financeiro

export interface Usuario {
  nome: string;
  idade: number;
  tempoContribuicao: number;
  salarioMedio: number;
  genero?: 'masculino' | 'feminino';
}

export interface SimulacaoINSS {
  id: string;
  usuario: Usuario;
  tempoRestante: number;
  valorEstimado: number;
  dataAposentadoria: Date;
  idadeAposentadoria: number;
  regra: string;
  criadoEm: Date;
}

export interface SimulacaoPrevidencia {
  id: string;
  investimentoMensal: number;
  tempoContribuicao: number;
  taxaRentabilidade: number;
  saldoFinal: number;
  projecao: Array<{
    ano: number;
    valor: number;
    contribuicaoAcumulada: number;
    rendimentoAcumulado: number;
  }>;
  criadoEm: Date;
}

export type TipoRescisao = 'demissao' | 'sem-justa-causa' | 'justa-causa' | 'acordo';

export interface ValoresRescisao {
  avisoPrevio: number;
  feriasVencidas: number;
  feriasProporcionais: number;
  decimoTerceiroVencido: number;
  decimoTerceiroPropcional: number;
  fgts: number;
  multaFgts: number;
  salariosPendentes: number;
  total: number;
}

export interface RescisaoTrabalhista {
  id: string;
  salarioAtual: number;
  tempoEmpresa: number; // em meses
  feriasVencidas: number; // em dias
  ultimoReajuste: Date;
  tipoRescisao: TipoRescisao;
  valores: ValoresRescisao;
  criadoEm: Date;
}

export interface HistoricoSimulacao {
  inss: SimulacaoINSS[];
  previdencia: SimulacaoPrevidencia[];
  rescisao: RescisaoTrabalhista[];
}

// Tipos para formulários
export interface FormularioINSS {
  nome: string;
  idade: number;
  tempoContribuicao: number;
  salarioMedio: number;
  genero: 'masculino' | 'feminino';
}

export interface FormularioPrevidencia {
  investimentoMensal: number;
  tempoContribuicao: number;
  taxaRentabilidade: number;
  idadeAtual?: number;
}

export interface FormularioRescisao {
  salarioAtual: number;
  tempoEmpresaAnos: number;
  tempoEmpresaMeses: number;
  feriasVencidas: number;
  tipoRescisao: TipoRescisao;
  dataAdmissao?: Date;
}

// Constantes do INSS (valores de 2024)
export const CONSTANTES_INSS = {
  TETO_BENEFICIO: 7786.02,
  IDADE_MINIMA_HOMEM: 65,
  IDADE_MINIMA_MULHER: 62,
  TEMPO_CONTRIBUICAO_MINIMO: 15,
  TEMPO_CONTRIBUICAO_INTEGRAL: 35, // homem
  TEMPO_CONTRIBUICAO_INTEGRAL_MULHER: 30,
  FATOR_PREVIDENCIARIO_BASE: 0.6,
  PERCENTUAL_ADICIONAL_ANO: 0.02,
} as const;

// Constantes trabalhistas
export const CONSTANTES_TRABALHISTAS = {
  DIAS_AVISO_PREVIO_BASE: 30,
  DIAS_ADICIONAL_POR_ANO: 3,
  DIAS_AVISO_PREVIO_MAXIMO: 90,
  PERCENTUAL_MULTA_FGTS: 0.4,
  PERCENTUAL_FGTS: 0.08,
  DIAS_FERIAS: 30,
  TERCO_FERIAS: 1/3,
} as const;