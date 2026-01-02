
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import StatsCards from './components/StatsCards';
import OrderTable from './components/OrderTable';
import CategorySummary from './components/CategorySummary';
import ConsolidatedView from './components/ConsolidatedView';
import { OrderItem, Category, CATEGORIES } from './types';
import { extractOrders } from './services/geminiService';

const LOCAL_STORAGE_KEY = 'chef_order_data_v1';

const App: React.FC = () => {
  const [items, setItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(i => i && typeof i === 'object') : [];
    } catch (e) {
      console.error("Failed to load saved data", e);
      return [];
    }
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'detail' | 'summary'>('detail');
  const [selectedDetailDate, setSelectedDetailDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | '全部'>('全部');

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const vendors = useMemo(() => {
    return Array.from(new Set(items.map(item => item.vendor).filter(Boolean))).sort();
  }, [items]);

  const uniqueDates = useMemo(() => {
    return Array.from(new Set(items.map(item => item.orderDate).filter(Boolean))).sort().reverse();
  }, [items]);

  const currentDetailItems = useMemo(() => {
    let filtered = items.filter(item => item.orderDate === selectedDetailDate);
    if (selectedCategory !== '全部') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }
    return filtered;
  }, [items, selectedDetailDate, selectedCategory]);

  const handleProcessText = async (text: string, date: string, vendor: string) => {
    if (!text) return;
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractOrders(text);
      const itemsWithMeta = extracted.map(item => ({ 
        ...item, 
        orderDate: date || new Date().toISOString().split('T')[0],
        vendor: vendor || '未指定廠商' 
      }));
      setItems(prev => [...prev, ...itemsWithMeta]);
      setSelectedDetailDate(date);
    } catch (err) {
      setError('AI 提取失敗，請檢查網路或稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessImage = async (data: string, mimeType: string, date: string, vendor: string) => {
    if (!data) return;
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractOrders({ data, mimeType });
      const itemsWithMeta = extracted.map(item => ({ 
        ...item, 
        orderDate: date || new Date().toISOString().split('T')[0],
        vendor: vendor || '未指定廠商'
      }));
      setItems(prev => [...prev, ...itemsWithMeta]);
      setSelectedDetailDate(date);
    } catch (err) {
      setError('辨識辨識失敗，請確保圖片清晰。');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const handleUpdateItem = useCallback((id: string, updates: Partial<OrderItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const filterOptions: (Category | '全部')[] = ['全部', ...CATEGORIES];

  return (
    <div className="min-h-screen pb-10 bg-slate-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          <div className="lg:col-span-4 space-y-6">
            <InputSection onProcessText={handleProcessText} onProcessImage={handleProcessImage} isLoading={isLoading} existingVendors={vendors} />
            {error && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{error}</div>}
            <div className="hidden lg:block">
              {items.length > 0 && <CategorySummary items={items} />}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-4">
              <div className="w-full">
                <div className="flex gap-4 mb-4">
                  <button onClick={() => setActiveTab('detail')} className={`pb-2 text-sm font-bold relative ${activeTab === 'detail' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    每日清單
                    {activeTab === 'detail' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></div>}
                  </button>
                  <button onClick={() => setActiveTab('summary')} className={`pb-2 text-sm font-bold relative ${activeTab === 'summary' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    對帳與彙整
                    {activeTab === 'summary' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full"></div>}
                  </button>
                </div>
              </div>
            </div>

            <StatsCards items={items.filter(i => i.orderDate === selectedDetailDate)} />

            {activeTab === 'detail' && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    <input type="date" value={selectedDetailDate} onChange={(e) => setSelectedDetailDate(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold w-full md:w-48" />
                    <div className="flex-1 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                      {filterOptions.map(cat => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all border ${selectedCategory === cat ? 'bg-slate-800 text-white border-slate-800 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <OrderTable items={currentDetailItems} onRemove={handleRemoveItem} onUpdate={handleUpdateItem} />
              </div>
            )}

            {activeTab === 'summary' && <ConsolidatedView items={items} onJumpToDate={(d) => { setSelectedDetailDate(d); setActiveTab('detail'); }} />}
            
            <div className="lg:hidden mt-8">
              {items.length > 0 && <CategorySummary items={items} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
