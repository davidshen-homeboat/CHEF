
import React from 'react';
import { OrderItem } from '../types';

interface StatsCardsProps {
  items: OrderItem[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ items }) => {
  const totalEntries = items.length;
  
  const nameCounts = items.reduce((acc, curr) => {
    if (curr.name) {
      acc[curr.name] = (acc[curr.name] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const duplicateCount = (Object.values(nameCounts) as number[]).filter(c => c > 1).length;

  const netCost = items.reduce((sum, item) => {
    // 加入空值保護：確保 quantity 和 price 轉為字串後再進行處理
    const qtyStr = (item.quantity ?? "").toString();
    const priceStr = (item.price ?? "").toString();
    
    const qty = parseFloat(qtyStr.replace(/[^\d.]/g, '')) || 0;
    const price = parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
    return sum + (qty * price);
  }, 0);

  const taxAmount = netCost * 0.05;
  const totalCostWithTax = netCost + taxAmount;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">叫貨總筆數</p>
          <div className="bg-slate-100 p-1 rounded-md text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
          </div>
        </div>
        <h3 className="text-2xl font-black text-slate-800">{totalEntries} <span className="text-sm font-bold text-slate-300 ml-1">項目</span></h3>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="flex justify-between items-start mb-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">重複叫貨提醒</p>
          <div className={`p-1 rounded-md ${duplicateCount > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.47 14c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>
        <h3 className={`text-2xl font-black ${duplicateCount > 0 ? 'text-amber-500' : 'text-slate-800'}`}>
          {duplicateCount} <span className="text-sm font-bold text-slate-300 ml-1">項品項</span>
        </h3>
        {duplicateCount > 0 && <div className="absolute bottom-0 left-0 h-1 bg-amber-400 w-full"></div>}
      </div>

      <div className="bg-emerald-600 p-5 rounded-2xl shadow-lg shadow-emerald-100 relative overflow-hidden">
        <div className="flex justify-between items-start mb-1 relative z-10">
          <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">今日支出 (含 5% 稅)</p>
          <div className="bg-emerald-500/50 p-1 rounded-md text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black text-white">
            <span className="text-sm font-bold mr-0.5">$</span>
            {totalCostWithTax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </h3>
          <p className="text-[10px] font-bold text-emerald-200 mt-1">
            未稅: ${netCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} / 稅額: ${taxAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
        {/* 背景裝飾 */}
        <div className="absolute -right-4 -bottom-4 opacity-10">
           <svg className="w-24 h-24 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" /></svg>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
