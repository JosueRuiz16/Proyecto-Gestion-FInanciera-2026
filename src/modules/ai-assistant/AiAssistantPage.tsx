import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  CheckCircle2,
  ClipboardPaste,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  KeyRound,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  Wand2,
  AlertTriangle,
} from 'lucide-react';
import { useFinancialSystem } from '../../app/providers/FinancialContext';
import {
  ChatMessage,
  ExtractionResult,
  extractFinancialDataFromDocument,
  getStoredGeminiApiKey,
  hasGeminiApiKey,
  sendFinancialChatMessage,
  setStoredGeminiApiKey,
} from '../../core/ai/financialAiService';

const SAMPLE_PASTE_TEXT = `Agroindustrial del Pacífico, S. A.
Balance General y Estado de Resultados Comparativo (2023 vs 2024)
Efectivo en caja y bancos | 45,000,000 | 62,500,000
Cuentas por cobrar clientes | 110,000,000 | 135,000,000
Inventarios de mercaderías | 180,000,000 | 210,000,000
Propiedad, planta y equipo neto | 320,000,000 | 350,000,000
Cuentas por pagar proveedores | 125,000,000 | 142,000,000
Préstamos bancarios corto plazo | 95,000,000 | 105,000,000
Préstamos bancarios largo plazo | 160,000,000 | 175,000,000
Capital social | 150,000,000 | 150,000,000
Utilidades retenidas | 125,000,000 | 185,500,000
Ventas netas | 850,000,000 | 980,000,000
Costo de ventas | 540,000,000 | 615,000,000
Gastos de administración y ventas | 165,000,000 | 188,000,000
Gastos de depreciación | 28,000,000 | 32,000,000
Gastos financieros (intereses) | 34,000,000 | 38,000,000`;

const QUICK_PROMPTS = [
  'Dame un dictamen financiero ejecutivo completo',
  'Analiza la liquidez y capital de trabajo',
  'Explica el ROE DuPont de este período',
  'Evalúa el Punto de Equilibrio y riesgo GAO/GAF/GAT',
  'Analiza el Flujo de Efectivo NIC 7',
  'Revisa las alertas de Inventario (Módulo I)',
];

