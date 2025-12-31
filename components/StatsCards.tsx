
import React from 'react';
import { OrderItem } from '../types';

interface StatsCardsProps {
  items: OrderItem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ items }) => {
  const totalItems = items.length;
  const categories = new Set(items.map(i => i.category)).size;
  const topCategory = items.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Fix: Explicitly cast entries to [string, number][] to ensure arithmetic operations (b[1] - a[1]) are valid in all TypeScript environments.
  const entries = Object.entries(topCategory) as [string, number][];
  const mostFrequentCat = entries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500 mb-1">總叫貨品項</p>
        <h3 className="text-3xl font-bold text-slate-800">{totalItems} <span className="text-sm font-normal text-slate-400">項</span></h3>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500 mb-1">涵蓋類別</p>
        <h3 className="text-3xl font-bold text-emerald-600">{categories} <span className="text-sm font-normal text-slate-400">類</span></h3>
      </div>
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <p className="text-sm text-slate-500 mb-1">最多叫貨類別</p>
        <h3 className="text-3xl font-bold text-blue-600 truncate">{mostFrequentCat}</h3>
      </div>
    </div>
  );
};

export default StatsCards;
