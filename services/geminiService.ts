
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { OrderItem } from "../types";

export const extractOrders = async (input: string | { data: string; mimeType: string }): Promise<OrderItem[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    你是一位精通繁體中文的餐廳採購與財務稽核專家。
    你的任務是精確地從「出貨單照片」、「送貨單照片」或「手寫叫貨清單」中提取數據。
    
    分析指南：
    1. **表格導向**：出貨單通常是表格形式。請準確對齊「品項/名稱」、「數量」與「單位」。
    2. **手寫辨識**：針對台灣市場常見的手寫字（如：斤、箱、捆、粒）進行精準辨識。
    3. **智慧修正**：若字跡模糊，請根據上下文修正（例如：將「空心萊」修正為「空心菜」）。
    4. **排除雜項**：忽略單價、總額、稅金、廠商電話、日期、印章雜色等非品項統計資訊。
    5. **標準化分類**：將品項歸類為：蔬菜、肉類、海鮮、乾貨、調料、其他。
    
    輸出的 JSON 格式必須是一個陣列：
    - name: 品項名稱 (String)
    - quantity: 數量 (String/Number)
    - unit: 單位 (String, 如：斤, 盒, 支)
    - category: 分類 (必須是：蔬菜, 肉類, 海鮮, 乾貨, 調料, 其他)
    - rawText: 原始在單據上看到的文字內容
  `;

  const responseSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        quantity: { type: Type.STRING },
        unit: { type: Type.STRING },
        category: { 
          type: Type.STRING,
          description: "分類：蔬菜, 肉類, 海鮮, 乾貨, 調料, 其他"
        },
        rawText: { type: Type.STRING }
      },
      required: ["name", "quantity", "unit", "category", "rawText"]
    }
  };

  const model = "gemini-3-flash-preview";
  let contents;

  if (typeof input === 'string') {
    contents = input;
  } else {
    contents = {
      parts: [
        { 
          inlineData: {
            data: input.data,
            mimeType: input.mimeType
          } 
        },
        { text: "這是一張餐廳的出貨單照片。請幫我掃描並列出裡面所有的食材品項、數量與單位。請注意表格結構，不要跳行或漏掉品項。" }
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
      id: `item-${Date.now()}-${index}`
    }));
  } catch (error) {
    console.error("Gemini Extraction Error:", error);
    throw error;
  }
};
