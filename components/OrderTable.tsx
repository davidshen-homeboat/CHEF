
import React from 'react';
import { OrderItem, CATEGORY_COLORS, Category } from '../types';

interface OrderTableProps {
  items: OrderItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OrderItem>) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ items, onRemove, onUpdate }) => {
  const categories: Category[] = ['生鮮類', '冷凍類', '乾貨類', '調料類', '消耗品'];

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center animate-in fade-in duration-500">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">該日期尚無叫貨資料</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">類別標籤</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">品項名稱</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">數量</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-24">單位</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-32">預估單價 ($)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">管理</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="relative inline-block w-full">
                      <select
                        value={item.category}
                        onChange={(e) => onUpdate(item.id, { category: e.target.value as Category })}
                        className="w-full text-[10px] font-bold px-3 py-1.5 rounded-full border-none outline-none focus:ring-2 focus:ring-slate-400 appearance-none cursor-pointer transition-all pr-6"
                        style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}15`, color: CATEGORY_COLORS[item.category] }}
                      >
                        {categories.map(cat => (
                          <option key={cat} value={cat} style={{ color: '#334155', backgroundColor: '#fff' }}>{cat}</option>
                        ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                      className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 focus:ring-0 w-full p-1 outline-none font-bold text-slate-800 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={item.quantity}
                      onChange={(e) => onUpdate(item.id, { quantity: e.target.value })}
                      className="bg-slate-50 border border-transparent hover:border-slate-200 focus:bg-white focus:border-emerald-500 focus:ring-0 w-full p-1 rounded outline-none font-black text-emerald-600 text-center transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={item.unit}
                      onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                      className="bg-transparent border-b border-transparent hover:border-slate-200 focus:border-emerald-500 focus:ring-0 w-full p-1 outline-none text-slate-500 transition-all"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1 group-hover:bg-white border border-transparent group-hover:border-slate-100 transition-all">
                      <span className="text-slate-400 text-xs font-bold">$</span>
                      <input 
                        type="text" 
                        value={item.price}
                        placeholder="0"
                        onChange={(e) => onUpdate(item.id, { price: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 w-full p-0 outline-none font-bold text-slate-700"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-slate-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all active:scale-90"
                      title="刪除品項"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderTable;
