'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Header from '@/components/Header';
import ResultCard from '@/components/ResultCard';
import { calcularPrevidenciaPrivada, formatarMoeda } from '@/lib/calculations';
import { exportarPrevidenciaPdf } from '@/lib/pdf-export';
import { useSimulations } from '@/hooks/useSimulations';
import { SimulacaoPrevidencia } from '@/types';

// Schema de validação
const schemaPrevidencia = z.object({
  investimentoMensal: z.number().min(50, 'Investimento mínimo é R$ 50').max(50000, 'Investimento muito alto'),
  tempoContribuicao: z.number().min(1, 'Tempo mínimo é 1 ano').max(50, 'Tempo máximo é 50 anos'),
  taxaRentabilidade: z.number().min(0.1, 'Taxa mínima é 0,1%').max(30, 'Taxa muito alta'),
  idadeAtual: z.number().min(18, 'Idade mínima é 18 anos').max(70, 'Idade máxima é 70 anos')
});

type FormDataPrevidencia = z.infer<typeof schemaPrevidencia>;

export default function PrevidenciaPage() {
  const [resultado, setResultado] = useState<SimulacaoPrevidencia | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const { adicionarSimulacaoPrevidencia } = useSimulations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormDataPrevidencia>({
    resolver: zodResolver(schemaPrevidencia),
    defaultValues: {
      idadeAtual: 30
    }
  });

  const onSubmit = (data: FormDataPrevidencia) => {
    const simulacao = calcularPrevidenciaPrivada(
      data.investimentoMensal,
      data.tempoContribuicao,
      data.taxaRentabilidade,
      data.idadeAtual
    );
    setResultado(simulacao);
    setMostrarResultado(true);
  };

  const salvarSimulacao = () => {
    if (resultado) {
      adicionarSimulacaoPrevidencia(resultado);
      alert('Simulação salva com sucesso!');
    }
  };

  const novaSimulacao = () => {
    setMostrarResultado(false);
    setResultado(null);
    reset();
  };

  const exportarPDF = () => {
    if (resultado) {
      exportarPrevidenciaPdf(resultado);
    }
  };

  if (mostrarResultado && resultado) {
    const contribuicaoTotal = resultado.investimentoMensal * resultado.tempoContribuicao * 12;
    const rendimentoTotal = resultado.saldoFinal - contribuicaoTotal;
    
    const detalhes = [
      {
        label: 'Investimento mensal',
        value: resultado.investimentoMensal
      },
      {
        label: 'Período de investimento',
        value: `${resultado.tempoContribuicao} anos`
      },
      {
        label: 'Taxa de rentabilidade anual',
        value: `${resultado.taxaRentabilidade}%`
      },
      {
        label: 'Total investido',
        value: contribuicaoTotal,
        highlight: true
      },
      {
        label: 'Rendimento obtido',
        value: rendimentoTotal,
        highlight: true
      }
    ];

    // Dados para o gráfico
    const dadosGrafico = resultado.projecao.map((item) => ({
      idade: item.ano,
      'Valor Total': Math.round(item.valor),
      'Total Investido': Math.round(item.contribuicaoAcumulada),
      'Rendimento': Math.round(item.rendimentoAcumulado)
    }));

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Resultado */}
            <div>
              <ResultCard
                title="Simulação Previdência Privada"
                primaryValue={resultado.saldoFinal}
                primaryLabel="Valor Acumulado"
                secondaryValue={rendimentoTotal}
                secondaryLabel="Rendimento Total"
                details={detalhes}
                onSave={salvarSimulacao}
                onExportPDF={exportarPDF}
                onNewSimulation={novaSimulacao}
              />
            </div>

            {/* Gráfico */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do Patrimônio</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={dadosGrafico}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="idade" 
                        label={{ value: 'Idade', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis 
                        tickFormatter={(value) => formatarMoeda(value)}
                        label={{ value: 'Valor (R$)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip 
                        formatter={(value: number) => [formatarMoeda(value), '']}
                        labelFormatter={(age) => `Idade: ${age} anos`}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="Valor Total" 
                        stroke="#16a34a" 
                        strokeWidth={3}
                        name="Valor Total"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Total Investido" 
                        stroke="#dc2626" 
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        name="Total Investido"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Rendimento" 
                        stroke="#2563eb" 
                        strokeWidth={2}
                        name="Rendimento"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Simulação Previdência Privada
          </h1>
          <p className="text-gray-600">
            Veja como seu investimento pode crescer ao longo dos anos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Dados da Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Idade Atual */}
              <div>
                <Label htmlFor="idadeAtual">Idade Atual</Label>
                <Input
                  id="idadeAtual"
                  type="number"
                  {...register('idadeAtual', { valueAsNumber: true })}
                  placeholder="30"
                />
                {errors.idadeAtual && (
                  <p className="text-red-600 text-sm mt-1">{errors.idadeAtual.message}</p>
                )}
              </div>

              {/* Investimento Mensal */}
              <div>
                <Label htmlFor="investimentoMensal">Investimento Mensal (R$)</Label>
                <Input
                  id="investimentoMensal"
                  type="number"
                  step="0.01"
                  {...register('investimentoMensal', { valueAsNumber: true })}
                  placeholder="500.00"
                />
                {errors.investimentoMensal && (
                  <p className="text-red-600 text-sm mt-1">{errors.investimentoMensal.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Valor que você pretende investir todo mês
                </p>
              </div>

              {/* Tempo de Contribuição */}
              <div>
                <Label htmlFor="tempoContribuicao">Tempo de Investimento (anos)</Label>
                <Input
                  id="tempoContribuicao"
                  type="number"
                  {...register('tempoContribuicao', { valueAsNumber: true })}
                  placeholder="30"
                />
                {errors.tempoContribuicao && (
                  <p className="text-red-600 text-sm mt-1">{errors.tempoContribuicao.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Por quantos anos você pretende investir
                </p>
              </div>

              {/* Taxa de Rentabilidade */}
              <div>
                <Label htmlFor="taxaRentabilidade">Taxa de Rentabilidade Anual (%)</Label>
                <Input
                  id="taxaRentabilidade"
                  type="number"
                  step="0.1"
                  {...register('taxaRentabilidade', { valueAsNumber: true })}
                  placeholder="8.0"
                />
                {errors.taxaRentabilidade && (
                  <p className="text-red-600 text-sm mt-1">{errors.taxaRentabilidade.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Rentabilidade esperada por ano (ex: 8% = inflação + 4% a 5%)
                </p>
              </div>

              {/* Botão Submit */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Simular Investimento
              </Button>
            </form>

            {/* Informações importantes */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Dicas Importantes</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Considere uma rentabilidade realista (IPCA + 4% a 6%)</li>
                <li>• Diversifique seus investimentos</li>
                <li>• Revise periodicamente sua estratégia</li>
                <li>• Considere o prazo e seu perfil de risco</li>
                <li>• Lembre-se: rentabilidade passada não garante futura</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}