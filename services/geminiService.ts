
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OrderItem } from "../types";

declare var process: any;

export const extractOrders = async (input: string | { data: string; mimeType: string }): Promise<OrderItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位專業的餐廳營運分析師與主廚。你的任務是從提供的資料中精確提取叫貨明細。
    
    提取原則：
    1. **品項識別**: 包含廚房食材與前台耗材（如外帶碗、餐巾紙、吸管、清潔劑）。
    2. **品項名稱**: 提取完整名稱（例：'750ml 外帶圓碗'、'三層抽取式面紙'）。
    3. **數量與單位**: 嚴格拆分（例：數量 '5', 單位 '箱'）。
    4. **價格 (price)**: 只輸出純數字字串。
    5. **分類 (Enum 嚴格執行)**: 
       - 必須歸類為以下之一：'生鮮類', '冷凍類', '乾貨類', '調料類', '消耗品'。
       - 消耗品: 特別注意包含所有前台用品、外帶包材（碗、蓋、袋）、餐巾紙、洗碗精、垃圾袋等非食材類別。

    輸出格式：返回標準 JSON 陣列。
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "品項名稱" },
        quantity: { type: Type.STRING, description: "數量" },
        unit: { type: Type.STRING, description: "單位" },
        price: { type: Type.STRING, description: "單價或估價" },
        category: { 
          type: Type.STRING, 
          enum: ['生鮮類', '冷凍類', '乾貨類', '調料類', '消耗品'],
          description: "分類標籤"
        },
        rawText: { type: Type.STRING, description: "來源文本段落" }
      },
      required: ["name", "quantity", "unit", "price", "category", "rawText"]
    }
  };

  const model = "gemini-3-pro-preview";
  let contents;

  if (typeof input === 'string') {
    contents = input;
  } else {
    contents = {
      parts: [
        { inlineData: { data: input.data, mimeType: input.mimeType || "image/jpeg" } },
        { text: "這是一張叫貨單，包含食材與消耗品。請整理出品項、數量、金額。請確保分類正確。" }
      ]
    };
  }

  try {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        thinkingConfig: { thinkingBudget: 2048 } 
      }
    });

    const text = result.text || "[]";
    const parsed = JSON.parse(text);
    return parsed.map((item: any, index: number) => ({
      ...item,
      id: `item-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
      orderDate: "" 
    }));
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
