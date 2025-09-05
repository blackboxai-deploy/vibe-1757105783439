'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import ResultCard from '@/components/ResultCard';
import { calcularRescisaoTrabalhista } from '@/lib/calculations';
import { exportarRescisaoPdf } from '@/lib/pdf-export';
import { useSimulations } from '@/hooks/useSimulations';
import { RescisaoTrabalhista, TipoRescisao } from '@/types';

// Schema de validação
const schemaRescisao = z.object({
  salarioAtual: z.number().min(1320, 'Salário deve ser pelo menos o salário mínimo').max(100000, 'Salário muito alto'),
  tempoEmpresaAnos: z.number().min(0, 'Tempo não pode ser negativo').max(50, 'Tempo muito alto'),
  tempoEmpresaMeses: z.number().min(0, 'Meses não podem ser negativos').max(11, 'Máximo 11 meses'),
  feriasVencidas: z.number().min(0, 'Não pode ser negativo').max(60, 'Máximo 60 dias'),
  tipoRescisao: z.enum(['demissao', 'sem-justa-causa', 'justa-causa', 'acordo'])
});

type FormDataRescisao = z.infer<typeof schemaRescisao>;

const tiposRescisao = [
  { value: 'sem-justa-causa', label: 'Demissão sem justa causa' },
  { value: 'demissao', label: 'Pedido de demissão' },
  { value: 'acordo', label: 'Demissão em comum acordo' },
  { value: 'justa-causa', label: 'Demissão por justa causa' }
];

