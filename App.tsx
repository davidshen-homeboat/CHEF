
import React, { useState, useCallback, useMemo } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import StatsCards from './components/StatsCards';
import OrderTable from './components/OrderTable';
import CategorySummary from './components/CategorySummary';
import ConsolidatedView from './components/ConsolidatedView';
import { OrderItem } from './types';
import { extractOrders } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'detail' | 'summary'>('detail');
  const [selectedDetailDate, setSelectedDetailDate] = useState<string>('');

  // 取得所有唯一的日期並排序
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(items.map(item => item.orderDate))).sort().reverse();
    return dates;
  }, [items]);

  // 如果目前選取的日期不再列表中，重設為最新的日期
  useMemo(() => {
    if (uniqueDates.length > 0 && !uniqueDates.includes(selectedDetailDate)) {
      setSelectedDetailDate(uniqueDates[0]);
    } else if (uniqueDates.length === 0) {
      setSelectedDetailDate('');
    }
  }, [uniqueDates, selectedDetailDate]);

  const handleProcessText = async (text: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractOrders(text);
      const itemsWithDate = extracted.map(item => ({ ...item, orderDate: date }));
      setItems(prev => [...prev, ...itemsWithDate]);
      setSelectedDetailDate(date);
    } catch (err) {
      setError('AI 提取失敗，請稍後再試。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessImage = async (data: string, mimeType: string, date: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractOrders({ data, mimeType });
      const itemsWithDate = extracted.map(item => ({ ...item, orderDate: date }));
      
      setItems(prev => {
        const newItems = [...prev];
        itemsWithDate.forEach(newItem => {
          const isDuplicate = prev.some(existing => 
            existing.name === newItem.name && 
            existing.quantity === newItem.quantity && 
            existing.unit === newItem.unit &&
            existing.orderDate === newItem.orderDate
          );
          if (!isDuplicate) {
            newItems.push(newItem);
          }
        });
        return newItems;
      });
      setSelectedDetailDate(date);
    } catch (err) {
      setError('部分圖片辨識失敗。');
      console.error(err);
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

  const clearAll = () => {
    if (window.confirm('確定要清空目前清單嗎？')) {
      setItems([]);
    }
  };

  const currentDetailItems = useMemo(() => {
    return items.filter(item => item.orderDate === selectedDetailDate);
  }, [items, selectedDetailDate]);

  return (
    <div className="min-h-screen pb-10 bg-slate-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Left Column: Input and Stats */}
          <div className="lg:col-span-4 space-y-6">
            <InputSection 
              onProcessText={handleProcessText}
              onProcessImage={handleProcessImage}
              isLoading={isLoading}
            />
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-pulse">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1-1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="hidden lg:block">
              {items.length > 0 && <CategorySummary items={items} />}
            </div>
          </div>

          {/* Right Column: Results Table */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-2">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">採購管理中心</h2>
                <div className="flex gap-4 mt-2">
                  <button 
                    onClick={() => setActiveTab('detail')}
                    className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'detail' ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    項目明細 (分天查閱)
                    {activeTab === 'detail' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-300"></div>}
                  </button>
                  <button 
                    onClick={() => setActiveTab('summary')}
                    className={`pb-2 text-sm font-bold transition-all relative ${activeTab === 'summary' ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    採購總量彙整 (區間報表)
                    {activeTab === 'summary' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full animate-in fade-in zoom-in duration-300"></div>}
                  </button>
                </div>
              </div>
              {items.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="bg-white border border-slate-200 text-[10px] md:text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg active:bg-red-50 active:text-red-500 active:border-red-100 transition-all self-end mb-2"
                >
                  清空資料庫
                </button>
              )}
            </div>

            <StatsCards items={items} />

            {activeTab === 'detail' ? (
              <div className="space-y-4">
                {uniqueDates.length > 0 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {uniqueDates.map(date => (
                      <button
                        key={date}
                        onClick={() => setSelectedDetailDate(date)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all ${selectedDetailDate === date ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 border border-slate-200'}`}
                      >
                        {date === new Date().toISOString().split('T')[0] ? '今天 ' : ''}{date}
                      </button>
                    ))}
                  </div>
                )}
                <OrderTable 
                  items={currentDetailItems} 
                  onRemove={handleRemoveItem}
                  onUpdate={handleUpdateItem}
                />
              </div>
            ) : (
              <ConsolidatedView items={items} />
            )}
            
            <div className="lg:hidden mt-8">
              {items.length > 0 && <CategorySummary items={items} />}
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-6 right-6 md:hidden">
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-slate-800 text-white p-4 rounded-full shadow-2xl active:scale-90 transition-all"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default App;
