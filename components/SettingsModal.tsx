import React, { useState, useEffect } from 'react';
import { X, Save, Link, AlertTriangle, Lock, ArrowRight } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUrl, onSave }) => {
  const [url, setUrl] = useState(currentUrl);
  
  // Auth state
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl(currentUrl);
      setPassword('');
      setIsAuthenticated(false);
      setError(false);
    }
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '010203') {
      setIsAuthenticated(true);
      setError(false);
    } else {
      setError(true);
      setPassword('');
    }
  };

  // 1. Locked View
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#025939]/50 backdrop-blur-sm transition-opacity">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-fade-in border border-[#5A8C7A]/20">
          <div className="p-6 border-b border-[#F2F2F2] flex justify-between items-center bg-[#F2F2F2]">
            <h2 className="text-lg font-bold text-[#025939] flex items-center gap-2">
              <Lock size={18} className="text-[#025939]" />
              Acesso Restrito
            </h2>
            <button onClick={onClose} className="text-[#5A8C7A] hover:text-[#025939] transition-colors">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
            <div className="text-center mb-2">
              <div className="bg-[#5A8C7A]/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock size={24} className="text-[#025939]" />
              </div>
              <p className="text-sm text-slate-500">Digite a senha de administrador para configurar a integração.</p>
            </div>

            <div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                placeholder="Senha de acesso"
                autoFocus
                className={`w-full p-3 text-center tracking-widest border rounded-lg focus:ring-2 focus:outline-none text-[#0D0D0D] font-bold transition-all
                  ${error 
                    ? 'border-red-300 focus:ring-red-200 bg-red-50' 
                    : 'border-slate-300 focus:ring-[#025939] focus:border-[#025939]'}`}
              />
              {error && <p className="text-red-500 text-xs text-center mt-2 font-medium animate-pulse">Senha incorreta</p>}
            </div>

            <button 
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#025939] text-white font-bold rounded-lg hover:bg-[#014029] transition-colors"
            >
              Acessar
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 2. Authenticated/Settings View
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#025939]/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in border border-[#5A8C7A]/20">
        <div className="p-6 border-b border-[#F2F2F2] flex justify-between items-center bg-[#F2F2F2]">
          <h2 className="text-xl font-bold text-[#025939] flex items-center gap-2">
            <Link size={20} className="text-[#025939]" />
            Configurar Planilha
          </h2>
          <button onClick={onClose} className="text-[#5A8C7A] hover:text-[#025939] transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="p-4 bg-[#D9B68B]/10 text-[#A16207] rounded-lg text-sm flex gap-3 border border-[#D9B68B]/20">
             <AlertTriangle className="shrink-0 text-[#D9B68B]" size={20} />
             <p>
               Para ativar a sincronização automática, você precisa colar o <strong>URL do Web App</strong> do seu Google Script aqui.
             </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">URL do Web App (Google Script)</label>
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#025939] focus:border-[#025939] focus:outline-none text-[#0D0D0D] text-sm"
            />
          </div>
        </div>

        <div className="p-6 border-t border-[#F2F2F2] bg-[#F2F2F2]/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={() => {
              onSave(url);
              onClose();
            }}
            className="flex items-center gap-2 px-6 py-2 bg-[#025939] text-white font-bold rounded-lg hover:bg-[#014029] transition-colors shadow-lg shadow-[#025939]/20"
          >
            <Save size={18} />
            Salvar Configuração
          </button>
        </div>
      </div>
    </div>
  );
};