import React, { useState } from 'react';
import { 
  BookOpenCheck, 
  Type,
  FileCode2
} from 'lucide-react';
import { StyleGuideView } from '@/ui/views/styleguide/StyleGuideView';
import { GuideView } from '@/ui/views/guide/GuideView';

export const DocsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'design-system' | 'guide'>('design-system');

  return (
    <div className="flex flex-col h-full bg-[#F4F5F7] dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-ui overflow-hidden">
      {/* Sub-navegação da Documentação (Permity Floating Bar) */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200/80 dark:border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700/80">
          <button
            onClick={() => setActiveTab('design-system')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'design-system'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>Design System & Tipografia</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpenCheck className="w-3.5 h-3.5" />
            <span>Guia Físico & Validação</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <FileCode2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Referência Técnica Oficial FuelGuard</span>
        </div>
      </div>

      {/* Conteúdo da Aba Selecionada */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'design-system' ? <StyleGuideView /> : <GuideView />}
      </div>
    </div>
  );
};
