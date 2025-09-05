import jsPDF from 'jspdf';
import { formatarMoeda, formatarData } from './calculations';
import { SimulacaoINSS, SimulacaoPrevidencia, RescisaoTrabalhista } from '@/types';

// Configurações do PDF
const MARGINS = {
  top: 20,
  left: 20,
  right: 20,
  bottom: 20
};



// Função auxiliar para adicionar cabeçalho
function adicionarCabecalho(doc: jsPDF, titulo: string) {
  // Logo/marca (simulado com texto)
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Meu Futuro Financeiro', MARGINS.left, MARGINS.top);
  
  // Linha separadora
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, MARGINS.top + 5, 190, MARGINS.top + 5);
  
  // Título do relatório
  doc.setFontSize(14);
  doc.text(titulo, MARGINS.left, MARGINS.top + 15);
  
  // Data de geração
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em: ${formatarData(new Date())}`, MARGINS.left, MARGINS.top + 25);
  
  return MARGINS.top + 35;
}

// Função auxiliar para adicionar rodapé
function adicionarRodape(doc: jsPDF) {
  const pageHeight = doc.internal.pageSize.height;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Este relatório contém estimativas baseadas na legislação vigente. Consulte um especialista para orientações específicas.',
    MARGINS.left,
    pageHeight - MARGINS.bottom + 10,
    { maxWidth: 170 }
  );
  
  doc.text(
    `Página 1 de 1`,
    150,
    pageHeight - MARGINS.bottom + 10
  );
}

// Exportar simulação INSS
export function exportarINSSPdf(simulacao: SimulacaoINSS): void {
  const doc = new jsPDF();
  let yPosition = adicionarCabecalho(doc, 'Simulação de Aposentadoria INSS');
  
  // Dados do usuário
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados Pessoais', MARGINS.left, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const dadosUsuario = [
    `Nome: ${simulacao.usuario.nome}`,
    `Idade atual: ${simulacao.usuario.idade} anos`,
    `Gênero: ${simulacao.usuario.genero === 'masculino' ? 'Masculino' : 'Feminino'}`,
    `Tempo de contribuição: ${simulacao.usuario.tempoContribuicao} anos`,
    `Salário médio: ${formatarMoeda(simulacao.usuario.salarioMedio)}`
  ];
  
  dadosUsuario.forEach(linha => {
    doc.text(linha, MARGINS.left, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Resultados
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultado da Simulação', MARGINS.left, yPosition);
  yPosition += 10;
  
  // Caixa com valor principal
  doc.setFillColor(22, 163, 74); // Verde
  doc.rect(MARGINS.left, yPosition, 170, 20, 'F');
  
  doc.setTextColor(255, 255, 255); // Branco
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Valor Estimado da Aposentadoria:', MARGINS.left + 5, yPosition + 8);
  doc.text(formatarMoeda(simulacao.valorEstimado), MARGINS.left + 5, yPosition + 16);
  
  doc.setTextColor(0, 0, 0); // Voltar para preto
  yPosition += 30;
  
  // Detalhes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const detalhes = [
    `Tempo restante para aposentar: ${simulacao.tempoRestante} ${simulacao.tempoRestante === 1 ? 'ano' : 'anos'}`,
    `Idade na aposentadoria: ${simulacao.idadeAposentadoria} anos`,
    `Data estimada: ${formatarData(simulacao.dataAposentadoria)}`,
    `Regra aplicada: ${simulacao.regra}`
  ];
  
  detalhes.forEach(linha => {
    doc.text(linha, MARGINS.left, yPosition);
    yPosition += 6;
  });
  
  adicionarRodape(doc);
  doc.save(`simulacao-inss-${new Date().getTime()}.pdf`);
}

// Exportar simulação Previdência
export function exportarPrevidenciaPdf(simulacao: SimulacaoPrevidencia): void {
  const doc = new jsPDF();
  let yPosition = adicionarCabecalho(doc, 'Simulação de Previdência Privada');
  
  const contribuicaoTotal = simulacao.investimentoMensal * simulacao.tempoContribuicao * 12;
  const rendimentoTotal = simulacao.saldoFinal - contribuicaoTotal;
  
  // Dados da simulação
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Parâmetros da Simulação', MARGINS.left, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const parametros = [
    `Investimento mensal: ${formatarMoeda(simulacao.investimentoMensal)}`,
    `Período: ${simulacao.tempoContribuicao} anos`,
    `Taxa de rentabilidade: ${simulacao.taxaRentabilidade}% ao ano`
  ];
  
  parametros.forEach(linha => {
    doc.text(linha, MARGINS.left, yPosition);
    yPosition += 6;
  });
  
  yPosition += 10;
  
  // Resultados principais
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Resultado da Simulação', MARGINS.left, yPosition);
  yPosition += 10;
  
  // Caixa com valor principal
  doc.setFillColor(22, 163, 74);
  doc.rect(MARGINS.left, yPosition, 170, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Valor Total Acumulado:', MARGINS.left + 5, yPosition + 8);
  doc.text(formatarMoeda(simulacao.saldoFinal), MARGINS.left + 5, yPosition + 16);
  
  doc.setTextColor(0, 0, 0);
  yPosition += 30;
  
  // Detalhes
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const detalhes = [
    `Total investido: ${formatarMoeda(contribuicaoTotal)}`,
    `Rendimento obtido: ${formatarMoeda(rendimentoTotal)}`,
    `Rentabilidade total: ${((rendimentoTotal / contribuicaoTotal) * 100).toFixed(1)}%`
  ];
  
  detalhes.forEach(linha => {
    doc.text(linha, MARGINS.left, yPosition);
    yPosition += 6;
  });
  
  yPosition += 15;
  
  // Tabela com projeção (últimos 5 anos)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Projeção - Últimos 5 Anos', MARGINS.left, yPosition);
  yPosition += 10;
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Idade', MARGINS.left, yPosition);
  doc.text('Valor Acumulado', MARGINS.left + 40, yPosition);
  doc.text('Contribuição', MARGINS.left + 90, yPosition);
  doc.text('Rendimento', MARGINS.left + 140, yPosition);
  
  doc.line(MARGINS.left, yPosition + 2, 190, yPosition + 2);
  yPosition += 8;
  
  doc.setFont('helvetica', 'normal');
  const ultimos5Anos = simulacao.projecao.slice(-5);
  
  ultimos5Anos.forEach(item => {
    doc.text(item.ano.toString(), MARGINS.left, yPosition);
    doc.text(formatarMoeda(item.valor), MARGINS.left + 40, yPosition);
    doc.text(formatarMoeda(item.contribuicaoAcumulada), MARGINS.left + 90, yPosition);
    doc.text(formatarMoeda(item.rendimentoAcumulado), MARGINS.left + 140, yPosition);
    yPosition += 6;
  });
  
  adicionarRodape(doc);
  doc.save(`simulacao-previdencia-${new Date().getTime()}.pdf`);
}

// Exportar rescisão trabalhista
export function exportarRescisaoPdf(rescisao: RescisaoTrabalhista): void {
  const doc = new jsPDF();
  let yPosition = adicionarCabecalho(doc, 'Cálculo de Rescisão Trabalhista');
  
  const tiposRescisao: Record<string, string> = {
    'sem-justa-causa': 'Demissão sem justa causa',
    'demissao': 'Pedido de demissão',
    'acordo': 'Demissão em comum acordo',
    'justa-causa': 'Demissão por justa causa'
  };
  
  // Dados do contrato
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Dados do Contrato', MARGINS.left, yPosition);
  yPosition += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  const dadosContrato = [
    `Salário atual: ${formatarMoeda(rescisao.salarioAtual)}`,
    `Tempo de empresa: ${Math.floor(rescisao.tempoEmpresa / 12)} anos e ${rescisao.tempoEmpresa % 12} meses`,
    `Férias vencidas: ${rescisao.feriasVencidas} dias`,
    `Tipo de rescisão: ${tiposRescisao[rescisao.tipoRescisao]}`
  ];
  
  dadosContrato.forEach(linha => {
    doc.text(linha, MARGINS.left, yPosition);
    yPosition += 6;
  });
  
  yPosition += 15;
  
  // Valor total
  doc.setFillColor(22, 163, 74);
  doc.rect(MARGINS.left, yPosition, 170, 20, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Total a Receber:', MARGINS.left + 5, yPosition + 8);
  doc.text(formatarMoeda(rescisao.valores.total), MARGINS.left + 5, yPosition + 16);
  
  doc.setTextColor(0, 0, 0);
  yPosition += 35;
  
  // Detalhamento
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detalhamento dos Valores', MARGINS.left, yPosition);
  yPosition += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const valores = [
    { label: 'Aviso prévio', valor: rescisao.valores.avisoPrevio },
    { label: 'Férias vencidas', valor: rescisao.valores.feriasVencidas },
    { label: 'Férias proporcionais', valor: rescisao.valores.feriasProporcionais },
    { label: '13º salário proporcional', valor: rescisao.valores.decimoTerceiroPropcional },
    { label: 'FGTS disponível', valor: rescisao.valores.fgts },
    { label: 'Multa do FGTS', valor: rescisao.valores.multaFgts }
  ];
  
  valores.forEach(item => {
    if (item.valor > 0) {
      doc.text(item.label, MARGINS.left, yPosition);
      doc.text(formatarMoeda(item.valor), MARGINS.left + 120, yPosition);
      yPosition += 6;
    }
  });
  
  // Linha total
  doc.line(MARGINS.left + 120, yPosition + 2, 180, yPosition + 2);
  yPosition += 8;
  
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', MARGINS.left, yPosition);
  doc.text(formatarMoeda(rescisao.valores.total), MARGINS.left + 120, yPosition);
  
  adicionarRodape(doc);
  doc.save(`calculo-rescisao-${new Date().getTime()}.pdf`);
}