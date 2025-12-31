
export interface OrderItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  price: string; // 新增：單價
  category: '生鮮類' | '冷凍類' | '乾貨類' | '調料類' | '消耗品';
  rawText: string;
  orderDate: string; // YYYY-MM-DD
}

export interface ExtractionResult {
  items: OrderItem[];
  summary: string;
  timestamp: string;
}

export type Category = OrderItem['category'];

export const CATEGORY_COLORS: Record<Category, string> = {
  '生鮮類': '#10b981', 
  '冷凍類': '#06b6d4', 
  '乾貨類': '#f59e0b', 
  '調料類': '#8b5cf6', 
  '消耗品': '#64748b'  
};
