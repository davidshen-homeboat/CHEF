
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import InputSection from './components/InputSection';
import StatsCards from './components/StatsCards';
import OrderTable from './components/OrderTable';
import CategorySummary from './components/CategorySummary';
import { OrderItem } from './types';
import { extractOrders } from './services/geminiService';

const App: React.FC = () => {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessText = async (text: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractOrders(text);
      setItems(prev => [...prev, ...extracted]);
    } catch (err) {
      setError('AI 提取失敗，請再試一次。');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessImage = async (data: string, mimeType: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const extracted = await extractOrders({ data, mimeType });
      setItems(prev => [...prev, ...extracted]);
    } catch (err) {
      setError('圖片讀取失敗，請確認圖片清晰度。');
      console.error(err);
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
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
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
            <div className="flex justify-between items-center mb-1">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">今日彙整清單</h2>
                <p className="text-xs md:text-sm text-slate-400 font-medium">AI 已自動整理重複品項</p>
              </div>
              {items.length > 0 && (
                <button 
                  onClick={clearAll}
                  className="bg-white border border-slate-200 text-[10px] md:text-xs font-bold text-slate-400 px-3 py-1.5 rounded-lg active:bg-red-50 active:text-red-500 active:border-red-100 transition-all"
                >
                  清空清單
                </button>
              )}
            </div>

            <StatsCards items={items} />

            <OrderTable 
              items={items} 
              onRemove={handleRemoveItem}
              onUpdate={handleUpdateItem}
            />
            
            <div className="lg:hidden mt-8">
              {items.length > 0 && <CategorySummary items={items} />}
            </div>
          </div>
        </div>
      </main>

      {/* Floating Scroll to Top/Input on Mobile */}
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
