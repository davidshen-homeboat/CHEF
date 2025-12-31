
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OrderItem } from "../types";

export const extractOrders = async (input: string | { data: string; mimeType: string }): Promise<OrderItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位精通餐廳採購與財務管理的專業主廚。
    你的任務是精確地從「單據照片」或「LINE對話」中提取叫貨品項、數量、單位以及【價格】。

    提取規則：
    1. **品項名稱**: 食材或物品名稱。
    2. **數量與單位**: 必須分開提取。
    3. **價格 (price)**: 如果單據上有寫單價或總價，請提取數值。若無，請填寫 "0"。
    4. **分類**: 
       - 生鮮類: 蔬菜、肉、海鮮。
       - 冷凍類: 冷凍食品。
       - 乾貨類: 米麵粉乾料。
       - 調料類: 醬油油鹽醬。
       - 消耗品: 包材清潔用品。

    輸出的 JSON 格式必須是一個陣列：
    - name: String
    - quantity: String
    - unit: String
    - price: String (僅填寫數字)
    - category: 分類名稱
    - rawText: 原始文字
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        quantity: { type: Type.STRING },
        unit: { type: Type.STRING },
        price: { type: Type.STRING },
        category: { type: Type.STRING },
        rawText: { type: Type.STRING }
      },
      required: ["name", "quantity", "unit", "price", "category", "rawText"]
    }
  };

  const model = "gemini-3-flash-preview";
  let contents;

  if (typeof input === 'string') {
    contents = input;
  } else {
    contents = {
      parts: [
        { inlineData: { data: input.data, mimeType: input.mimeType || "image/jpeg" } },
        { text: "這是一張叫貨單或收據。請辨識所有品項、數量、單位、以及【單價或金額】並進行分類。" }
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
      id: `item-${Date.now()}-${index}`,
      orderDate: "" 
    }));
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
