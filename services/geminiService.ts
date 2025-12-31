
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OrderItem } from "../types";

declare var process: any;

export const extractOrders = async (input: string | { data: string; mimeType: string }): Promise<OrderItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位精通餐廳採購與財務管理的專業主廚。
    你的任務是精確地從「單據照片」、「手寫清單」或「LINE對話」中提取叫貨品項、數量、單位以及單價。

    提取規則：
    1. **品項名稱**: 準確提取食材或物品名稱（如：大白菜、去骨雞腿）。
    2. **數量與單位**: 必須分開提取（如：數量 "10", 單位 "公斤"）。
    3. **價格 (price)**: 
       - 提取單價或總價。只保留數字，不要加符號。
       - 如果圖片模糊或沒寫價格，請填寫 "0"，不可留空。
    4. **分類限制 (嚴格遵守)**: 
       - 必須歸類為以下之一：'生鮮類', '冷凍類', '乾貨類', '調料類', '消耗品'。
       - 生鮮類: 包含所有新鮮蔬菜、肉類、水果、海鮮。
       - 冷凍類: 包含所有加工冷凍品、冷凍肉品。
       - 乾貨類: 米、麵、豆類、乾粉類。
       - 調料類: 油、鹽、醬、醋、香料。
       - 消耗品: 紙巾、洗潔精、包裝盒。

    輸出格式：嚴格返回 JSON 格式的陣列。
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: "品項名稱" },
        quantity: { type: Type.STRING, description: "數量數字" },
        unit: { type: Type.STRING, description: "單位" },
        price: { type: Type.STRING, description: "單價或總額（僅數字）" },
        category: { 
          type: Type.STRING, 
          enum: ['生鮮類', '冷凍類', '乾貨類', '調料類', '消耗品'],
          description: "分類"
        },
        rawText: { type: Type.STRING, description: "原始參考文字" }
      },
      required: ["name", "quantity", "unit", "price", "category", "rawText"]
    }
  };

  const model = "gemini-3-flash-preview";
  let contents;

  if (typeof input === 'string') {
    contents = input;
  } else {
    // 確保圖片辨識時的 Prompt 足夠強大
    contents = {
      parts: [
        { inlineData: { data: input.data, mimeType: input.mimeType || "image/jpeg" } },
        { text: "請仔細辨識這張照片中的所有採購品項。如果單據上有金額請務必提取，若無則標記為 0。請根據品項性質正確分類。" }
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
        responseSchema
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
