import React from 'react';
import { LucideIcon } from 'lucide-react';

interface InputCardProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  icon: LucideIcon;
  colorClass: string;
}

export const InputCard: React.FC<InputCardProps> = ({ label, value, onChange, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col hover:border-[#025939] transition-colors group">
      <div className="flex items-center gap-2 mb-2 text-slate-500">
        <Icon size={18} className={colorClass} />
        <span className="text-sm font-medium group-hover:text-[#025939] transition-colors">{label}</span>
      </div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">R$</span>
        <input
          type="number"
          step="0.01"
          min="0"
          value={value === 0 ? '' : value}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) ? 0 : val);
          }}
          className="w-full pl-10 pr-4 py-2 bg-[#F2F2F2] border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#025939] focus:border-[#025939] focus:outline-none font-semibold text-[#0D0D0D] text-lg placeholder-slate-300 transition-shadow"
          placeholder="0.00"
        />
      </div>
    </div>
  );
};