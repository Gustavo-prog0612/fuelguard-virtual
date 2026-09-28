import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Type
} from 'lucide-react';
import { StyleGuideView } from '@/ui/views/styleguide/StyleGuideView';
import { GuideView } from '@/ui/views/guide/GuideView';

export const DocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design-system' | 'guide'>('design-system');

  return (
    <div className="flex flex-col h-full bg-inst-canvas text-inst-primary font-ui overflow-hidden">
      {/* Sub-navegação da Documentação */}
      <div className="h-11 bg-inst-surface border-b border-inst-border px-5 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('design-system')}
            className={`px-3 py-1 rounded-xs text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'design-system'
                ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Design System & Tipografia (4 Opções)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3 py-1 rounded-xs text-xs font-medium transition flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'bg-fuelguard-green text-white font-bold shadow-xs'
                : 'text-inst-secondary hover:text-inst-primary hover:bg-inst-subtle'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Guia Físico & Validação de Bancada</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-inst-muted">
          Referência Técnica Oficial FuelGuard
        </div>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'design-system' ? <StyleGuideView /> : <GuideView />}
      </div>
    </div>
  );
};
