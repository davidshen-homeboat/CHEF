
import React, { useState, useMemo } from 'react';
import { OrderItem, CATEGORY_COLORS, Category } from '../types';

interface ConsolidatedViewProps {
  items: OrderItem[];
  onJumpToDate?: (date: string) => void;
}

interface ConsolidatedItem {
  name: string;
  totalQuantity: number;
  avgPrice: number;
  unit: string;
  category: Category;
  vendor: string; 
  count: number;
  totalNetCost: number;
  sourceDates: string[];
}

type SortKey = 'name' | 'category' | 'vendor' | 'totalNetCost' | 'totalQuantity';
type SortOrder = 'asc' | 'desc';

const ConsolidatedView: React.FC<ConsolidatedViewProps> = ({ items, onJumpToDate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string>('all');
  
  const [startDate, setStartDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  const [sortKey, setSortKey] = useState<SortKey>('totalNetCost');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const availableVendors = useMemo(() => {
    const vSet = new Set(items.map(i => i.vendor).filter(Boolean));
    return Array.from(vSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const isAfterStart = startDate ? item.orderDate >= startDate : true;
      const isBeforeEnd = endDate ? item.orderDate <= endDate : true;
      const isVendorMatch = selectedVendor === 'all' ? true : item.vendor === selectedVendor;
      return isAfterStart && isBeforeEnd && isVendorMatch;
    });
  }, [items, startDate, endDate, selectedVendor]);

  const consolidatedData = useMemo(() => {
    const map = new Map<string, ConsolidatedItem>();

    filteredItems.forEach(item => {
      const key = `${item.name}-${item.unit}-${item.vendor}`;
      const qty = parseFloat(item.quantity?.toString().replace(/[^\d.]/g, '')) || 0;
      const price = parseFloat(item.price?.toString().replace(/[^\d.]/g, '')) || 0;
      
      if (map.has(key)) {
        const existing = map.get(key)!;
        existing.totalQuantity += qty;
        existing.totalNetCost += (qty * price);
        existing.count += 1;
        existing.avgPrice = existing.totalNetCost / existing.totalQuantity;
        if (item.orderDate && !existing.sourceDates.includes(item.orderDate)) {
          existing.sourceDates.push(item.orderDate);
          existing.sourceDates.sort().reverse();
        }
      } else {
        map.set(key, {
          name: item.name,
          totalQuantity: qty,
          unit: item.unit,
          category: item.category,
          vendor: item.vendor || '未指定',
          avgPrice: price,
          totalNetCost: qty * price,
          count: 1,
          sourceDates: item.orderDate ? [item.orderDate] : []
        });
      }
    });

    return Array.from(map.values());
  }, [filteredItems]);

  const financials = useMemo(() => {
    const net = consolidatedData.reduce((sum, item) => sum + item.totalNetCost, 0);
    const tax = net * 0.05;
    const total = net + tax;
    return { net, tax, total };
  }, [consolidatedData]);

  const sortedAndFilteredData = useMemo(() => {
    let data = consolidatedData.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    data.sort((a, b) => {
      let result = 0;
      if (sortKey === 'name') result = a.name.localeCompare(b.name, 'zh-TW');
      else if (sortKey === 'category') result = a.category.localeCompare(b.category, 'zh-TW');
      else if (sortKey === 'vendor') result = a.vendor.localeCompare(b.vendor, 'zh-TW');
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
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    if (sortedAndFilteredData.length === 0) return;
    
    let csvContent = "\uFEFF廠商,類別,品項,總採購量,單位,來源日期,預估平均單價(未稅),總支出(未稅),稅額(5%),含稅總計\n";
    sortedAndFilteredData.forEach(item => {
      const itemTax = item.totalNetCost * 0.05;
      const datesStr = item.sourceDates.join(" | ");
      csvContent += `${item.vendor},${item.category},${item.name},${item.totalQuantity},${item.unit},"${datesStr}",${item.avgPrice.toFixed(2)},${item.totalNetCost.toFixed(0)},${itemTax.toFixed(0)},${(item.totalNetCost + itemTax).toFixed(0)}\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ChefOrder_對帳報表_${selectedVendor}_${startDate}.csv`);
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
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                {selectedVendor === 'all' ? '總支出 (未稅)' : `${selectedVendor} 支出 (未稅)`}
              </p>
              <h3 className="text-xl font-bold text-slate-200">
                <span className="text-sm mr-1 font-normal">$</span>
                {financials.net.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">預估稅額 (5%)</p>
              <h3 className="text-xl font-bold text-slate-200">
                <span className="text-sm mr-1 font-normal">$</span>
                {financials.tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </h3>
            </div>
            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8">
              <p className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1">總採購支出</p>
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
            匯出 Excel 對帳單
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">彙整區間</label>
            <div className="flex items-center gap-2">
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <input type="date" className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">廠商篩選</label>
            <select 
              value={selectedVendor}
              onChange={(e) => setSelectedVendor(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-emerald-500 h-10 appearance-none cursor-pointer"
            >
              <option value="all">全部廠商 (All Vendors)</option>
              {availableVendors.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">搜尋關鍵字</label>
            <input
              type="text"
              placeholder="搜尋品項、類別或廠商..."
              className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-emerald-500 h-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th onClick={() => toggleSort('vendor')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 group">
                  <div className="flex items-center gap-1.5">廠商 <SortIcon k="vendor" /></div>
                </th>
                <th onClick={() => toggleSort('name')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 group">
                  <div className="flex items-center gap-1.5">品項名稱 <SortIcon k="name" /></div>
                </th>
                <th onClick={() => toggleSort('category')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 group">
                  <div className="flex items-center gap-1.5">類別 <SortIcon k="category" /></div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">來源日期</th>
                <th onClick={() => toggleSort('totalQuantity')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 group text-center">
                  <div className="flex justify-center items-center gap-1.5">總量 <SortIcon k="totalQuantity" /></div>
                </th>
                <th onClick={() => toggleSort('totalNetCost')} className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right cursor-pointer hover:bg-slate-100 group">
                  <div className="flex justify-end items-center gap-1.5">小計 (未稅) <SortIcon k="totalNetCost" /></div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredData.map((item, idx) => (
                <tr key={`${item.name}-${idx}`} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-500 text-sm">{item.vendor}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{item.name}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${CATEGORY_COLORS[item.category]}15`, color: CATEGORY_COLORS[item.category] }}>
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {item.sourceDates.map(date => {
                        const dateParts = date ? date.split('-') : [];
                        const label = dateParts.length >= 3 ? dateParts.slice(1).join('/') : date;
                        return (
                          <button
                            key={date}
                            onClick={() => onJumpToDate?.(date)}
                            className="text-[9px] font-bold bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 text-slate-500 px-1.5 py-0.5 rounded transition-colors"
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="font-bold text-slate-600">{item.totalQuantity}</span>
                    <span className="ml-1 text-xs text-slate-400">{item.unit}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-800 font-black">
                    ${item.totalNetCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </td>
                </tr>
              ))}
              {sortedAndFilteredData.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 text-sm">此篩選條件下無數據</td>
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
