
import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { OrderItem, CATEGORY_COLORS, Category } from '../types';

interface CategorySummaryProps {
  items: OrderItem[];
}

const CategorySummary: React.FC<CategorySummaryProps> = ({ items }) => {
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 延遲渲染以確保父容器寬高完全穩定
    const timer = setTimeout(() => setMounted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const data = Object.entries(
    items.reduce((acc, curr) => {
      if (curr.category) {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8 overflow-hidden" style={{ minHeight: '400px' }}>
      <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
        採購佔比分析
      </h2>
      
      <div className="w-full h-[320px] relative" ref={containerRef}>
        {!mounted ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50/50 rounded-xl">
             <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320} key={items.length}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={CATEGORY_COLORS[entry.name as Category] || '#cbd5e1'} 
                    stroke="none"
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '11px', fontWeight: 'bold', color: '#64748b' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default CategorySummary;
