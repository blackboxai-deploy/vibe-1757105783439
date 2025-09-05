'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatarMoeda } from '@/lib/calculations';

interface ResultCardProps {
  title: string;
  primaryValue: number;
  primaryLabel: string;
  secondaryValue?: number;
  secondaryLabel?: string;
  details?: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
  }>;
  onSave?: () => void;
  onExportPDF?: () => void;
  showExportPDF?: boolean;
  onNewSimulation?: () => void;
  className?: string;
}

export default function ResultCard({
  title,
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  details = [],
  onSave,
  onExportPDF,
  onNewSimulation,
  showExportPDF = true,
  className = ''
}: ResultCardProps) {
  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">
          {title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Valor Principal */}
        <div className="text-center bg-green-50 rounded-lg p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {typeof primaryValue === 'number' ? formatarMoeda(primaryValue) : primaryValue}
          </div>
          <p className="text-gray-600 font-medium">
            {primaryLabel}
          </p>
        </div>

        {/* Valor Secundário */}
        {secondaryValue !== undefined && secondaryLabel && (
          <div className="text-center bg-gray-50 rounded-lg p-4">
            <div className="text-xl font-semibold text-gray-800 mb-1">
              {typeof secondaryValue === 'number' ? formatarMoeda(secondaryValue) : secondaryValue}
            </div>
            <p className="text-gray-600 text-sm">
              {secondaryLabel}
            </p>
          </div>
        )}

        {/* Detalhes */}
        {details.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900 text-center">
              Detalhamento
            </h3>
            <div className="space-y-2">
              {details.map((detail, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                  <span className={`text-sm ${detail.highlight ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                    {detail.label}
                  </span>
                  <span className={`${detail.highlight ? 'font-bold text-green-600' : 'text-gray-800'}`}>
                    {typeof detail.value === 'number' ? formatarMoeda(detail.value) : detail.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ações */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          {onNewSimulation && (
            <Button
              onClick={onNewSimulation}
              variant="outline"
              className="flex-1"
            >
              Nova Simulação
            </Button>
          )}
          
          {onSave && (
            <Button
              onClick={onSave}
              variant="outline"
              className="flex-1"
            >
              Salvar Simulação
            </Button>
          )}
          
          {onExportPDF && showExportPDF && (
            <Button
              onClick={onExportPDF}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Exportar PDF
            </Button>
          )}
        </div>

        {/* Aviso Legal */}
        <div className="mt-6 p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-amber-800 text-center">
            <strong>Importante:</strong> Os valores apresentados são estimativos e podem variar conforme 
            mudanças na legislação, regras previdenciárias e condições econômicas. 
            Consulte sempre um especialista para orientações específicas.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}