
import React from 'react';
import { OrderItem, CATEGORY_COLORS, CATEGORIES, Category } from '../types';

interface OrderTableProps {
  items: OrderItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OrderItem>) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ items, onRemove, onUpdate }) => {
  // 安全解析數字的輔助函式
  const parseNumber = (val: string | number) => {
    const str = (val ?? "").toString();
    const cleaned = str.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // 將品項依照類別分組
  const groupedItems = CATEGORIES.map(cat => ({
    category: cat,
    items: items.filter(i => i.category === cat)
  })).filter(group => group.items.length > 0);

  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <p className="text-slate-400 font-medium">該條件下尚無品項</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedItems.map(group => (
        <div key={group.category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-2">
          <div className="px-6 py-3 flex items-center justify-between" style={{ backgroundColor: `${CATEGORY_COLORS[group.category]}10` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-4 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[group.category] }}></div>
              <h3 className="text-sm font-black" style={{ color: CATEGORY_COLORS[group.category] }}>{group.category} <span className="text-[10px] opacity-60 ml-1">({group.items.length} 項)</span></h3>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">品項名稱</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">分類</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">廠商</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">數量</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-20">單位</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest w-28">單價 ($)</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-emerald-600 uppercase tracking-widest w-32 text-right">小計 ($)</th>
                  <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">管理</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {group.items.map((item) => {
                  const qty = parseNumber(item.quantity);
                  const price = parseNumber(item.price);
                  const rowTotal = qty * price;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={item.name}
                          onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                          className="bg-transparent border-b border-transparent focus:border-emerald-500 w-full p-1 outline-none font-bold text-slate-800 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.category}
                          onChange={(e) => onUpdate(item.id, { category: e.target.value as Category })}
                          style={{ color: CATEGORY_COLORS[item.category], backgroundColor: `${CATEGORY_COLORS[item.category]}15` }}
                          className="text-[10px] font-bold px-2 py-1 rounded-lg border-none outline-none cursor-pointer appearance-none text-center min-w-[70px] hover:brightness-95 transition-all"
                        >
                          {CATEGORIES.map(cat => (
                            <option key={cat} value={cat} style={{ color: '#334155', backgroundColor: '#fff' }}>{cat}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={item.vendor}
                          placeholder="未指定"
                          onChange={(e) => onUpdate(item.id, { vendor: e.target.value })}
                          className="bg-transparent border-b border-transparent focus:border-emerald-500 w-full p-1 outline-none text-xs text-slate-500 font-medium"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={item.quantity}
                          onChange={(e) => onUpdate(item.id, { quantity: e.target.value })}
                          className="bg-slate-100 border-none w-full p-1 rounded-lg text-center font-black text-slate-700 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input 
                          type="text" 
                          value={item.unit}
                          onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                          className="bg-transparent border-none w-full p-1 outline-none text-slate-500 text-xs"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <span className="text-slate-300 text-xs">$</span>
                          <input 
                            type="text" 
                            value={item.price}
                            onChange={(e) => onUpdate(item.id, { price: e.target.value })}
                            className="bg-transparent border-none w-full p-0 outline-none font-bold text-slate-700 text-sm"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-black text-emerald-600">
                          ${rowTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 p-2 rounded-lg transition-all">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderTable;
