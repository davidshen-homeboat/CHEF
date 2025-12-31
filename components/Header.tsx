
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800">ChefOrder AI</h1>
            <span className="hidden md:inline-block px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700 rounded-full">餐廳叫貨小助手</span>
          </div>
          <nav className="flex items-center gap-4">
            <button className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">今日摘要</button>
            <button className="text-sm font-medium text-slate-500 hover:text-emerald-600 transition-colors">歷史紀錄</button>
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden">
               <img src="https://picsum.photos/32/32?seed=chef" alt="Profile" />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
