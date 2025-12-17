import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, 
  Wallet, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Ticket, 
  ArrowDownCircle, 
  RotateCcw,
  Save,
  TrendingUp,
  Database,
  Trash2,
  Settings,
  Cloud,
  CheckCircle2,
  XCircle,
  PieChart as PieChartIcon
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

import { FinancialData, CalculationResult, ClosingRecord, CloudStatus } from './types';
import { getHistory, saveRecord, clearHistory, getSettings, saveSettings } from './services/storageService';
import { syncToSheet } from './services/sheetsService';
import { InputCard } from './components/InputCard';
import { SummaryCard } from './components/SummaryCard';
import { SettingsModal } from './components/SettingsModal';

const INITIAL_DATA: FinancialData = {
  openingBalance: 0,
  salesCash: 0,
  salesCredit: 0,
  salesDebit: 0,
  salesPix: 0,
  salesVoucher: 0,
  expenses: 0,
  closingCount: 0,
};

// Official Brand Palette
const COLORS = ['#025939', '#5A8C7A', '#D9B68B', '#0D0D0D', '#8C8C8C'];

const App: React.FC = () => {
  const [data, setData] = useState<FinancialData>(INITIAL_DATA);
  const [history, setHistory] = useState<ClosingRecord[]>([]);
  
  // Settings & Cloud Sync
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sheetUrl, setSheetUrl] = useState("");
  const [cloudStatus, setCloudStatus] = useState<CloudStatus>(CloudStatus.IDLE);

  // Load history and settings on mount
  useEffect(() => {
    setHistory(getHistory());
    const savedSettings = getSettings();
    setSheetUrl(savedSettings.sheetUrl);
  }, []);

  const handleSaveSettings = (url: string) => {
    setSheetUrl(url);
    saveSettings({ sheetUrl: url });
  };

  // Calculate totals whenever data changes
  const results: CalculationResult = useMemo(() => {
    const totalRevenue = 
      data.salesCash + 
      data.salesCredit + 
      data.salesDebit + 
      data.salesPix + 
      data.salesVoucher;

    // Expected physical cash in drawer = Start + Cash Sales - Expenses
    const totalSystemCash = data.openingBalance + data.salesCash - data.expenses;
    
    // Difference = Actual Count - Expected
    const difference = data.closingCount - totalSystemCash;

    let status: CalculationResult['status'] = 'balanced';
    if (difference > 0.05) status = 'surplus';
    if (difference < -0.05) status = 'shortage';

    return {
      totalRevenue,
      totalSystemCash: Math.max(0, totalSystemCash), // Should logically not be negative unless debt
      difference,
      status
    };
  }, [data]);

  const chartData = useMemo(() => [
    { name: 'Dinheiro', value: data.salesCash },
    { name: 'PIX', value: data.salesPix },
    { name: 'Crédito', value: data.salesCredit },
    { name: 'Débito', value: data.salesDebit },
    { name: 'Voucher', value: data.salesVoucher },
  ].filter(d => d.value > 0), [data]);

  const handleInputChange = (field: keyof FinancialData, value: number) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    if (window.confirm("Tem certeza que deseja limpar os dados da tela atual?")) {
      setData(INITIAL_DATA);
      setCloudStatus(CloudStatus.IDLE);
    }
  };

  const handleSaveToHistory = async () => {
    if (results.totalRevenue === 0 && data.openingBalance === 0) {
      alert("Preencha os dados antes de salvar.");
      return;
    }
    
    const newRecord: ClosingRecord = {
      ...data,
      ...results,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    // 1. Save Local
    const updatedHistory = saveRecord(newRecord);
    setHistory(updatedHistory);

    // 2. Sync to Cloud (if URL exists)
    if (sheetUrl) {
      setCloudStatus(CloudStatus.SYNCING);
      const success = await syncToSheet(newRecord, sheetUrl);
      if (success) {
        setCloudStatus(CloudStatus.SUCCESS);
        setTimeout(() => setCloudStatus(CloudStatus.IDLE), 3000);
      } else {
        setCloudStatus(CloudStatus.ERROR);
      }
    } else {
      alert("Fechamento salvo localmente! Para salvar na planilha, configure o link no ícone de engrenagem.");
    }
    
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleClearHistory = () => {
    const updated = clearHistory();
    setHistory(updated);
  };

  return (
    <div className="min-h-screen pb-12 bg-[#F2F2F2]">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentUrl={sheetUrl}
        onSave={handleSaveSettings}
      />

      {/* Header - Using #025939 (Deep Green) */}
      <header className="bg-[#025939] text-white pt-8 pb-16 px-4 sm:px-6 lg:px-8 shadow-xl border-b-4 border-[#D9B68B]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-lg shrink-0">
              <img 
                src="https://i.postimg.cc/44zt2nHK/Logo.png" 
                alt="Logo Atacadão do Natural" 
                className="h-24 w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight tracking-tight text-white">
                Atacadão do Natural
              </h1>
              <p className="text-[#D9B68B] font-semibold tracking-wide flex items-center gap-2">
                Sistema PDV
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#014029] hover:bg-[#002b1b] text-white transition-colors text-sm font-medium border border-[#5A8C7A]"
              title="Configurar Planilha"
            >
              <Settings size={18} />
              {sheetUrl ? <span className="text-[#D9B68B]">Conectado</span> : "Configurar"}
            </button>
             <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#014029] hover:bg-[#002b1b] text-white transition-colors text-sm font-medium border border-[#5A8C7A]"
            >
              <RotateCcw size={16} />
              Limpar Tela
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        
        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <SummaryCard title="Faturamento Total" value={results.totalRevenue} highlight="neutral" />
          <SummaryCard title="Dinheiro em Caixa (Sistema)" value={results.totalSystemCash} highlight="neutral" />
          <SummaryCard 
            title={results.status === 'surplus' ? 'Sobra de Caixa' : results.status === 'shortage' ? 'Quebra de Caixa' : 'Diferença'} 
            value={results.difference} 
            highlight={results.status === 'balanced' ? 'positive' : results.status === 'surplus' ? 'warning' : 'negative'} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Section 1: Opening & Cash */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#5A8C7A]/20 p-6">
              <h2 className="text-lg font-bold text-[#025939] mb-4 flex items-center gap-2">
                <Wallet className="text-[#5A8C7A]" size={22} />
                Movimentação em Espécie
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputCard 
                  label="Fundo de Caixa (Abertura)" 
                  value={data.openingBalance} 
                  onChange={(v) => handleInputChange('openingBalance', v)} 
                  icon={Wallet}
                  colorClass="text-[#025939]"
                />
                <InputCard 
                  label="Vendas em Dinheiro" 
                  value={data.salesCash} 
                  onChange={(v) => handleInputChange('salesCash', v)} 
                  icon={Banknote}
                  colorClass="text-[#025939]"
                />
                <InputCard 
                  label="Sangrias / Despesas" 
                  value={data.expenses} 
                  onChange={(v) => handleInputChange('expenses', v)} 
                  icon={ArrowDownCircle}
                  colorClass="text-[#D9B68B]"
                />
                <InputCard 
                  label="Contagem Final (Gaveta)" 
                  value={data.closingCount} 
                  onChange={(v) => handleInputChange('closingCount', v)} 
                  icon={Save}
                  colorClass="text-[#0D0D0D]"
                />
              </div>
            </div>

            {/* Section 2: Electronic Payments */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#D9B68B]/30 p-6">
              <h2 className="text-lg font-bold text-[#025939] mb-4 flex items-center gap-2">
                <CreditCard className="text-[#D9B68B]" size={22} />
                Pagamentos Eletrônicos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <InputCard 
                  label="Cartão de Crédito" 
                  value={data.salesCredit} 
                  onChange={(v) => handleInputChange('salesCredit', v)} 
                  icon={CreditCard}
                  colorClass="text-[#5A8C7A]" 
                />
                <InputCard 
                  label="Cartão de Débito" 
                  value={data.salesDebit} 
                  onChange={(v) => handleInputChange('salesDebit', v)} 
                  icon={CreditCard}
                  colorClass="text-[#5A8C7A]"
                />
                <InputCard 
                  label="PIX" 
                  value={data.salesPix} 
                  onChange={(v) => handleInputChange('salesPix', v)} 
                  icon={QrCode}
                  colorClass="text-[#025939]" 
                />
                <InputCard 
                  label="Voucher / Ticket" 
                  value={data.salesVoucher} 
                  onChange={(v) => handleInputChange('salesVoucher', v)} 
                  icon={Ticket}
                  colorClass="text-[#D9B68B]"
                />
              </div>
            </div>

            {/* Action Buttons */}
             <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleSaveToHistory}
                disabled={cloudStatus === CloudStatus.SYNCING}
                className={`
                  flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all hover:scale-[1.02] shadow-lg w-full sm:w-auto
                  ${cloudStatus === CloudStatus.ERROR 
                    ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' 
                    : cloudStatus === CloudStatus.SUCCESS 
                      ? 'bg-[#5A8C7A] hover:bg-[#467061] shadow-[#5A8C7A]/30'
                      : 'bg-[#025939] hover:bg-[#014029] shadow-[#025939]/30'
                  }
                `}
              >
                {cloudStatus === CloudStatus.SYNCING ? (
                  <>
                     <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                     Sincronizando...
                  </>
                ) : cloudStatus === CloudStatus.SUCCESS ? (
                  <>
                    <CheckCircle2 size={20} />
                    Salvo com Sucesso!
                  </>
                ) : cloudStatus === CloudStatus.ERROR ? (
                   <>
                    <XCircle size={20} />
                    Erro ao Enviar (Salvo Local)
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Salvar Fechamento
                    {sheetUrl && <Cloud size={16} className="opacity-70" />}
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Right Column: Analytics */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#5A8C7A]/20 p-6">
               <h2 className="text-lg font-bold text-[#025939] mb-4 flex items-center gap-2">
                <TrendingUp className="text-[#5A8C7A]" size={22} />
                Distribuição de Vendas
              </h2>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <PieChartIcon className="opacity-20 mb-2" size={48} />
                    <span className="text-sm">Sem dados de vendas</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#5A8C7A]/20 p-6">
              <h2 className="text-lg font-bold text-[#025939] mb-4">Resumo da Operação</h2>
              <ul className="space-y-4">
                <li className="flex justify-between items-center text-sm border-b border-[#F2F2F2] pb-2">
                  <span className="text-slate-500">Total Vendas</span>
                  <span className="font-semibold text-[#025939]">R$ {results.totalRevenue.toFixed(2)}</span>
                </li>
                <li className="flex justify-between items-center text-sm border-b border-[#F2F2F2] pb-2">
                  <span className="text-slate-500">Saídas (Sangrias)</span>
                  <span className="font-semibold text-[#D9B68B]">- R$ {data.expenses.toFixed(2)}</span>
                </li>
                 <li className="flex justify-between items-center text-sm pb-2">
                  <span className="text-slate-500">Caixa Final (Físico)</span>
                  <span className="font-semibold text-[#0D0D0D]">R$ {data.closingCount.toFixed(2)}</span>
                </li>
              </ul>
            </div>

             <div className="bg-[#025939] rounded-2xl p-6 text-white bg-[url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-[#025939]/90 transition-opacity group-hover:bg-[#025939]/80"></div>
               <div className="relative z-10">
                 <h3 className="font-bold text-lg mb-2 text-[#D9B68B]">Dica Pro</h3>
                 <p className="text-[#F2F2F2] text-sm opacity-90">
                   Sempre realize sangrias quando o excesso de caixa ultrapassar o limite de segurança da loja.
                 </p>
               </div>
             </div>

          </div>
        </div>

        {/* History / Database Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-[#5A8C7A]/20 overflow-hidden mb-12">
          <div className="p-6 border-b border-[#F2F2F2] flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-[#F2F2F2] text-[#025939] rounded-lg">
                 <Database size={24} />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-[#025939]">Histórico de Fechamentos</h2>
                 <p className="text-sm text-slate-500">
                    {sheetUrl ? "Sincronizado com Google Sheets" : "Salvo apenas neste dispositivo"}
                 </p>
               </div>
             </div>
             
             <div className="flex gap-2">
               {history.length > 0 && (
                 <>
                   <button 
                     onClick={handleClearHistory}
                     className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                   >
                     <Trash2 size={16} />
                     Limpar Histórico Local
                   </button>
                 </>
               )}
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-[#0D0D0D]">
              <thead className="text-xs text-[#5A8C7A] uppercase bg-[#F2F2F2]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Data</th>
                  <th className="px-6 py-4 font-semibold">Faturamento</th>
                  <th className="px-6 py-4 font-semibold">Despesas</th>
                  <th className="px-6 py-4 font-semibold">Sobra/Falta</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                      Nenhum fechamento salvo ainda.
                    </td>
                  </tr>
                ) : (
                  history.map((record) => (
                    <tr key={record.id} className="bg-white border-b border-[#F2F2F2] hover:bg-[#F2F2F2]/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-[#0D0D0D]">
                        {new Date(record.date).toLocaleDateString('pt-BR')} <span className="text-slate-400 text-xs ml-1">{new Date(record.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                      </td>
                      <td className="px-6 py-4 text-[#025939] font-medium">
                        R$ {record.totalRevenue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-[#D9B68B]">
                        R$ {record.expenses.toFixed(2)}
                      </td>
                      <td className={`px-6 py-4 font-medium ${record.difference < 0 ? 'text-red-600' : record.difference > 0 ? 'text-[#025939]' : 'text-[#0D0D0D]'}`}>
                        R$ {record.difference.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold
                          ${record.status === 'balanced' ? 'bg-[#F2F2F2] text-[#0D0D0D]' : 
                            record.status === 'surplus' ? 'bg-[#5A8C7A]/20 text-[#025939]' : 
                            'bg-red-100 text-red-700'
                          }
                        `}>
                          {record.status === 'balanced' ? 'Correto' : record.status === 'surplus' ? 'Sobra' : 'Quebra'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

      </main>
    </div>
  );
};

export default App;