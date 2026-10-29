import React, { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bot,
  CheckCircle2,
  Loader2,
  Maximize2,
  Send,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import {
  ChatMessage,
  extractFinancialDataFromDocument,
  hasGeminiApiKey,
  sendFinancialChatMessage,
} from '../../core/ai/financialAiService';

export const FloatingAiChat: React.FC = () => {
  const location = useLocation();
  const {
    state,
    activePeriod,
    comparisonPeriod,
    activeTotals,
    comparisonTotals,
    ratios,
    duPont,
    cvuAndLeverage,
    cashFlowResult,
    masterBudgetAndProforma,
    inventoryResult,
    applyExtractedFinancialData,
    resetDemoData,
    clearForNewCase,
  } = useFinancialSystem();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'float-welcome',
      role: 'assistant',
      content: `Hola, soy tu **Asistente IA Financiero**. Puedes preguntarme sobre el módulo actual o subir un documento aquí mismo para autorellenar todos los módulos.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  // Si ya estamos en la pantalla dedicada /ia-asistente, ocultar el botón flotante para no duplicar
  if (location.pathname.startsWith('/ia-asistente')) {
    return null;
  }

  const handleSend = async (customText?: string) => {
    const text = (customText ?? input).trim();
    if (!text || busy) return;

    const userMsg: ChatMessage = {
      id: `f-usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput('');
    setBusy(true);

    try {
      const res = await sendFinancialChatMessage(text, messages, {
        state,
        activePeriod,
        comparisonPeriod,
        activeTotals,
        comparisonTotals,
        ratios,
        duPont,
        cvuAndLeverage,
        cashFlowResult,
        masterBudgetAndProforma,
        inventoryResult,
      });

      if (res.actionType === 'LOAD_DEMO') {
        resetDemoData();
      } else if (res.actionType === 'CLEAR_CASE') {
        clearForNewCase();
      } else if (res.statePatch) {
        applyExtractedFinancialData(res.statePatch);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `f-ast-${Date.now()}`,
          role: 'assistant',
          content: res.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine: res.engine,
          appliedAction: res.appliedActionLabel,
        },
      ]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    } finally {
      setBusy(false);
    }
  };

  const handleQuickFileUpload = async (file: File) => {
    setBusy(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `f-file-${Date.now()}`,
        role: 'user',
        content: `📄 Subiendo documento para autorelleno: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);

    try {
      const result = await extractFinancialDataFromDocument(file);
      if (result.success) {
        applyExtractedFinancialData(result.patch);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `f-file-res-${Date.now()}`,
          role: 'assistant',
          content: result.summary,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          engine: result.engine === 'GEMINI_AI' ? 'GEMINI_AI' : 'LOCAL_ENGINE',
          appliedAction: result.success
            ? 'Todos los módulos autorellenados automáticamente'
            : undefined,
        },
      ]);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 60);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-extrabold shadow-xl ring-2 ring-white/80 dark:ring-emerald-400/50 transition-transform hover:scale-105 active:scale-95"
          title="Abrir Asistente IA y Lectura de Documentos"
        >
          <Sparkles className="w-4 h-4" />
          <span>Asistente IA / Autorelleno</span>
        </button>
      ) : (
        <div className="w-[340px] sm:w-[400px] h-[510px] glass-card !rounded-3xl shadow-2xl border border-blue-200 dark:border-emerald-500/40 flex flex-col overflow-hidden animate-fadeIn">
          {/* Cabecera del widget flotante */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <p className="text-xs font-extrabold leading-tight">Asistente Financiero IA</p>
                <p className="text-[10px] text-blue-100 leading-tight">
                  {hasGeminiApiKey() ? 'Gemini AI Activo' : 'Motor Financiero Activo'} •{' '}
                  {activePeriod.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <Link
                to="/ia-asistente"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white"
                title="Abrir módulo completo de IA y Lectura de Documentos"
              >
                <Maximize2 className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Botones rápidos de acción */}
          <div className="px-3 py-2 bg-slate-50/90 dark:bg-slate-900/80 border-b border-slate-200/70 flex items-center gap-1.5 overflow-x-auto shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleQuickFileUpload(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-600 text-white shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Subir Doc y Autorellenar</span>
            </button>
            <button
              type="button"
              onClick={() => handleSend('Dame un dictamen financiero ejecutivo')}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-blue-700 border border-blue-200"
            >
              Dictamen Ejecutivo
            </button>
            <button
              type="button"
              onClick={() => handleSend('Analiza el ROE DuPont')}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-blue-700 border border-blue-200"
            >
              DuPont
            </button>
          </div>

          {/* Lista de mensajes */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${m.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/95 text-slate-800 border border-slate-200 rounded-bl-sm'
                    }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  {m.appliedAction && (
                    <div className="mt-1.5 px-2 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{m.appliedAction}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-3 py-2 bg-white border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Procesando con IA...</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Entrada de mensaje */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-2.5 border-t border-slate-200/80 flex items-center gap-1.5 bg-white/80"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregunta sobre este módulo o sube un doc..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

