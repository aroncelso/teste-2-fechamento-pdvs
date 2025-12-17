import React from 'react';

interface SummaryCardProps {
  title: string;
  value: number;
  isCurrency?: boolean;
  highlight?: 'neutral' | 'positive' | 'negative' | 'warning';
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, value, isCurrency = true, highlight = 'neutral' }) => {
  let colorClass = 'text-[#025939]'; // Primary Brand Color
  let bgClass = 'bg-white';
  let borderClass = 'border-slate-100';
  
  if (highlight === 'positive') {
    colorClass = 'text-[#025939]'; 
    bgClass = 'bg-[#F2F2F2]';
    borderClass = 'border-[#5A8C7A]/30';
  } else if (highlight === 'negative') {
    colorClass = 'text-red-600'; // Keep standard red for critical financial errors
    bgClass = 'bg-red-50';
    borderClass = 'border-red-100';
  } else if (highlight === 'warning') {
    colorClass = 'text-[#D9B68B]'; // Beige Gold for warning/attention
    bgClass = 'bg-[#F2F2F2]';
    borderClass = 'border-[#D9B68B]/50';
  }

  return (
    <div className={`${bgClass} p-5 rounded-xl shadow-sm border ${borderClass}`}>
      <p className="text-sm text-slate-500 font-medium uppercase tracking-wide mb-1">{title}</p>
      <p className={`text-2xl font-bold ${colorClass}`}>
        {isCurrency ? `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value}
      </p>
    </div>
  );
};