export const AiAssistantPage: React.FC = () => {
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

  // Configuración de API Key
  const [apiKeyInput, setApiKeyInput] = useState<string>(() => getStoredGeminiApiKey());
  const [apiKeySavedMsg, setApiKeySavedMsg] = useState<string>('');
  const [showKeyConfig, setShowKeyConfig] = useState<boolean>(() => !hasGeminiApiKey());

  // Estado de Lectura de Documentos
  const [inputMode, setInputMode] = useState<'FILE' | 'TEXT'>('FILE');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>('');
  const [autoApplyOnExtract, setAutoApplyOnExtract] = useState<boolean>(true);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<ExtractionResult | null>(null);
  const [appliedBanner, setAppliedBanner] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Estado del Chat Financiero
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `¡Hola! Soy tu **Asistente Financiero IA**. Estoy conectado en tiempo real con todos los módulos de **${state.company.name}** (${comparisonPeriod.name} vs ${activePeriod.name}).\n\nPuedes:\n1. **Subir un PDF, imagen, CSV, JSON o pegar estados financieros** a la izquierda para **autorellenar todos los módulos automáticamente**.\n2. **Preguntarme en el chat** sobre cualquier razón financiera, DuPont, punto de equilibrio, apalancamiento, flujo de efectivo o inventario.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      engine: hasGeminiApiKey() ? 'GEMINI_AI' : 'LOCAL_ENGINE',
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const handleSaveApiKey = () => {
    setStoredGeminiApiKey(apiKeyInput);
    setApiKeySavedMsg(
      apiKeyInput.trim()
        ? 'API Key de Google Gemini guardada en tu navegador.'
        : 'API Key eliminada. Usando Motor Financiero Local.'
    );
    setTimeout(() => setApiKeySavedMsg(''), 4000);
  };

  const handleProcessDocument = async () => {
    if (!selectedFile && !pastedText.trim()) return;
    setIsExtracting(true);
    setAppliedBanner(false);
    try {
      const result = await extractFinancialDataFromDocument(selectedFile, pastedText);
      setExtractionResult(result);
      if (result.success && autoApplyOnExtract) {
        applyExtractedFinancialData(result.patch);
        setAppliedBanner(true);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleApplyManual = () => {
    if (!extractionResult || !extractionResult.success) return;
    applyExtractedFinancialData(extractionResult.patch);
    setAppliedBanner(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text || isSendingChat) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await sendFinancialChatMessage(text, messages, {
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

      if (response.actionType === 'LOAD_DEMO') {
        resetDemoData();
      } else if (response.actionType === 'CLEAR_CASE') {
        clearForNewCase();
      } else if (response.statePatch) {
        applyExtractedFinancialData(response.statePatch);
      }

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engine: response.engine,
        appliedAction: response.appliedActionLabel,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 80);
    } finally {
      setIsSendingChat(false);
    }
  };

  const geminiActive = hasGeminiApiKey();

  return (
    <div className="space-y-4">
      {/* ENCABEZADO DEL MÓDULO IA */}
      <div className="glass-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-base sm:text-lg font-extrabold text-slate-900">
                J. Asistente IA: Lectura de Documentos y Chat Financiero
              </h1>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${geminiActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
              >
                {geminiActive
                  ? '✨ Google Gemini Vision + LLM Activo'
                  : '⚡ Motor Financiero Local Activo'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Sube estados financieros (PDF, Imagen, CSV, JSON o Texto) para autorellenar todos los
              módulos automáticamente y consulta al chat inteligente en tiempo real.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowKeyConfig((v) => !v)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/80 hover:bg-white border border-slate-200 text-slate-700 shadow-sm transition-all"
        >
          <KeyRound className="w-3.5 h-3.5 text-blue-600" />
          <span>{showKeyConfig ? 'Ocultar API Key' : 'Configurar API Key (Gemini)'}</span>
        </button>
      </div>

      {/* PANEL DE CONFIGURACIÓN DE GOOGLE GEMINI API KEY */}
      {showKeyConfig && (
        <div className="glass-card p-4 border-l-4 border-blue-600 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-blue-600" />
                Configuración Opcional de Google Gemini API Key (Para Visión de PDFs escaneados e Imágenes)
              </h3>
              <p className="text-[11px] text-slate-600">
                El sistema ya incluye un <strong>Motor Financiero Local</strong> que funciona sin
                API Key. Si agregas una clave gratuita de Google AI Studio, activas la lectura
                multimodal directa de cualquier PDF o fotografía con Gemini 2.5 Flash.
              </p>
            </div>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>Obtener API Key gratis en Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Pega tu clave aquí (ej. AQ.Ab8... o AIzaSy...)"
              className="flex-1 min-w-[240px] px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono"
            />
            <button
              type="button"
              onClick={handleSaveApiKey}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm"
            >
              Guardar Clave
            </button>
            {apiKeyInput && (
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  setStoredGeminiApiKey('');
                  setApiKeySavedMsg('API Key eliminada.');
                }}
                className="px-2.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200"
              >
                Limpiar
              </button>
            )}
          </div>
          {apiKeySavedMsg && (
            <p className="text-xs font-semibold text-emerald-600">{apiKeySavedMsg}</p>
          )}
        </div>
      )}

      {/* GRID PRINCIPAL: LECTURA DE DOCUMENTOS (IZQUIERDA) + CHAT IA (DERECHA) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        {/* COLUMNA IZQUIERDA: LECTURA DE DOCUMENTOS Y AUTORELLENO (5 COLUMNAS) */}
        <div className="xl:col-span-5 space-y-4">
          <div className="glass-card p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  1. Lectura de Documentos y Autorelleno
                </h2>
              </div>
              <div className="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200">
                <button
                  type="button"
                  onClick={() => setInputMode('FILE')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${inputMode === 'FILE'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Subir Archivo
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('TEXT')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${inputMode === 'TEXT'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  Pegar Texto / Tabla
                </button>
              </div>
            </div>

            {inputMode === 'FILE' ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped) setSelectedFile(dropped);
                }}
                className="cursor-pointer border-2 border-dashed border-blue-300 hover:border-blue-500 rounded-2xl p-6 text-center bg-blue-50/40 transition-all space-y-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp,.csv,.txt,.json"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setSelectedFile(f);
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-bold text-blue-700">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Haz clic para cambiar archivo
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Arrastra aquí tu Estado Financiero o haz clic para seleccionar
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Soporta <strong>PDF</strong> (ej. Auditados PwC / Corporación Agrícola),{' '}
                      <strong>Imágenes</strong> (PNG/JPG), <strong>CSV</strong>,{' '}
                      <strong>JSON</strong> o <strong>TXT</strong>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-600">
                    Pega cuentas con sus saldos (Cuenta | Año Base | Año Activo) o JSON:
                  </span>
                  <button
                    type="button"
                    onClick={() => setPastedText(SAMPLE_PASTE_TEXT)}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Cargar texto de prueba</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Ejemplo:&#10;Efectivo en caja y bancos | 45,000,000 | 62,500,000&#10;Cuentas por cobrar | 110,000,000 | 135,000,000..."
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-xs font-mono"
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoApplyOnExtract}
                onChange={(e) => setAutoApplyOnExtract(e.target.checked)}
                className="rounded border-slate-300 text-blue-600"
              />
              <span>
                <strong>Autorellenar todos los módulos inmediatamente</strong> al finalizar la
                lectura del documento
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isExtracting || (!selectedFile && !pastedText.trim())}
                onClick={handleProcessDocument}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analizando documento y estructurando módulos...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>Leer Documento con IA y Autorellenar Sistema</span>
                  </>
                )}
              </button>

              {(selectedFile || pastedText) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setPastedText('');
                    setExtractionResult(null);
                    setAppliedBanner(false);
                  }}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                  title="Limpiar selección"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* RESULTADO DE LA EXTRACCIÓN */}
            {extractionResult && (
              <div
                className={`p-3.5 rounded-2xl border space-y-2.5 ${extractionResult.success
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-amber-50/80 border-amber-300'
                  }`}
              >
                <div className="flex items-start gap-2">
                  {extractionResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900">
                      {extractionResult.success
                        ? 'Extracción Financiera Completada'
                        : 'Atención en la Extracción'}
                    </p>
                    <p className="text-xs text-slate-700">{extractionResult.summary}</p>
                  </div>
                </div>

                {extractionResult.warnings && extractionResult.warnings.length > 0 && (
                  <div className="text-[11px] text-amber-700 bg-amber-100/70 px-2.5 py-1.5 rounded-lg">
                    {extractionResult.warnings.map((w, i) => (
                      <p key={i}>{w}</p>
                    ))}
                  </div>
                )}

                {extractionResult.detectedModules.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                      Módulos Autorellenados y Sincronizados:
                    </p>
                    <ul className="grid grid-cols-1 gap-1">
                      {extractionResult.detectedModules.map((mod) => (
                        <li
                          key={mod}
                          className="text-[11px] font-semibold text-slate-800 flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{mod}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {extractionResult.success && !appliedBanner && (
                  <button
                    type="button"
                    onClick={handleApplyManual}
                    className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
                  >
                    Aplicar Datos Extraídos a Todos los Módulos Ahora
                  </button>
                )}

                {appliedBanner && (
                  <div className="pt-1 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-emerald-700">
                      ✅ ¡Todos los módulos ya están actualizados! Ir a:
                    </span>
                    <Link
                      to="/finanzas/estados"
                      className="px-2 py-1 rounded-lg bg-white text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-50"
                    >
                      A. Estados Financieros →
                    </Link>
                    <Link
                      to="/finanzas/analisis"
                      className="px-2 py-1 rounded-lg bg-white text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-50"
                    >
                      B. Análisis y DuPont →
                    </Link>
                    <Link
                      to="/inventario"
                      className="px-2 py-1 rounded-lg bg-white text-blue-700 border border-blue-200 text-[11px] font-bold hover:bg-blue-50"
                    >
                      I. Inventario →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RESUMEN DE DATOS ACTUALMENTE CARGADOS EN EL SISTEMA */}
          <div className="glass-card p-4 space-y-2.5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-900">
                Estado Actual en Memoria ({state.company.name})
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white/60 border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold">
                  Total Activos ({activePeriod.name})
                </p>
                <p className="font-extrabold text-slate-900">
                  {state.company.currency} {activeTotals.totalActivos.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold">
                  Ventas Netas ({activePeriod.name})
                </p>
                <p className="font-extrabold text-blue-700">
                  {state.company.currency} {activeTotals.ventasNetas.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold">
                  Utilidad Neta ({activePeriod.name})
                </p>
                <p className="font-extrabold text-emerald-700">
                  {state.company.currency} {activeTotals.utilidadNeta.toLocaleString()}
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/60 border border-slate-200/80">
                <p className="text-[10px] text-slate-500 font-semibold">Cuentas / Inventario</p>
                <p className="font-extrabold text-slate-900">
                  {state.accounts.length} cuentas • {state.inventoryProducts.length} ítems
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: APARTADO DE CHAT FINANCIERO IA (7 COLUMNAS) */}
        <div className="xl:col-span-7">
          <div className="glass-card p-4 sm:p-5 flex flex-col h-[620px]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    2. Chat Financiero IA Interactivo
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    Conectado con los 9 módulos • Analiza razones, DuPont, flujo de caja, C-V-U y
                    ejecuta comandos
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setMessages([
                    {
                      id: `welcome-${Date.now()}`,
                      role: 'assistant',
                      content: `Historial reiniciado. ¿Qué deseas analizar hoy sobre **${state.company.name}**?`,
                      timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                    },
                  ])
                }
                className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50"
              >
                Limpiar chat
              </button>
            </div>

            {/* CHIPS DE PREGUNTAS RÁPIDAS */}
            <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/60 shrink-0">
              {QUICK_PROMPTS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleSendMessage(q)}
                  className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* HISTORIAL DE MENSAJES */}
            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-sm ${msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-white/90 text-slate-800 border border-slate-200/90 rounded-bl-sm'
                      }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                    {msg.appliedAction && (
                      <div className="mt-2 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{msg.appliedAction}</span>
                      </div>
                    )}
                    <div
                      className={`mt-1 text-[10px] flex items-center justify-end gap-1.5 ${msg.role === 'user' ? 'text-blue-100' : 'text-slate-400'
                        }`}
                    >
                      {msg.engine && (
                        <span>
                          {msg.engine === 'GEMINI_AI' ? '✨ Gemini AI' : '⚡ Motor Financiero'} •
                        </span>
                      )}
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
              {isSendingChat && (
                <div className="flex justify-start">
                  <div className="rounded-2xl px-3.5 py-2.5 bg-white/90 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Calculando y redactando análisis financiero...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* BARRA DE ENTRADA DEL CHAT */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="pt-2.5 border-t border-slate-200/80 flex items-center gap-2"
            >
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Escribe tu consulta financiera o pide 'cargar ejemplo' / 'analiza DuPont'..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="submit"
                disabled={isSendingChat || !chatInput.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