export default function RescisaoPage() {
  const [resultado, setResultado] = useState<RescisaoTrabalhista | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const { adicionarSimulacaoRescisao } = useSimulations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FormDataRescisao>({
    resolver: zodResolver(schemaRescisao),
    defaultValues: {
      tipoRescisao: 'sem-justa-causa',
      tempoEmpresaMeses: 0,
      feriasVencidas: 0
    }
  });

  const tipoRescisao = watch('tipoRescisao');
  const tempoAnos = watch('tempoEmpresaAnos') || 0;
  const tempoMeses = watch('tempoEmpresaMeses') || 0;

  const onSubmit = (data: FormDataRescisao) => {
    const tempoTotalMeses = (data.tempoEmpresaAnos * 12) + data.tempoEmpresaMeses;
    
    const simulacao = calcularRescisaoTrabalhista(
      data.salarioAtual,
      tempoTotalMeses,
      data.feriasVencidas,
      data.tipoRescisao
    );
    
    setResultado(simulacao);
    setMostrarResultado(true);
  };

  const salvarSimulacao = () => {
    if (resultado) {
      adicionarSimulacaoRescisao(resultado);
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
      exportarRescisaoPdf(resultado);
    }
  };

  if (mostrarResultado && resultado) {
    const detalhes = [
      {
        label: 'Salário atual',
        value: resultado.salarioAtual
      },
      {
        label: 'Tempo de empresa',
        value: `${Math.floor(resultado.tempoEmpresa / 12)} anos e ${resultado.tempoEmpresa % 12} meses`
      },
      {
        label: 'Tipo de rescisão',
        value: tiposRescisao.find(t => t.value === resultado.tipoRescisao)?.label || resultado.tipoRescisao
      },
      resultado.valores.avisoPrevio > 0 && {
        label: 'Aviso prévio',
        value: resultado.valores.avisoPrevio
      },
      resultado.valores.feriasVencidas > 0 && {
        label: 'Férias vencidas',
        value: resultado.valores.feriasVencidas
      },
      resultado.valores.feriasProporcionais > 0 && {
        label: 'Férias proporcionais',
        value: resultado.valores.feriasProporcionais
      },
      resultado.valores.decimoTerceiroPropcional > 0 && {
        label: '13º salário proporcional',
        value: resultado.valores.decimoTerceiroPropcional
      },
      resultado.valores.fgts > 0 && {
        label: 'FGTS disponível para saque',
        value: resultado.valores.fgts
      },
      resultado.valores.multaFgts > 0 && {
        label: 'Multa do FGTS',
        value: resultado.valores.multaFgts
      }
    ].filter(Boolean) as Array<{label: string, value: number}>;

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ResultCard
            title="Cálculo de Rescisão Trabalhista"
            primaryValue={resultado.valores.total}
            primaryLabel="Total a Receber"
            details={detalhes}
            onSave={salvarSimulacao}
            onExportPDF={exportarPDF}
            onNewSimulation={novaSimulacao}
          />

          {/* Explicação dos valores */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Entenda seus Direitos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Demissão sem Justa Causa</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Aviso prévio (30 dias + 3 dias por ano)</li>
                    <li>• 13º salário proporcional</li>
                    <li>• Férias proporcionais + 1/3</li>
                    <li>• FGTS + multa de 40%</li>
                    <li>• Seguro-desemprego</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Pedido de Demissão</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 13º salário proporcional</li>
                    <li>• Férias proporcionais + 1/3</li>
                    <li>• Férias vencidas (se houver)</li>
                    <li>• Sem direito ao FGTS</li>
                    <li>• Sem seguro-desemprego</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Comum Acordo</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• 50% do aviso prévio</li>
                    <li>• 13º salário proporcional</li>
                    <li>• Férias proporcionais + 1/3</li>
                    <li>• 80% do FGTS + multa 20%</li>
                    <li>• Sem seguro-desemprego</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-gray-900">Justa Causa</h3>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Apenas férias vencidas</li>
                    <li>• Sem 13º proporcional</li>
                    <li>• Sem aviso prévio</li>
                    <li>• Sem direito ao FGTS</li>
                    <li>• Sem seguro-desemprego</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
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
            Cálculo de Rescisão Trabalhista
          </h1>
          <p className="text-gray-600">
            Calcule seus direitos trabalhistas conforme o tipo de rescisão
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Dados do Contrato</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Salário Atual */}
              <div>
                <Label htmlFor="salarioAtual">Salário Atual (R$)</Label>
                <Input
                  id="salarioAtual"
                  type="number"
                  step="0.01"
                  {...register('salarioAtual', { valueAsNumber: true })}
                  placeholder="3500.00"
                />
                {errors.salarioAtual && (
                  <p className="text-red-600 text-sm mt-1">{errors.salarioAtual.message}</p>
                )}
              </div>

              {/* Tempo de Empresa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tempoEmpresaAnos">Anos de Empresa</Label>
                  <Input
                    id="tempoEmpresaAnos"
                    type="number"
                    {...register('tempoEmpresaAnos', { valueAsNumber: true })}
                    placeholder="2"
                  />
                  {errors.tempoEmpresaAnos && (
                    <p className="text-red-600 text-sm mt-1">{errors.tempoEmpresaAnos.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="tempoEmpresaMeses">Meses Adicionais</Label>
                  <Input
                    id="tempoEmpresaMeses"
                    type="number"
                    {...register('tempoEmpresaMeses', { valueAsNumber: true })}
                    placeholder="6"
                  />
                  {errors.tempoEmpresaMeses && (
                    <p className="text-red-600 text-sm mt-1">{errors.tempoEmpresaMeses.message}</p>
                  )}
                </div>
              </div>

              {/* Mostrar tempo total */}
              {(tempoAnos > 0 || tempoMeses > 0) && (
                <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  Tempo total: {tempoAnos} anos e {tempoMeses} meses
                </div>
              )}

              {/* Férias Vencidas */}
              <div>
                <Label htmlFor="feriasVencidas">Férias Vencidas (dias)</Label>
                <Input
                  id="feriasVencidas"
                  type="number"
                  {...register('feriasVencidas', { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.feriasVencidas && (
                  <p className="text-red-600 text-sm mt-1">{errors.feriasVencidas.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Dias de férias em atraso que você ainda não tirou
                </p>
              </div>

              {/* Tipo de Rescisão */}
              <div>
                <Label>Tipo de Rescisão</Label>
                <Select 
                  value={tipoRescisao} 
                  onValueChange={(value) => setValue('tipoRescisao', value as TipoRescisao)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de rescisão" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposRescisao.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.tipoRescisao && (
                  <p className="text-red-600 text-sm mt-1">{errors.tipoRescisao.message}</p>
                )}
              </div>

              {/* Botão Submit */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Calcular Rescisão
              </Button>
            </form>

            {/* Informações importantes */}
            <div className="mt-8 p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-orange-800 space-y-1">
                <li>• Os cálculos seguem a legislação trabalhista brasileira</li>
                <li>• Valores podem variar conforme convenções coletivas</li>
                <li>• Consulte um advogado trabalhista para casos específicos</li>
                <li>• FGTS inclui depósitos mensais de 8% sobre o salário</li>
                <li>• Férias incluem adicional de 1/3 constitucional</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}