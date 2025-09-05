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
import { calcularAposentadoriaINSS, formatarData } from '@/lib/calculations';
import { exportarINSSPdf } from '@/lib/pdf-export';
import { useSimulations } from '@/hooks/useSimulations';
import { Usuario, SimulacaoINSS } from '@/types';

// Schema de validação
const schemaINSS = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  idade: z.number().min(16, 'Idade mínima é 16 anos').max(80, 'Idade máxima é 80 anos'),
  tempoContribuicao: z.number().min(0, 'Tempo não pode ser negativo').max(50, 'Tempo máximo é 50 anos'),
  salarioMedio: z.number().min(1320, 'Salário deve ser pelo menos o salário mínimo').max(50000, 'Salário muito alto'),
  genero: z.enum(['masculino', 'feminino'])
});

type FormDataINSS = z.infer<typeof schemaINSS>;

export default function INSSPage() {
  const [resultado, setResultado] = useState<SimulacaoINSS | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const { adicionarSimulacaoINSS } = useSimulations();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset
  } = useForm<FormDataINSS>({
    resolver: zodResolver(schemaINSS),
    defaultValues: {
      genero: 'masculino'
    }
  });

  const genero = watch('genero');

  const onSubmit = (data: FormDataINSS) => {
    const usuario: Usuario = {
      nome: data.nome,
      idade: data.idade,
      tempoContribuicao: data.tempoContribuicao,
      salarioMedio: data.salarioMedio,
      genero: data.genero
    };

    const simulacao = calcularAposentadoriaINSS(usuario);
    setResultado(simulacao);
    setMostrarResultado(true);
  };

  const salvarSimulacao = () => {
    if (resultado) {
      adicionarSimulacaoINSS(resultado);
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
      exportarINSSPdf(resultado);
    }
  };

  if (mostrarResultado && resultado) {
    const detalhes = [
      {
        label: 'Idade atual',
        value: `${resultado.usuario.idade} anos`
      },
      {
        label: 'Tempo de contribuição atual',
        value: `${resultado.usuario.tempoContribuicao} anos`
      },
      {
        label: 'Salário médio',
        value: resultado.usuario.salarioMedio
      },
      {
        label: 'Data estimada da aposentadoria',
        value: formatarData(resultado.dataAposentadoria)
      },
      {
        label: 'Idade na aposentadoria',
        value: `${resultado.idadeAposentadoria} anos`
      },
      {
        label: 'Regra aplicada',
        value: resultado.regra
      }
    ];

    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ResultCard
            title="Resultado da Simulação INSS"
            primaryValue={resultado.valorEstimado}
            primaryLabel="Valor Estimado da Aposentadoria"
            secondaryValue={resultado.tempoRestante}
            secondaryLabel={`${resultado.tempoRestante === 1 ? 'Ano restante' : 'Anos restantes'} para aposentar`}
            details={detalhes}
            onSave={salvarSimulacao}
            onExportPDF={exportarPDF}
            onNewSimulation={novaSimulacao}
          />
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
            Calculadora de Aposentadoria INSS
          </h1>
          <p className="text-gray-600">
            Descubra quando você poderá se aposentar e qual será o valor estimado do seu benefício
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome */}
              <div>
                <Label htmlFor="nome">Nome Completo</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Digite seu nome completo"
                />
                {errors.nome && (
                  <p className="text-red-600 text-sm mt-1">{errors.nome.message}</p>
                )}
              </div>

              {/* Idade */}
              <div>
                <Label htmlFor="idade">Idade Atual</Label>
                <Input
                  id="idade"
                  type="number"
                  {...register('idade', { valueAsNumber: true })}
                  placeholder="35"
                />
                {errors.idade && (
                  <p className="text-red-600 text-sm mt-1">{errors.idade.message}</p>
                )}
              </div>

              {/* Gênero */}
              <div>
                <Label>Gênero</Label>
                <Select 
                  value={genero} 
                  onValueChange={(value) => setValue('genero', value as 'masculino' | 'feminino')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masculino">Masculino</SelectItem>
                    <SelectItem value="feminino">Feminino</SelectItem>
                  </SelectContent>
                </Select>
                {errors.genero && (
                  <p className="text-red-600 text-sm mt-1">{errors.genero.message}</p>
                )}
              </div>

              {/* Tempo de Contribuição */}
              <div>
                <Label htmlFor="tempoContribuicao">Tempo de Contribuição (anos)</Label>
                <Input
                  id="tempoContribuicao"
                  type="number"
                  step="0.5"
                  {...register('tempoContribuicao', { valueAsNumber: true })}
                  placeholder="15"
                />
                {errors.tempoContribuicao && (
                  <p className="text-red-600 text-sm mt-1">{errors.tempoContribuicao.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Inclua todo o tempo que você já contribuiu para o INSS
                </p>
              </div>

              {/* Salário Médio */}
              <div>
                <Label htmlFor="salarioMedio">Salário Médio de Contribuição (R$)</Label>
                <Input
                  id="salarioMedio"
                  type="number"
                  step="0.01"
                  {...register('salarioMedio', { valueAsNumber: true })}
                  placeholder="3500.00"
                />
                {errors.salarioMedio && (
                  <p className="text-red-600 text-sm mt-1">{errors.salarioMedio.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Base de cálculo será limitada ao teto do INSS (R$ 7.786,02)
                </p>
              </div>

              {/* Botão Submit */}
              <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
                Calcular Aposentadoria
              </Button>
            </form>

            {/* Informações importantes */}
            <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Informações Importantes</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Idade mínima: 65 anos (homens) e 62 anos (mulheres)</li>
                <li>• Tempo mínimo de contribuição: 15 anos</li>
                <li>• Valor mínimo: 1 salário mínimo</li>
                <li>• Valor máximo: R$ 7.786,02 (teto do INSS 2024)</li>
                <li>• Cálculo baseado na regra de transição por idade</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}