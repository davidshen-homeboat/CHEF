
import React, { useState, useMemo } from 'react';
import { OrderItem, CATEGORY_COLORS, Category } from '../types';

interface ConsolidatedViewProps {
  items: OrderItem[];
}

interface ConsolidatedItem {
  name: string;
  totalQuantity: number;
  avgPrice: number;
  unit: string;
  category: Category;
  count: number;
  totalNetCost: number;
}

type SortKey = 'name' | 'category' | 'totalNetCost' | 'totalQuantity';
type SortOrder = 'asc' | 'desc';

const ConsolidatedView: React.FC<ConsolidatedViewProps> = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalNetCost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredByDateItems = useMemo(() => {
    return items.filter(item => {
      const isAfterStart = startDate ? item.orderDate >= startDate : true;
      const isBeforeEnd = endDate ? item.orderDate <= endDate : true;
      return isAfterStart && isBeforeEnd;
    });
  }, [items, startDate, endDate]);

  const consolidatedData = useMemo(() => {
    const map = new Map<string, ConsolidatedItem>();

    filteredByDateItems.forEach(item => {
      const key = `${item.name}-${item.unit}`;
      const qty = parseFloat(item.quantity.replace(/[^\d.]/g, '')) || 0;
      const price = parseFloat(item.price.replace(/[^\d.]/g, '')) || 0;
      
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.totalQuantity += qty;
        existing.totalNetCost += (qty * price);
        existing.count += 1;
        existing.avgPrice = existing.totalNetCost / existing.totalQuantity;
      } else {
        map.set(key, {
          name: item.name,
          totalQuantity: qty,
          unit: item.unit,
          category: item.category,
          avgPrice: price,
          totalNetCost: qty * price,
          count: 1
        });
      }
    });

    return Array.from(map.values());
  }, [filteredByDateItems]);

  const financials = useMemo(() => {
    const net = consolidatedData.reduce((sum, item) => sum + item.totalNetCost, 0);
    const tax = net * 0.05;
    const total = net + tax;
    return { net, tax, total };
  }, [consolidatedData]);

  const sortedAndFilteredData = useMemo(() => {
    let data = consolidatedData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    data.sort((a, b) => {
      let result = 0;
      if (sortKey === 'name') result = a.name.localeCompare(b.name, 'zh-TW');
      else if (sortKey === 'category') result = a.category.localeCompare(b.category, 'zh-TW');
      else if (sortKey === 'totalNetCost') result = a.totalNetCost - b.totalNetCost;
      else if (sortKey === 'totalQuantity') result = a.totalQuantity - b.totalQuantity;
      
      return sortOrder === 'asc' ? result : -result;
    });

    return data;
  }, [consolidatedData, searchTerm, sortKey, sortOrder]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc'); // 數值類通常切換時先從大的開始
    }
  };

  const handleExport = () => {
    if (sortedAndFilteredData.length === 0) return;
    
    let csvContent = "\uFEFF類別,品項,總數量,單位,平均單價(未稅),總計(未稅),稅額(5%),含稅總計,來源筆數\n";
    sortedAndFilteredData.forEach(item => {
      const itemTax = item.totalNetCost * 0.05;
      csvContent += `${item.category},${item.name},${item.totalQuantity},${item.unit},${item.avgPrice.toFixed(1)},${item.totalNetCost.toFixed(0)},${itemTax.toFixed(0)},${(item.totalNetCost + itemTax).toFixed(0)},${item.count}\n`;
    });
    
    csvContent += `\n財務摘要,,,,,金額(TWD)\n`;
    csvContent += `未稅總計,,,,,${financials.net.toFixed(0)}\n`;
    csvContent += `5% 營業稅,,,,,${financials.tax.toFixed(0)}\n`;
    csvContent += `含稅總計,,,,,${financials.total.toFixed(0)}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `採購財務報表(含稅制)_${startDate || '始'}_${endDate || '終'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <svg className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" /></svg>;
    return sortOrder === 'asc' 
      ? <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7" /></svg>
      : <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>;
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">未稅總計 (Net)</p>
              <h3 className="text-xl font-bold text-slate-200">
                <span className="text-sm mr-1 font-normal">$</span>
                {financials.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">稅額 (VAT 5%)</p>
              <h3 className="text-xl font-bold text-slate-200">
                <span className="text-sm mr-1 font-normal">$</span>
                {financials.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">含稅總額 (Grand Total)</p>
              <h3 className="text-3xl font-black text-amber-400">
                <span className="text-lg mr-1 font-bold">$</span>
                {financials.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
          </div>
          <button 
            onClick={handleExport}
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            導出稅務對帳單
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">彙整區間篩選</label>
            <div className="flex items-center gap-2">
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <span className="text-slate-300">至</span>
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          <input
            type="text"
            placeholder="搜尋項目或類別..."
            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th 
                  onClick={() => toggleSort('name')}
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    採購品項 <SortIcon k="name" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('category')}
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    類別 <SortIcon k="category" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('totalQuantity')}
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-1.5">
                    總數量 <SortIcon k="totalQuantity" />
                  </div>
                </th>
                <th 
                  onClick={() => toggleSort('totalNetCost')}
                  className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex justify-end items-center gap-1.5">
                    小計 (未稅) <SortIcon k="totalNetCost" />
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">含稅 (5%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredData.map((item, idx) => (
                <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}15`, color: CATEGORY_COLORS[item.category] }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-600">{item.totalQuantity}</span>
                    <span className="ml-1 text-xs text-slate-400">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 text-sm">
                    ${item.totalNetCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-base font-black text-slate-800">
                      ${(item.totalNetCost * 1.05).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </td>
                </tr>
              ))}
              {sortedAndFilteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">此區間內無數據</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedView;
