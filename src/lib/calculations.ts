import { 
  Usuario, 
  SimulacaoINSS, 
  SimulacaoPrevidencia, 
  RescisaoTrabalhista,
  ValoresRescisao,
  TipoRescisao,
  CONSTANTES_INSS,
  CONSTANTES_TRABALHISTAS
} from '@/types';

// ========================
// CÁLCULOS INSS
// ========================

export function calcularAposentadoriaINSS(usuario: Usuario): SimulacaoINSS {
  const { idade, tempoContribuicao, salarioMedio, genero = 'masculino' } = usuario;
  
  // Definir idade mínima baseada no gênero
  const idadeMinima = genero === 'feminino' 
    ? CONSTANTES_INSS.IDADE_MINIMA_MULHER 
    : CONSTANTES_INSS.IDADE_MINIMA_HOMEM;
  
  // Calcular anos restantes
  const tempoRestanteIdade = Math.max(0, idadeMinima - idade);
  const tempoRestanteContribuicao = Math.max(0, CONSTANTES_INSS.TEMPO_CONTRIBUICAO_MINIMO - tempoContribuicao);
  const tempoRestante = Math.max(tempoRestanteIdade, tempoRestanteContribuicao);
  
  // Calcular valor do benefício
  const salarioLimitado = Math.min(salarioMedio, CONSTANTES_INSS.TETO_BENEFICIO);
  
  // Fórmula simplificada: 60% + 2% por ano acima de 15 anos de contribuição
  const tempoContribuicaoFinal = tempoContribuicao + tempoRestanteContribuicao;
  const percentualBeneficio = Math.min(
    CONSTANTES_INSS.FATOR_PREVIDENCIARIO_BASE + 
    (Math.max(0, tempoContribuicaoFinal - CONSTANTES_INSS.TEMPO_CONTRIBUICAO_MINIMO) * CONSTANTES_INSS.PERCENTUAL_ADICIONAL_ANO),
    1.0
  );
  
  const valorEstimado = salarioLimitado * percentualBeneficio;
  const idadeAposentadoria = idade + tempoRestante;
  const dataAposentadoria = new Date();
  dataAposentadoria.setFullYear(dataAposentadoria.getFullYear() + tempoRestante);
  
  return {
    id: `inss-${Date.now()}`,
    usuario,
    tempoRestante,
    valorEstimado,
    dataAposentadoria,
    idadeAposentadoria,
    regra: 'Regra de transição por idade',
    criadoEm: new Date()
  };
}

// ========================
// CÁLCULOS PREVIDÊNCIA PRIVADA
// ========================

export function calcularPrevidenciaPrivada(
  investimentoMensal: number,
  tempoContribuicaoAnos: number,
  taxaRentabilidadeAnual: number,
  idadeAtual: number = 30
): SimulacaoPrevidencia {
  const taxaMensal = taxaRentabilidadeAnual / 100 / 12;
  const meses = tempoContribuicaoAnos * 12;
  
  // Cálculo do montante final usando juros compostos
  // FV = PMT * [((1 + r)^n - 1) / r]
  const fatorJuros = Math.pow(1 + taxaMensal, meses);
  const saldoFinal = investimentoMensal * ((fatorJuros - 1) / taxaMensal);
  
  // Gerar projeção ano a ano
  const projecao = [];
  let saldoAcumulado = 0;
  let contribuicaoTotal = 0;
  
  for (let ano = 1; ano <= tempoContribuicaoAnos; ano++) {
    // Calcular saldo no final do ano
    const mesesAno = ano * 12;
    const fatorJurosAno = Math.pow(1 + taxaMensal, mesesAno);
    saldoAcumulado = investimentoMensal * ((fatorJurosAno - 1) / taxaMensal);
    contribuicaoTotal = investimentoMensal * mesesAno;
    
    projecao.push({
      ano: idadeAtual + ano,
      valor: saldoAcumulado,
      contribuicaoAcumulada: contribuicaoTotal,
      rendimentoAcumulado: saldoAcumulado - contribuicaoTotal
    });
  }
  
  return {
    id: `prev-${Date.now()}`,
    investimentoMensal,
    tempoContribuicao: tempoContribuicaoAnos,
    taxaRentabilidade: taxaRentabilidadeAnual,
    saldoFinal,
    projecao,
    criadoEm: new Date()
  };
}

// ========================
// CÁLCULOS RESCISÃO TRABALHISTA
// ========================

