
export interface OrderItem {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  category: '蔬菜' | '肉類' | '海鮮' | '乾貨' | '調料' | '其他';
  rawText: string;
}

export interface ExtractionResult {
  items: OrderItem[];
  summary: string;
  timestamp: string;
}

export type Category = OrderItem['category'];

export const CATEGORY_COLORS: Record<Category, string> = {
  '蔬菜': '#22c55e',
  '肉類': '#ef4444',
  '海鮮': '#3b82f6',
  '乾貨': '#f59e0b',
  '調料': '#8b5cf6',
  '其他': '#64748b'
};
