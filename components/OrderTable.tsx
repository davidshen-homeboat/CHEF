
import React from 'react';
import { OrderItem, CATEGORY_COLORS } from '../types';

interface OrderTableProps {
  items: OrderItem[];
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<OrderItem>) => void;
}

const OrderTable: React.FC<OrderTableProps> = ({ items, onRemove, onUpdate }) => {
  if (items.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
        <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium">尚無叫貨資料</p>
        <p className="text-sm text-slate-400">請從上方匯入文字或圖片</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">類別</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">品項</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">數量</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">單位</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span 
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}20`, color: CATEGORY_COLORS[item.category] }}
                    >
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">
                    <input 
                      type="text" 
                      value={item.name}
                      onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                      className="bg-transparent border-none focus:ring-0 w-full p-0 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input 
                      type="text" 
                      value={item.quantity}
                      onChange={(e) => onUpdate(item.id, { quantity: e.target.value })}
                      className="bg-transparent border-none focus:ring-0 w-full p-0 font-bold text-slate-700 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <input 
                      type="text" 
                      value={item.unit}
                      onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                      className="bg-transparent border-none focus:ring-0 w-full p-0 outline-none"
                    />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onRemove(item.id)}
                      className="text-slate-300 hover:text-red-500 p-1 rounded-lg transition-colors"
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

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative">
            <div className="flex items-start justify-between mb-2">
              <span 
                className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase"
                style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}20`, color: CATEGORY_COLORS[item.category] }}
              >
                {item.category}
              </span>
              <button 
                onClick={() => onRemove(item.id)}
                className="text-slate-300 active:text-red-500 p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="col-span-1">
                <label className="text-[10px] text-slate-400 block">品項</label>
                <input 
                  type="text" 
                  value={item.name}
                  onChange={(e) => onUpdate(item.id, { name: e.target.value })}
                  className="w-full text-slate-800 font-semibold bg-transparent border-none p-0 focus:ring-0 text-base"
                />
              </div>
              <div className="col-span-1 flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-slate-400 block">數量</label>
                  <input 
                    type="text" 
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, { quantity: e.target.value })}
                    className="w-full text-emerald-600 font-bold bg-transparent border-none p-0 focus:ring-0 text-base"
                  />
                </div>
                <div className="w-12">
                  <label className="text-[10px] text-slate-400 block">單位</label>
                  <input 
                    type="text" 
                    value={item.unit}
                    onChange={(e) => onUpdate(item.id, { unit: e.target.value })}
                    className="w-full text-slate-500 bg-transparent border-none p-0 focus:ring-0 text-base"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer / Copy Actions */}
      <div className="bg-white md:bg-slate-50 px-6 py-4 rounded-xl md:rounded-b-2xl border border-slate-200 md:border-t flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-sm text-slate-500">
          共 <span className="font-bold text-slate-700">{items.length}</span> 個品項
        </p>
        <button 
          onClick={() => {
            const text = items.map(i => `${i.name} ${i.quantity}${i.unit}`).join('\n');
            navigator.clipboard.writeText(text);
            alert('已複製到剪貼簿！');
          }}
          className="w-full sm:w-auto bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 active:bg-emerald-100 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2v4m0 0h2v-4m-2 4h2" />
          </svg>
          複製清單傳給廠商
        </button>
      </div>
    </div>
  );
};

export default OrderTable;