export function calcularRescisaoTrabalhista(
  salarioAtual: number,
  tempoEmpresaMeses: number,
  feriasVencidasDias: number,
  tipoRescisao: TipoRescisao
): RescisaoTrabalhista {
  const tempoEmpresaAnos = Math.floor(tempoEmpresaMeses / 12);
  const mesesProporcionais = tempoEmpresaMeses % 12;
  
  // Calcular valores base
  const salarioMensal = salarioAtual;
  const salarioDiario = salarioAtual / 30;
  
  // Inicializar valores
  let valores: ValoresRescisao = {
    avisoPrevio: 0,
    feriasVencidas: 0,
    feriasProporcionais: 0,
    decimoTerceiroVencido: 0,
    decimoTerceiroPropcional: 0,
    fgts: 0,
    multaFgts: 0,
    salariosPendentes: 0,
    total: 0
  };
  
  // FÉRIAS VENCIDAS (sempre devidas)
  if (feriasVencidasDias > 0) {
    valores.feriasVencidas = (salarioMensal + salarioMensal * CONSTANTES_TRABALHISTAS.TERCO_FERIAS) * 
                             (feriasVencidasDias / 30);
  }
  
  // CÁLCULOS POR TIPO DE RESCISÃO
  switch (tipoRescisao) {
    case 'sem-justa-causa':
      // Aviso prévio
      const diasAvisoPrevio = Math.min(
        CONSTANTES_TRABALHISTAS.DIAS_AVISO_PREVIO_BASE + (tempoEmpresaAnos * CONSTANTES_TRABALHISTAS.DIAS_ADICIONAL_POR_ANO),
        CONSTANTES_TRABALHISTAS.DIAS_AVISO_PREVIO_MAXIMO
      );
      valores.avisoPrevio = salarioDiario * diasAvisoPrevio;
      
      // Férias proporcionais
      valores.feriasProporcionais = (salarioMensal + salarioMensal * CONSTANTES_TRABALHISTAS.TERCO_FERIAS) * 
                                   (mesesProporcionais / 12);
      
      // 13º proporcional
      valores.decimoTerceiroPropcional = salarioMensal * (mesesProporcionais / 12);
      
      // FGTS + multa 40%
      const saldoFgts = salarioMensal * tempoEmpresaMeses * CONSTANTES_TRABALHISTAS.PERCENTUAL_FGTS;
      valores.fgts = saldoFgts;
      valores.multaFgts = saldoFgts * CONSTANTES_TRABALHISTAS.PERCENTUAL_MULTA_FGTS;
      break;
      
    case 'demissao':
      // Apenas férias proporcionais e 13º proporcional
      valores.feriasProporcionais = (salarioMensal + salarioMensal * CONSTANTES_TRABALHISTAS.TERCO_FERIAS) * 
                                   (mesesProporcionais / 12);
      valores.decimoTerceiroPropcional = salarioMensal * (mesesProporcionais / 12);
      break;
      
    case 'justa-causa':
      // Apenas férias vencidas (já calculadas)
      break;
      
    case 'acordo':
      // Acordo: metade do aviso prévio e multa FGTS reduzida
      const diasAvisoPrevioAcordo = Math.min(
        CONSTANTES_TRABALHISTAS.DIAS_AVISO_PREVIO_BASE + (tempoEmpresaAnos * CONSTANTES_TRABALHISTAS.DIAS_ADICIONAL_POR_ANO),
        CONSTANTES_TRABALHISTAS.DIAS_AVISO_PREVIO_MAXIMO
      );
      valores.avisoPrevio = (salarioDiario * diasAvisoPrevioAcordo) / 2;
      
      valores.feriasProporcionais = (salarioMensal + salarioMensal * CONSTANTES_TRABALHISTAS.TERCO_FERIAS) * 
                                   (mesesProporcionais / 12);
      valores.decimoTerceiroPropcional = salarioMensal * (mesesProporcionais / 12);
      
      // FGTS + multa reduzida (20%)
      const saldoFgtsAcordo = salarioMensal * tempoEmpresaMeses * CONSTANTES_TRABALHISTAS.PERCENTUAL_FGTS;
      valores.fgts = saldoFgtsAcordo * 0.8; // Saque 80%
      valores.multaFgts = saldoFgtsAcordo * 0.2; // Multa 20%
      break;
  }
  
  // Calcular total
  valores.total = Object.entries(valores)
    .filter(([key]) => key !== 'total')
    .reduce((sum, [, value]) => sum + (value as number), 0);
  
  return {
    id: `resc-${Date.now()}`,
    salarioAtual,
    tempoEmpresa: tempoEmpresaMeses,
    feriasVencidas: feriasVencidasDias,
    ultimoReajuste: new Date(),
    tipoRescisao,
    valores,
    criadoEm: new Date()
  };
}

// ========================
// FUNÇÕES AUXILIARES
// ========================

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor);
}

export function formatarPercentual(valor: number, decimais: number = 1): string {
  return `${valor.toFixed(decimais)}%`;
}

export function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(data);
}

export function calcularIdade(dataNascimento: Date): number {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const mesAniversario = hoje.getMonth() - dataNascimento.getMonth();
  
  if (mesAniversario < 0 || (mesAniversario === 0 && hoje.getDate() < dataNascimento.getDate())) {
    idade--;
  }
  
  return idade;
}