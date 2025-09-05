'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import { useSimulations } from '@/hooks/useSimulations';

export default function Home() {
  const { estatisticas } = useSimulations();

  const calculadoras = [
    {
      href: '/inss',
      title: 'Aposentadoria INSS',
      description: 'Calcule quando você pode se aposentar e qual será o valor estimado do seu benefício pelo INSS.',
      icon: '🏦',
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      textColor: 'text-blue-600'
    },
    {
      href: '/previdencia',
      title: 'Previdência Privada',
      description: 'Simule o crescimento do seu investimento em previdência privada ao longo dos anos.',
      icon: '📈',
      color: 'bg-green-50 hover:bg-green-100 border-green-200',
      textColor: 'text-green-600'
    },
    {
      href: '/rescisao',
      title: 'Rescisão Trabalhista',
      description: 'Calcule os valores que você tem direito em caso de rescisão do contrato de trabalho.',
      icon: '📋',
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      textColor: 'text-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meu Futuro Financeiro
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Planeje sua aposentadoria, simule investimentos e calcule seus direitos trabalhistas 
            de forma simples e gratuita.
          </p>
        </div>

        {/* Estatísticas do Usuário */}
        {estatisticas.totalSimulacoes > 0 && (
          <Card className="max-w-md mx-auto mb-8">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Seu Histórico</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-2">
                {estatisticas.totalSimulacoes}
              </div>
              <p className="text-gray-600">
                Simulações realizadas
              </p>
              {estatisticas.ultimaSimulacao && (
                <p className="text-sm text-gray-500 mt-2">
                  Última: {estatisticas.ultimaSimulacao.toLocaleDateString('pt-BR')}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid de Calculadoras */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {calculadoras.map((calc) => (
            <Card key={calc.href} className={`transition-all duration-200 ${calc.color} hover:shadow-lg`}>
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">
                  {calc.icon}
                </div>
                <CardTitle className={`text-xl ${calc.textColor}`}>
                  {calc.title}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {calc.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  asChild
                  className="w-full bg-white hover:bg-gray-50 text-gray-900 border shadow-sm"
                >
                  <Link href={calc.href}>
                    Calcular Agora
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recursos */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">
            Por que usar o Meu Futuro Financeiro?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">✓</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Cálculos Precisos</h3>
              <p className="text-gray-600 text-sm">
                Baseado nas regras atuais do INSS e legislação trabalhista brasileira
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">💾</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Histórico Salvo</h3>
              <p className="text-gray-600 text-sm">
                Suas simulações são salvas automaticamente para consulta posterior
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">📄</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Relatórios em PDF</h3>
              <p className="text-gray-600 text-sm">
                Exporte seus resultados em PDF para arquivo ou impressão
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé com informações */}
        <footer className="text-center mt-12 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 text-sm mb-2">
            <strong>Desenvolvido para ajudar no seu planejamento financeiro</strong>
          </p>
          <p className="text-xs text-gray-500">
            Os cálculos são baseados na legislação vigente e podem sofrer alterações. 
            Sempre consulte um especialista para decisões importantes.
          </p>
        </footer>
      </main>
    </div>
  );
}